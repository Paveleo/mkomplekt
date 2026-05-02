from __future__ import annotations

import io
import re
import shutil
from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
from django.db.models import Model
from openpyxl import load_workbook


FLAT_IMPORT_HEADERS = {
    "title",
    "sku",
    "category_slug",
    "price",
    "thickness",
    "color",
    "material",
    "description",
    "is_published",
    "image1",
    "image2",
    "image3",
}


@dataclass
class CatalogImportNode:
    title: str
    depth: int
    sort: int
    children: list["CatalogImportNode"] = field(default_factory=list)


@dataclass
class CatalogImportSheet:
    title: str
    nodes: list[CatalogImportNode]


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9\u0400-\u04FF]+", "-", value.strip().lower())
    return slug.strip("-") or uuid4().hex[:12]


def make_unique_slug(model: type[Model], base: str, *, instance_pk=None) -> str:
    base_slug = slugify(base)
    slug = base_slug
    suffix = 1

    while True:
        queryset = model.objects.filter(slug=slug)
        if instance_pk is not None:
            queryset = queryset.exclude(pk=instance_pk)
        if not queryset.exists():
            return slug
        suffix += 1
        slug = f"{base_slug}-{suffix}"


def build_media_url(request, image_path: str | None) -> str | None:
    if not image_path:
        return None
    if image_path.startswith("http://") or image_path.startswith("https://"):
        return image_path
    return request.build_absolute_uri(f"{settings.MEDIA_URL}{image_path.lstrip('/')}")


def ensure_media_root() -> None:
    Path(settings.MEDIA_ROOT).mkdir(parents=True, exist_ok=True)


def remove_media_directory(*parts: str) -> None:
    target_dir = Path(settings.MEDIA_ROOT).joinpath(*parts)
    if target_dir.exists():
        shutil.rmtree(target_dir)


def remove_media_file(path_str: str | None) -> None:
    if not path_str:
        return

    target_path = Path(settings.MEDIA_ROOT) / path_str
    if target_path.exists():
        target_path.unlink()


def store_uploaded_file(scope: str, entity_id: str, file: UploadedFile, *, prefix: str) -> str:
    ensure_media_root()
    entity_dir = Path(settings.MEDIA_ROOT) / scope / entity_id
    entity_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(file.name).suffix.lower() or ".jpg"
    filename = f"{prefix}-{uuid4().hex}{extension}"
    target_path = entity_dir / filename
    with target_path.open("wb") as output:
        for chunk in file.chunks():
            output.write(chunk)
    return str(Path(scope) / entity_id / filename).replace("\\", "/")


def remove_product_media(product_id: str) -> None:
    remove_media_directory("products", product_id)


def replace_product_images(product_id: str, files: list[UploadedFile]) -> list[str]:
    ensure_media_root()
    remove_product_media(product_id)

    product_dir = Path(settings.MEDIA_ROOT) / "products" / product_id
    product_dir.mkdir(parents=True, exist_ok=True)

    stored_paths: list[str] = []
    for index, file in enumerate(files):
        extension = Path(file.name).suffix.lower() or ".jpg"
        filename = f"image-{index + 1}-{uuid4().hex}{extension}"
        target_path = product_dir / filename
        with target_path.open("wb") as output:
            for chunk in file.chunks():
                output.write(chunk)
        stored_paths.append(str(Path("products") / product_id / filename).replace("\\", "/"))

    return stored_paths


def append_product_images(product_id: str, files: list[UploadedFile], *, start_sort: int = 0) -> list[str]:
    ensure_media_root()

    product_dir = Path(settings.MEDIA_ROOT) / "products" / product_id
    product_dir.mkdir(parents=True, exist_ok=True)

    stored_paths: list[str] = []
    for offset, file in enumerate(files):
        extension = Path(file.name).suffix.lower() or ".jpg"
        filename = f"image-{start_sort + offset + 1}-{uuid4().hex}{extension}"
        target_path = product_dir / filename
        with target_path.open("wb") as output:
            for chunk in file.chunks():
                output.write(chunk)
        stored_paths.append(str(Path("products") / product_id / filename).replace("\\", "/"))

    return stored_paths


def normalize_cell_text(value) -> str:
    if value is None:
        return ""
    text = str(value).replace("\xa0", " ")
    return re.sub(r"\s+", " ", text.strip())


def cell_indent(value) -> int:
    if value is None:
        return 0
    text = str(value).replace("\xa0", " ")
    return len(text) - len(text.lstrip(" "))


def load_excel_workbook(file_bytes: bytes):
    return load_workbook(filename=io.BytesIO(file_bytes), read_only=True, data_only=True)


def parse_excel_upload(file_bytes: bytes) -> list[dict[str, str]]:
    workbook = load_excel_workbook(file_bytes)
    sheet = workbook.active

    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        return []

    header_index = next(
        (index for index, row in enumerate(rows) if any(normalize_cell_text(cell) for cell in row)),
        None,
    )
    if header_index is None:
        return []

    headers = [normalize_cell_text(cell).lower() for cell in rows[header_index]]
    if not any(headers):
        return []

    result: list[dict[str, str]] = []
    for row in rows[header_index + 1 :]:
        values = list(row) if row is not None else []
        if not any(value not in (None, "") for value in values):
            continue

        item: dict[str, str] = {}
        for index, header in enumerate(headers):
            if not header:
                continue
            value = values[index] if index < len(values) else None
            item[header] = normalize_cell_text(value)
        result.append(item)

    return result


def is_flat_excel_import(rows: list[dict[str, str]]) -> bool:
    if not rows:
        return False
    headers = set(rows[0].keys())
    return "title" in headers and bool(headers & FLAT_IMPORT_HEADERS)


def group_consecutive_columns(columns: list[int]) -> list[list[int]]:
    if not columns:
        return []

    groups: list[list[int]] = [[columns[0]]]
    for column in columns[1:]:
        if column == groups[-1][-1] + 1:
            groups[-1].append(column)
        else:
            groups.append([column])
    return groups


def parse_catalog_excel(file_bytes: bytes) -> list[CatalogImportSheet]:
    workbook = load_excel_workbook(file_bytes)
    parsed_sheets: list[CatalogImportSheet] = []

    for sheet in workbook.worksheets:
        rows = [list(row) for row in sheet.iter_rows(values_only=True)]
        used_columns = sorted(
            {
                index + 1
                for row in rows
                for index, value in enumerate(row)
                if normalize_cell_text(value)
            }
        )
        if not used_columns:
            continue

        root = CatalogImportNode(title=sheet.title, depth=-1, sort=0)
        for block in group_consecutive_columns(used_columns):
            stack: list[CatalogImportNode] = [root]
            block_origin = block[0]

            for row in rows:
                block_cells = []
                for column in block:
                    value = row[column - 1] if column - 1 < len(row) else None
                    if not normalize_cell_text(value):
                        continue
                    depth = (column - block_origin) * 100 + cell_indent(value)
                    block_cells.append((depth, normalize_cell_text(value)))

                for depth, title in block_cells:
                    while len(stack) > 1 and stack[-1].depth >= depth:
                        stack.pop()

                    parent = stack[-1]
                    node = CatalogImportNode(
                        title=title,
                        depth=depth,
                        sort=len(parent.children),
                    )
                    parent.children.append(node)
                    stack.append(node)

        if root.children:
            parsed_sheets.append(CatalogImportSheet(title=sheet.title, nodes=root.children))

    return parsed_sheets


def decimal_or_none(value) -> Decimal | None:
    if value in (None, ""):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as exc:
        raise ValueError("INVALID_DECIMAL") from exc


def bool_from_value(value, *, default: bool = True) -> bool:
    if value in (None, ""):
        return default
    return str(value).strip().lower() not in {"false", "0", "off", "no"}


def ticket_number() -> str:
    return f"TKT-{uuid4().hex[:8].upper()}"
