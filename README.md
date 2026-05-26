# Wolfgang Finger — Art Gallery & Shop

Next.js 16 (App Router) · TypeScript · Tailwind CSS · Supabase · Stripe · Vercel

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe Checkout (hosted) |
| Deploy | Vercel |
| Validation | Zod |
| Forms | react-hook-form + @hookform/resolvers |

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo>
cd wolfgang-finger
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Run the migration in `supabase/migrations/0001_initial.sql` via the SQL editor
3. In **Storage**, create a **public** bucket named `artwork-images`
4. Copy the project URL and keys from Settings → API

### 3. Create a Stripe account

1. Go to [stripe.com](https://stripe.com) → Developer mode ON
2. Copy the test API keys from Dashboard → API keys
3. Set up a webhook:
   - Endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`

### 4. Set environment variables

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Run locally

```bash
# Terminal 1 — Next.js dev server
npm run dev

# Terminal 2 — Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Open [http://localhost:3000](http://localhost:3000)

---

## Admin Setup

1. Navigate to `/admin/login`
2. Enter the admin email address
3. Click the magic link in your inbox

The admin panel is at `/admin`:
- **Dashboard** — stats + recent orders
- **Artworks** — add/edit works, upload images, set as featured
- **Orders** — view orders, update shipping status
- **Messages** — read contact form submissions

---

## Project Structure

```
src/
  app/
    (public)/           # Public site (gallery, shop, blog, about, contact)
    admin/              # Protected admin panel
    api/                # artworks, checkout, webhooks, contact
    auth/callback/      # Supabase auth callback
    sitemap.ts          # Dynamic sitemap with artwork slugs
    robots.ts           # Disallows /admin
  components/
    ui/                 # Button, Input, Badge
    admin/              # ArtworkForm, ImageUpload, OrdersTable
    artwork-card.tsx    # Gallery card with sold overlay
    artwork-grid.tsx    # Responsive grid
    nav.tsx             # Mobile-responsive nav with cart count
    footer.tsx
    contact-form.tsx
  context/
    cart.tsx            # Cart state (localStorage-persisted)
  lib/
    supabase/           # Browser, server, static, and proxy clients
    stripe.ts           # Lazy Stripe instance (avoids build-time init)
    validations.ts      # Zod schemas
    utils.ts
  types/
    database.ts         # TypeScript types for all DB tables
  proxy.ts              # Auth guard — protects /admin/* routes
supabase/
  migrations/
    0001_initial.sql    # Full schema with RLS policies
```

---

## Stripe Shipping Rates

| Medium | Rate |
|--------|------|
| Painting | $25 |
| Print | $15 |
| Sculpture | $75 |
| Glass | $75 |

Originals are marked `is_sold = true` after purchase. Prints decrement `stock_quantity`.

---

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Add all environment variables
4. Set `NEXT_PUBLIC_SITE_URL` to your production URL
5. Update the Stripe webhook endpoint to your production URL
