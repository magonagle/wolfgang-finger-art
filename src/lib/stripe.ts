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

/** Flat shipping rates in cents by medium (originals only). */
export const SHIPPING_RATES: Record<string, number> = {
  painting:  2500,
  sculpture: 7500,
  glass:     7500,
}

export function getShippingCost(medium: string): number {
  return SHIPPING_RATES[medium] ?? 2500
}
