-- Add sort_order to artworks for manual gallery ordering
alter table artworks add column if not exists sort_order integer not null default 0;

-- Initialise: preserve current display order (newest-first = lowest sort_order)
with ranked as (
  select id, (row_number() over (order by created_at desc) - 1) as rn
  from artworks
)
update artworks
set sort_order = ranked.rn
from ranked
where artworks.id = ranked.id;

-- Index for fast ordering
create index if not exists artworks_sort_order_idx on artworks (sort_order);
