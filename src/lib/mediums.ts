/**
 * Central mediums configuration.
 * To add or rename a category:
 *   1. Add/update an entry here
 *   2. Add the new value to the Medium type in src/types/database.ts
 *   3. Run a Supabase migration to update the artworks.medium check constraint
 *
 * The `value` must match exactly what is stored in the database.
 * The `label` is what visitors see — change it freely without touching the DB.
 */
export const MEDIUMS = [
  { label: 'Paintings',     value: 'painting',    num: '02' },
  { label: 'Wood Carvings', value: 'sculpture',   num: '03' },
  { label: 'Flamework',     value: 'glass',       num: '04' },
] as const

export type MediumValue = typeof MEDIUMS[number]['value']

/** All mediums including the "All Works" catch-all used on the gallery page */
export const GALLERY_FILTERS = [
  { label: 'All Works', value: 'all' as const, num: '01' },
  ...MEDIUMS,
]
