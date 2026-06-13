import Stripe from 'stripe'

let _stripe: Stripe | null = null

/** Returns a Stripe instance. Call at request-time only, never at module scope. */
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-04-22.dahlia',
      typescript: true,
    })
  }
  return _stripe
}

/** Fallback flat shipping rates in cents by category (used when no per-artwork rate is set). */
export const SHIPPING_RATES: Record<string, number> = {
  painting:  2500,
  sculpture: 2000,
  glass:     2200,
}

export function getShippingCost(category: string): number {
  return SHIPPING_RATES[category] ?? 2500
}
