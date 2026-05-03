from __future__ import annotations

import re
import urllib.parse
import xml.etree.ElementTree as ET
from functools import lru_cache

from .utils import fetch_url_text


BOYARD_BASE_URL = "https://www.boyard.biz"
BOYARD_SITEMAP_URL = f"{BOYARD_BASE_URL}/sitemap.xml"
SLOTEX_BASE_URL = "https://market.slotex.ru"
SLOTEX_SITEMAP_URL = f"{SLOTEX_BASE_URL}/sitemap.xml"
KRONOSPAN_BASE_URL = "https://kronospan.com"

LOOKUP_TOKEN_RE = re.compile(r"[a-z0-9\u0400-\u04ff]+", re.IGNORECASE)
CODE_TOKEN_RE = re.compile(r"[a-z]*\d[\da-z_-]*", re.IGNORECASE)
TITLE_RE = re.compile(r"<title>\s*(.*?)\s*</title>", re.IGNORECASE | re.DOTALL)
OG_IMAGE_RE = re.compile(
    r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
IMG_RE = re.compile(
    r'<img[^>]+(?:src|data-src|data-lazy|data-original)=["\']([^"\']+)["\'][^>]*>',
    re.IGNORECASE,
)
BOYARD_SEARCH_LINK_RE = re.compile(r'href="(?:https://www\.boyard\.biz)?(/catalog/[^"#?]+)"')

BOYARD_CATEGORY_RULES = [
    (("ручк",), f"{BOYARD_BASE_URL}/catalog/handles"),
    (("крюч", "вешал"), f"{BOYARD_BASE_URL}/catalog/hangers"),
    (("опор", "ножк", "колес"), f"{BOYARD_BASE_URL}/catalog/supports"),
    (("полкодерж",), f"{BOYARD_BASE_URL}/catalog/shelf"),
    (("направля", "выдвиж", "ящик"), f"{BOYARD_BASE_URL}/catalog/slide_systems"),
    (("петл",), f"{BOYARD_BASE_URL}/catalog/hinges_systems"),
    (("корзин", "карго"), f"{BOYARD_BASE_URL}/catalog/baskets"),
    (("сушк",), f"{BOYARD_BASE_URL}/catalog/dryers"),
    (("лифт",), f"{BOYARD_BASE_URL}/catalog/gas_lifts"),
    (("замк",), f"{BOYARD_BASE_URL}/catalog/locks"),
    (("навес",), f"{BOYARD_BASE_URL}/catalog/shed"),
    (("демпф", "отталкив", "магнит"), f"{BOYARD_BASE_URL}/catalog/catch_and_push_systems"),
    (("крепеж", "метиз", "конфирмат"), f"{BOYARD_BASE_URL}/catalog/fastening"),
]

SLOTEX_CATEGORY_RULES = [
    (("компакт",), f"{SLOTEX_BASE_URL}/catalog/kompakt_laminat/"),
    (("столеш",), f"{SLOTEX_BASE_URL}/catalog/stoleshnitsa/"),
    (("фасад",), f"{SLOTEX_BASE_URL}/catalog/fasadnoe_polotno/"),
    (("панел", "стенов"), f"{SLOTEX_BASE_URL}/catalog/pristennaya_panel/"),
    (("лдсп",), f"{SLOTEX_BASE_URL}/catalog/mebelnye_plity/ldsp/"),
    (("плит", "дсп", "мебельн"), f"{SLOTEX_BASE_URL}/catalog/mebelnye_plity/"),
    (("плинтус",), f"{SLOTEX_BASE_URL}/catalog/aksessuary/plintusy/"),
    (("аксессуар",), f"{SLOTEX_BASE_URL}/catalog/aksessuary/"),
]

KRONOSPAN_CATEGORY_RULES = [
    (("лдсп", "декор", "плит", "дсп"), f"{KRONOSPAN_BASE_URL}/ru_AM/decors/by_collection/kronodesign/"),
    (("столеш",), f"{KRONOSPAN_BASE_URL}/ru_AM/products/by_category/kronodesign/stoleshnic/"),
]


def normalize_lookup_text(value: str | None) -> str:
    return " ".join(str(value or "").strip().lower().split())


def lookup_tokens(value: str | None) -> list[str]:
    return [token.lower() for token in LOOKUP_TOKEN_RE.findall(str(value or ""))]


def code_tokens(*values: str | None) -> list[str]:
    tokens: list[str] = []
    seen: set[str] = set()
    for value in values:
        for token in CODE_TOKEN_RE.findall(str(value or "")):
            normalized = token.lower()
            if normalized in seen:
                continue
            seen.add(normalized)
            tokens.append(normalized)
    return tokens


def absolutize(base_url: str, maybe_relative: str | None) -> str | None:
    value = str(maybe_relative or "").strip()
    if not value:
        return None
    return urllib.parse.urljoin(base_url, value)


def is_usable_image_url(url: str | None) -> bool:
    value = str(url or "").strip().lower()
    if not value:
        return False
    if any(
        token in value
        for token in (
            "mail.ru/counter",
            "mc.yandex.ru/watch",
            "logo",
            "favicon",
            "search.svg",
            "close.svg",
            "empty-result",
            "/local/assets/img/og/",
            "slotex-1024x512",
            ".svg",
        )
    ):
        return False
    return True


def extract_first_content_image(html: str, page_url: str) -> str | None:
    candidates: list[tuple[int, str]] = []
    seen: set[str] = set()

    for match in IMG_RE.finditer(html):
        absolute_url = absolutize(page_url, match.group(1))
        if not absolute_url or absolute_url in seen or not is_usable_image_url(absolute_url):
            continue
        seen.add(absolute_url)

        lowered = absolute_url.lower()
        score = 0
        if "slider_big" in lowered:
            score += 100
        if "product_list" in lowered:
            score += 80
        if "/upload/" in lowered:
            score += 60
        if "resize_cache" in lowered:
            score += 30
        if lowered.endswith((".jpg", ".jpeg", ".png", ".webp", ".avif")):
            score += 10
        candidates.append((score, absolute_url))

    if not candidates:
        return None
    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1]


@lru_cache(maxsize=2048)
def fetch_page_meta(url: str) -> tuple[str, str | None]:
    html = fetch_url_text(url)
    title_match = TITLE_RE.search(html)
    title = " ".join((title_match.group(1) if title_match else "").split())
    image_match = OG_IMAGE_RE.search(html)
    image_url = absolutize(url, image_match.group(1) if image_match else None)
    if not is_usable_image_url(image_url):
        image_url = extract_first_content_image(html, url)
    return title, image_url


@lru_cache(maxsize=64)
def fetch_sitemap_urls(sitemap_url: str) -> tuple[str, ...]:
    xml_text = fetch_url_text(sitemap_url)
    root = ET.fromstring(xml_text)
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

    sitemap_nodes = root.findall("sm:sitemap", namespace)
    if sitemap_nodes:
        urls: list[str] = []
        for node in sitemap_nodes:
            loc = (node.findtext("sm:loc", default="", namespaces=namespace) or "").strip()
            if not loc:
                continue
            urls.extend(fetch_sitemap_urls(loc))
        return tuple(dict.fromkeys(urls))

    url_nodes = root.findall("sm:url", namespace)
    urls = [
        (node.findtext("sm:loc", default="", namespaces=namespace) or "").strip()
        for node in url_nodes
    ]
    return tuple(url for url in urls if url)


@lru_cache(maxsize=128)
def boyard_search_links(query: str) -> tuple[str, ...]:
    normalized = normalize_lookup_text(query)
    if not normalized:
        return ()
    encoded = urllib.parse.quote(normalized)
    html = fetch_url_text(f"{BOYARD_BASE_URL}/search?query={encoded}")
    urls: list[str] = []
    for match in BOYARD_SEARCH_LINK_RE.finditer(html):
        path = match.group(1)
        if ".html" not in path:
            continue
        urls.append(urllib.parse.urljoin(BOYARD_BASE_URL, path))
    return tuple(dict.fromkeys(urls))


@lru_cache(maxsize=1)
def slotex_sitemap_urls() -> tuple[str, ...]:
    return fetch_sitemap_urls(SLOTEX_SITEMAP_URL)


@lru_cache(maxsize=1)
def boyard_sitemap_urls() -> tuple[str, ...]:
    return fetch_sitemap_urls(BOYARD_SITEMAP_URL)


def score_candidate(query: str, url: str, title: str, *, codes: list[str]) -> int:
    normalized_query = normalize_lookup_text(query)
    normalized_title = normalize_lookup_text(title)
    haystack = f"{normalized_title} {normalize_lookup_text(urllib.parse.unquote(url))}"

    score = 0
    if normalized_query and normalized_query in haystack:
        score += 80

    query_tokens = set(lookup_tokens(query))
    title_tokens = set(lookup_tokens(title)) | set(lookup_tokens(urllib.parse.unquote(url)))
    score += len(query_tokens & title_tokens) * 10

    url_lower = url.lower()
    title_lower = title.lower()
    for code in codes:
        if code in url_lower:
            score += 120
        if code in title_lower:
            score += 90

    return score


def find_best_page(
    query: str,
    urls: list[str],
    *,
    codes: list[str] | None = None,
) -> str | None:
    best_url: str | None = None
    best_score = 0
    code_list = codes or []

    for url in urls:
        try:
            title, image_url = fetch_page_meta(url)
        except Exception:
            continue
        if not image_url:
            continue
        score = score_candidate(query, url, title, codes=code_list)
        if score > best_score:
            best_score = score
            best_url = image_url

    return best_url if best_score > 0 else None


def rule_based_category_url(title: str, rules: list[tuple[tuple[str, ...], str]]) -> str | None:
    normalized = normalize_lookup_text(title)
    for keywords, url in rules:
        if any(keyword in normalized for keyword in keywords):
            return url
    return None


def autoparse_category_image_source(title: str, *, parent_title: str | None = None, slug: str | None = None) -> str | None:
    context = " ".join(filter(None, [title, parent_title, slug]))

    for rules in (BOYARD_CATEGORY_RULES, SLOTEX_CATEGORY_RULES, KRONOSPAN_CATEGORY_RULES):
        category_url = rule_based_category_url(context, rules)
        if not category_url:
            continue
        try:
            _, image_url = fetch_page_meta(category_url)
        except Exception:
            continue
        if image_url:
            return image_url

    return None


def autoparse_product_image_sources(
    title: str,
    *,
    sku: str | None = None,
    category_title: str | None = None,
    category_slug: str | None = None,
) -> list[str]:
    query = " ".join(filter(None, [title, sku]))
    category_context = " ".join(filter(None, [category_title, category_slug]))
    codes = code_tokens(title, sku)

    normalized_context = normalize_lookup_text(category_context)
    if any(keyword in normalized_context for keyword in ("ручк", "петл", "фурнит", "направля", "замк", "крепеж", "лифт")):
        try:
            candidates = list(boyard_search_links(sku or title))
            best = find_best_page(query, candidates, codes=codes)
            if best:
                return [best]
        except Exception:
            pass

    if any(keyword in normalized_context for keyword in ("лдсп", "столеш", "фасад", "панел", "плит", "декор", "компакт")) and codes:
        try:
            slotex_candidates = [
                url
                for url in slotex_sitemap_urls()
                if "/catalog/" in url and any(code in url.lower() for code in codes)
            ]
            best = find_best_page(query, slotex_candidates[:40], codes=codes)
            if best:
                return [best]
        except Exception:
            pass

    return []
