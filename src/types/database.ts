export type Medium = 'painting' | 'sculpture' | 'glass'
export type Edition = 'original'
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export interface Artwork {
  id: string
  slug: string
  title: string
  description: string | null
  medium: Medium
  edition: Edition
  price: number
  stock_quantity: number | null  // retained in DB, always null for originals
  is_sold: boolean
  is_featured: boolean
  is_hero: boolean
  sort_order: number
  dimensions: string | null
  year_created: number | null
  shipping_cost: number | null
  created_at: string
  updated_at: string
}

export interface ArtworkImage {
  id: string
  artwork_id: string
  storage_path: string
  alt_text: string | null
  sort_order: number
  is_primary: boolean
}

export interface ArtworkWithImages extends Artwork {
  artwork_images: ArtworkImage[]
}

export interface Order {
  id: string
  stripe_session_id: string
  stripe_payment_intent: string | null
  customer_email: string
  customer_name: string | null
  shipping_address: ShippingAddress | null
  subtotal: number
  shipping_cost: number
  total: number
  status: OrderStatus
  tracking_number: string | null
  created_at: string
  updated_at: string
}

export interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface OrderItem {
  id: string
  order_id: string
  artwork_id: string
  price_at_purchase: number
  quantity: number
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { artwork: Artwork })[]
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  is_read: boolean
  is_archived: boolean
  created_at: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  cover_image: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface CartItem {
  artwork: ArtworkWithImages
  quantity: number
}
