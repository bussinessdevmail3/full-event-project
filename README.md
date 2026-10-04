# EventPlace — Event Booking Platform

## Overview

EventPlace is a premium event booking platform for discovering and booking event suppliers in Israel. The platform initially focuses on **Event Venues** and **Singers/Artists**, with architecture designed to expand to additional categories (photographers, DJs, decorators, catering, makeup artists, bands, and more).

**Tagline:** *One date. All available event suppliers.*

## Phase 1 — Customer App

This phase delivers:
- A React Native + Expo customer mobile app
- A shared Supabase backend (PostgreSQL, Auth, Storage, Realtime, RLS, Edge Functions)

The backend is designed to support future applications (Supplier App, Supplier Web Dashboard, Admin Dashboard) without rebuilding.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native, Expo, TypeScript |
| Navigation | Expo Router |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime) |
| Server State | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Internationalization | i18next + react-i18next |
| Images | Expo Image |
| Secure Storage | Expo SecureStore |
| Fonts | Rubik (Hebrew), Cairo (Arabic) |
| Icons | Lucide React Native |

## Languages & RTL

The app supports two languages from launch:
- **Hebrew** (עברית)
- **Arabic** (العربية)

Both use proper RTL layout. Users can switch languages from Settings. Translation files are in `src/translations/he.json` and `src/translations/ar.json`.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Expo Go app on your phone (or an emulator)

### Installation

```bash
npm install
```

### Running the App

```bash
npx expo start
```

Scan the QR code with Expo Go (iOS) or the Expo Go app (Android).

If your phone can't connect via the local network:

```bash
npx expo start --tunnel
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

All migrations and seed data are applied automatically via Supabase MCP tools. The database includes:

### Core Tables
- `regions`, `cities` — Location system
- `supplier_types`, `service_categories` — Extensible supplier types
- `amenities`, `genres`, `event_types` — Reference data
- `profiles`, `customer_profiles`, `supplier_profiles` — User profiles with roles
- `venues`, `artists` — Supplier-type-specific details
- `supplier_service_areas`, `venue_amenities`, `artist_genres` — Many-to-many
- `supplier_packages`, `media` — Supplier offerings and images
- `events` — Customer events
- `availability` — Supplier date availability (unique constraint prevents double-booking)
- `favorites` — Customer favorite suppliers
- `booking_requests`, `booking_status_history` — Booking workflow
- `quotations`, `quotation_items` — Supplier quotations
- `reviews` — Customer reviews
- `notifications` — User notifications
- `conversations`, `messages` — Chat architecture
- `payments`, `payment_transactions`, `commission_records` — Payment architecture

### Security
- Row Level Security (RLS) on every table
- Customer can only access their own data (events, favorites, notifications)
- Supplier profiles are publicly readable only when `verification_status = 'approved'`
- Booking status transitions cannot be bypassed by customers
- Reviews are public but only verified customers can create them

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout (providers, fonts)
│   ├── auth.tsx            # Login/Register screen
│   ├── index.tsx           # Auth redirect
│   ├── (tabs)/             # Tab navigation
│   │   ├── _layout.tsx     # Tab bar configuration
│   │   ├── index.tsx       # Home screen
│   │   ├── explore.tsx     # Search & filter
│   │   ├── event.tsx       # My Event
│   │   ├── messages.tsx    # Messages (empty state)
│   │   └── profile.tsx     # Profile & settings
│   ├── venue/[id].tsx      # Venue detail page
│   └── artist/[id].tsx     # Artist detail page
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Design system primitives
│   │   ├── VenueCard.tsx
│   │   ├── ArtistCard.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   └── SectionHeader.tsx
│   ├── services/           # Business logic
│   │   ├── supabase.ts     # Supabase client
│   │   ├── auth.tsx        # Auth context
│   │   ├── database.ts     # Database queries
│   │   ├── i18n.tsx        # i18n context
│   │   ├── query.tsx       # React Query provider
│   │   └── storage.ts      # Secure storage
│   ├── theme/              # Design tokens
│   │   └── tokens.ts       # Colors, spacing, fonts, shadows
│   ├── translations/       # i18n translation files
│   │   ├── he.json
│   │   └── ar.json
│   ├── i18n/               # i18n configuration
│   │   └── config.ts
│   └── types/              # TypeScript types
│       └── index.ts
├── supabase/               # Supabase config & edge functions
├── app.json                # Expo configuration
├── package.json
└── .env                    # Environment variables
```

## Features

### Implemented & Working
- Hebrew & Arabic with full RTL support
- Email/password authentication (register, login, logout, password reset)
- Customer profile (edit name, phone, avatar initial)
- Home screen with search section, featured venues, popular singers
- Explore screen with venue & artist search, filters, sorting
- Venue detail page with gallery, amenities, availability calendar, reviews
- Artist detail page with biography, genres, packages, availability, reviews
- Favorites (add/remove, persisted to database)
- My Event (create, edit, delete events)
- Event planning status (venue & singer booking status)
- Availability calendar with color-coded statuses
- Loading states, skeleton loaders, empty states
- Language switching from Settings

### Architecture Prepared (Not Yet Built)
- Supplier App and Supplier Web Dashboard
- Admin Dashboard
- Complete booking workflow (request → offer → payment → confirmation)
- Chat/messaging interface
- Push notifications
- Payment gateway integration
- AI event planner
- Combined venue + singer search

## Building for Production

### iOS
```bash
npx eas build --platform ios
npx eas submit --platform ios
```

### Android
```bash
npx eas build --platform android
npx eas submit --platform android
```

## Future Architecture

The database schema supports:
- **Supplier roles** with verification workflow (pending → approved → suspended)
- **Multiple supplier types** (venue, singer, photographer, DJ, decorator, catering, makeup, band, etc.)
- **Booking workflow** with typed statuses (REQUESTED → SUPPLIER_REVIEWING → OFFER_SENT → CUSTOMER_ACCEPTED → PAYMENT_PENDING → CONFIRMED → COMPLETED)
- **Quotation system** with line items
- **Chat** between customers and suppliers
- **Payment architecture** (deposit, final, full) with commission records
- **Admin capabilities** (approve/reject/verify/suspend suppliers, manage content)
