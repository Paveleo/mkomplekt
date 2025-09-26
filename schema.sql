-- (same content as before, see truncated for brevity)
-- categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  parent_id uuid references public.categories(id) on delete set null,
  image_url text,
  sort int default 0
);
-- products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  sku text unique,
  category_id uuid not null references public.categories(id) on delete cascade,
  price numeric(12,2),
  thickness numeric(6,2),
  color text,
  material text,
  description text,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- product_images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort int default 0
);
create index if not exists idx_categories_parent on public.categories(parent_id);
create index if not exists idx_products_category on public.products(category_id);

create or replace function slugify(txt text)
returns text language sql immutable as $$
  select lower(regexp_replace(trim(txt), '[^a-zA-Z0-9а-яА-Я]+', '-', 'g'));
$$;

create or replace function trg_products_set_slug()
returns trigger language plpgsql as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := slugify(coalesce(new.title,'') || '-' || coalesce(new.sku, substr(md5(random()::text),1,6)));
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_product_slug on public.products;
create trigger set_product_slug
before insert or update on public.products
for each row execute function trg_products_set_slug();

-- RLS enable
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.products add column if not exists sort int default 0;

-- read policies
create policy categories_read on public.categories
  for select
  using (true);

create policy products_read on public.products
  for select
  using (true);

create policy images_read on public.product_images
  for select
  using (true);

-- write policies
create policy categories_write on public.categories
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy products_write on public.products
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy images_write on public.product_images
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
