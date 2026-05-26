import { z } from 'zod'

export const artworkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  medium: z.enum(['painting', 'sculpture', 'glass']),
  price: z.number().positive('Price must be positive'),
  dimensions: z.string().optional(),
  year_created: z.number().int().min(1900).max(new Date().getFullYear()).nullable().optional(),
  is_featured: z.boolean(),
  is_hero: z.boolean(),
  is_sold: z.boolean(),
})

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
})

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
})

export type ArtworkFormData = z.infer<typeof artworkSchema>
export type ContactFormData = z.infer<typeof contactSchema>
