# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `nvm use 20 && npm run dev` (requires Node 20+, see `.nvmrc`)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **No test framework configured yet**

## Architecture

This is a Next.js 15 (App Router, Turbopack) catalog app for selling used household items. It uses Supabase for database (PostgreSQL), auth, and image storage. Deployed on Vercel.

### Two-module structure

- **Public catalog** (`/`) — Server-rendered product grid with category filters, product detail modal, WhatsApp contact buttons, and footer with bank/pickup info. All data fetched server-side from Supabase.
- **Admin panel** (`/admin/*`) — Client-side CRUD for products, image uploads, and store configuration. Protected by Supabase Auth via Next.js middleware (`src/middleware.ts` → only matches `/admin/:path*`).

### Supabase integration

Three clients exist for different contexts:
- `lib/supabase/client.ts` — browser client (used in `"use client"` components)
- `lib/supabase/server.ts` — server client with cookie-based sessions (used in Server Components and API routes)
- `lib/supabase/middleware.ts` — session refresh in Next.js middleware

### API routes pattern

Public endpoints (`/api/products`, `/api/config`) require no auth. Admin endpoints (`/api/admin/*`) verify `supabase.auth.getUser()` server-side before proceeding. Image uploads use FormData with files stored in the `product-images` Supabase Storage bucket.

### Database

Three tables: `products`, `product_images` (FK to products with CASCADE delete), `store_config` (singleton, id always = 1). Schema in `supabase/migrations/001_initial_schema.sql`. RLS enabled: public read, authenticated write.

### Styling

Tailwind CSS 4 with a custom nude/pastel brand palette (`brand-50` through `brand-900`) defined as CSS variables in `globals.css` and mapped via `@theme inline`. The public catalog uses brand colors; the admin uses neutral grays. Utility: `cn()` from `lib/utils.ts` (clsx + tailwind-merge).

### Key conventions

- Product delivery method: `null` means inherit from store config; explicit value overrides it
- WhatsApp links use `https://wa.me/{phone}?text={message}` — no API integration
- The site is intentionally non-indexable (meta robots noindex + X-Robots-Tag header)
- Types in `lib/types.ts`, enum labels in `lib/constants.ts`
- All language is Spanish (Ecuador market, USD currency)

### Spec-Driven Development (SDD)

This project follows a Spec-Driven Development process. See [`docs/sdd-process.md`](docs/sdd-process.md) for the full methodology.

- Features in progress: `docs/wip/{NNN}-{feature-name}/`
- Completed features: `docs/done/{NNN}-{feature-name}/`
- Each feature folder contains 3 specs: functional, technical, and implementation plan
- When starting a new feature, scaffold the folder with template files (see `sdd-process.md` for templates)
- Specs must be approved sequentially before advancing to the next phase

### Environment variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
