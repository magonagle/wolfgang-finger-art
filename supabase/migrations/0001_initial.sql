-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Artworks
create table artworks (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  title           text not null,
  description     text,
  medium          text not null check (medium in ('painting','sculpture','glass')),
  edition         text not null default 'original' check (edition in ('original','print')),
  price           numeric(10,2) not null,
  stock_quantity  int,
  is_sold         boolean not null default false,
  is_featured     boolean not null default false,
  dimensions      text,
  year_created    int,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Artwork images (multiple per artwork, ordered)
create table artwork_images (
  id            uuid primary key default uuid_generate_v4(),
  artwork_id    uuid not null references artworks(id) on delete cascade,
  storage_path  text not null,
  alt_text      text,
  sort_order    int not null default 0,
  is_primary    boolean not null default false
);

-- Orders
create table orders (
  id                      uuid primary key default uuid_generate_v4(),
  stripe_session_id       text unique not null,
  stripe_payment_intent   text,
  customer_email          text not null,
  customer_name           text,
  shipping_address        jsonb,
  subtotal                numeric(10,2) not null,
  shipping_cost           numeric(10,2) not null default 0,
  total                   numeric(10,2) not null,
  status                  text not null default 'pending'
                          check (status in ('pending','paid','shipped','delivered','cancelled')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Order items
create table order_items (
  id                  uuid primary key default uuid_generate_v4(),
  order_id            uuid not null references orders(id) on delete cascade,
  artwork_id          uuid not null references artworks(id),
  price_at_purchase   numeric(10,2) not null,
  quantity            int not null default 1
);

-- Contact messages
create table contact_messages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text not null,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Blog posts
create table blog_posts (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  title       text not null,
  excerpt     text,
  content     text not null,
  cover_image text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger artworks_updated_at
  before update on artworks
  for each row execute function update_updated_at();

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function update_updated_at();

-- Row Level Security
alter table artworks enable row level security;
alter table artwork_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table contact_messages enable row level security;
alter table blog_posts enable row level security;

-- Public can read artworks and images
create policy "artworks_public_read"
  on artworks for select using (true);

create policy "artwork_images_public_read"
  on artwork_images for select using (true);

create policy "blog_posts_public_read"
  on blog_posts for select using (is_published = true);

-- Only authenticated (admin) can write
create policy "artworks_admin_write"
  on artworks for all using (auth.role() = 'authenticated');

create policy "artwork_images_admin_write"
  on artwork_images for all using (auth.role() = 'authenticated');

create policy "orders_admin_all"
  on orders for all using (auth.role() = 'authenticated');

create policy "order_items_admin_all"
  on order_items for all using (auth.role() = 'authenticated');

create policy "contact_messages_admin_all"
  on contact_messages for all using (auth.role() = 'authenticated');

create policy "blog_posts_admin_all"
  on blog_posts for all using (auth.role() = 'authenticated');
