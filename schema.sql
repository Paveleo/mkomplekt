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

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'ordered', 'abandoned')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (cart_id, product_id)
);

create unique index if not exists idx_carts_active_user
  on public.carts(user_id)
  where status = 'active';

create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);
create index if not exists idx_cart_items_product_id on public.cart_items(product_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_carts_updated_at on public.carts;
create trigger set_carts_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

create policy profiles_read_own on public.profiles
  for select
  using (auth.uid() = id);

create policy profiles_insert_own on public.profiles
  for insert
  with check (auth.uid() = id);

create policy profiles_update_own on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy carts_read_own on public.carts
  for select
  using (auth.uid() = user_id);

create policy carts_insert_own on public.carts
  for insert
  with check (auth.uid() = user_id);

create policy carts_update_own on public.carts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy carts_delete_own on public.carts
  for delete
  using (auth.uid() = user_id);

create policy cart_items_read_own on public.cart_items
  for select
  using (
    exists (
      select 1
      from public.carts
      where public.carts.id = public.cart_items.cart_id
        and public.carts.user_id = auth.uid()
    )
  );

create policy cart_items_insert_own on public.cart_items
  for insert
  with check (
    exists (
      select 1
      from public.carts
      where public.carts.id = public.cart_items.cart_id
        and public.carts.user_id = auth.uid()
    )
  );

create policy cart_items_update_own on public.cart_items
  for update
  using (
    exists (
      select 1
      from public.carts
      where public.carts.id = public.cart_items.cart_id
        and public.carts.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.carts
      where public.carts.id = public.cart_items.cart_id
        and public.carts.user_id = auth.uid()
    )
  );

create policy cart_items_delete_own on public.cart_items
  for delete
  using (
    exists (
      select 1
      from public.carts
      where public.carts.id = public.cart_items.cart_id
        and public.carts.user_id = auth.uid()
    )
  );
