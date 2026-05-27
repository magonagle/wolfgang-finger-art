import { z } from 'zod'

export const artworkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  medium: z.enum(['painting', 'sculpture', 'glass']),
  price: z.number({ error: 'Price is required' }).positive('Price must be greater than 0'),
  dimensions: z.string().optional(),
  year_created: z.number({ error: 'Year must be a number' }).int('Year must be a whole number').min(1900, 'Year must be 1900 or later').max(new Date().getFullYear(), 'Year cannot be in the future').nullable().optional(),
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
