export const CATEGORIES = [
  { label: 'Paintings',     value: 'painting',    num: '02' },
  { label: 'Wood Carvings', value: 'sculpture',   num: '03' },
  { label: 'Flamework',     value: 'glass',       num: '04' },
] as const

export type CategoryValue = typeof CATEGORIES[number]['value']

/** All categories including the "All Works" catch-all used on the gallery page */
export const GALLERY_FILTERS = [
  { label: 'All Works', value: 'all' as const, num: '01' },
  ...CATEGORIES,
]
