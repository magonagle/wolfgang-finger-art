-- Add is_hero flag to artworks
-- Separates "hero banner" from "featured in grid" — only one work should be hero at a time
alter table artworks add column is_hero boolean not null default false;
