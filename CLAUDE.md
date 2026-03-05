# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AV Playlist Manager is a Next.js 15 application for managing video code collections. It uses an **ID-first approach**: users manage video codes (e.g., `SSIS-123`, `FC2-PPV-1234567`) rather than URLs, with source templates allowing auto-generation of URLs from codes.

**Tech Stack:**
- Next.js 15 App Router with TypeScript
- Supabase Auth (Magic Links + OAuth) and Postgres
- Prisma ORM
- shadcn/ui components (Radix UI + Tailwind CSS)

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database (requires .env.local loaded)
npm run db:push          # Push Prisma schema to database (uses dotenv-cli)
npm run db:studio        # Open Prisma Studio GUI
npm run db:generate      # Generate Prisma Client

# Direct Prisma commands (if needed)
dotenv -e .env.local -- prisma migrate dev --name <migration-name>
dotenv -e .env.local -- prisma db push
```

**Important:** Prisma commands require environment variables from `.env.local`. Use `dotenv -e .env.local --` prefix or the npm scripts which include it automatically.

## Architecture & Data Flow

### Authentication Flow

1. **Middleware** (`middleware.ts` + `lib/supabase/middleware.ts`):
   - Runs on ALL requests (see matcher config)
   - Creates Supabase client and validates session cookies
   - Redirects unauthenticated users to `/login` (except `/`, `/login`, `/auth/*`)
   - NO authentication logic in individual page components

2. **Auth Callback** (`app/auth/callback/route.ts`):
   - Handles OAuth and magic link redirects
   - Exchanges code for session
   - **Upserts user in database** with OAuth metadata (avatar, display name)
   - Redirects to `/dashboard`

3. **Login Options** (`app/login/page.tsx`):
   - Magic Link: Email-based passwordless auth
   - Google OAuth: Sign in with Google (requires Supabase dashboard config)

### Route Structure

```
app/
├── (authenticated)/           # Protected by middleware via layout
│   ├── layout.tsx            # Checks auth, renders Navbar
│   ├── dashboard/            # User's playlists
│   ├── profile/              # User profile & preferences
│   └── settings/sources/     # Source templates management
├── playlist/[id]/            # Playlist detail (auth checked in page)
├── share/[slug]/             # PUBLIC playlist view (no auth)
├── login/                    # Login page
└── auth/callback/            # OAuth/magic link callback
```

**Route Groups:** `(authenticated)/` uses a layout that enforces authentication. Individual pages should NOT re-check auth unnecessarily.

### Data Model Architecture

**Core Principle:** Store both original input (`videoCode`) and normalized version (`normalizedCode`).

**Models:**
- `User`: Synced with Supabase Auth, includes profile fields (displayName, avatarUrl, preferences JSON)
- `Playlist`: User's collection with shareSlug for public sharing
- `PlaylistItem`: Individual video codes with position ordering
- `SourceTemplate`: User-defined URL patterns with `{code}` placeholder

**Key Fields:**
- `PlaylistItem.videoCode`: Original user input (e.g., "ssis123")
- `PlaylistItem.normalizedCode`: Standardized format (e.g., "SSIS-123")
- Both stored to preserve original while enabling consistent display/search

### Video Code Normalization (`lib/code-normalizer.ts`)

**Critical system component** - handles two distinct formats:

1. **Standard JAV format:** `SSIS123` → `SSIS-123` (letters + hyphen + numbers)
2. **FC2 format:**
   - `fc2ppv1234567` → `FC2-PPV-1234567`
   - Pure numbers (6-8 digits): `1234567` → `FC2-PPV-1234567`

**Functions:**
- `normalizeVideoCode(code)`: Converts to standard format
- `isValidVideoCode(code)`: Validates format before normalization

**Important:** When adding support for new video code formats, update BOTH functions. Pure numeric codes 6-8 digits are assumed to be FC2.

### Server Actions Pattern (`app/actions/*.ts`)

All mutations use Server Actions (not API routes). Pattern:

```typescript
export async function actionName(params) {
  // 1. Get authenticated user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // 2. Verify ownership (for updates/deletes)
  const resource = await prisma.resource.findFirst({
    where: { id: resourceId, userId: user.id }
  })
  if (!resource) throw new Error("Not found")

  // 3. Perform operation
  await prisma.resource.update(...)

  // 4. Revalidate affected paths
  revalidatePath("/relevant-path")
}
```

**Always verify ownership** before mutations on user-owned resources.

### URL Parsing (`lib/url-parser.ts`)

Extracts video codes from URLs or direct input. Supports:
- Direct codes: `SSIS-123`, `fc2ppv1234567`, `1234567`
- missav.com: `https://missav.com/SSIS-123`
- javdb.com: `https://javdb.com/v/abc123`
- FC2: `https://adult.contents.fc2.com/article/1234567/`

Returns `ParseResult` with success status and normalized code.

### Source Templates

User-defined URL patterns where `{code}` is replaced with video code:
- Example: `https://missav.ws/{code}` + `SSIS-123` → `https://missav.ws/SSIS-123`
- One template can be marked as default (`isDefault: true`)
- Used in "Generate Links" feature

## Database Operations

**Prisma Client:** Singleton instance in `lib/prisma.ts` (reuses connection in dev mode).

**Common patterns:**

```typescript
// User's resources with ownership filter
await prisma.playlist.findMany({
  where: { userId: user.id },
  include: { _count: { select: { items: true } } }
})

// Verify ownership before mutation
const playlist = await prisma.playlist.findFirst({
  where: { id: playlistId, userId: user.id }
})
if (!playlist) throw new Error("Not found")

// Position-based ordering for playlist items
const lastItem = await prisma.playlistItem.findFirst({
  where: { playlistId },
  orderBy: { position: 'desc' }
})
const position = (lastItem?.position ?? -1) + 1
```

## Supabase Client Pattern

**Three client types:**

1. **Server Components** (`lib/supabase/server.ts`):
   ```typescript
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   ```

2. **Client Components** (`lib/supabase/client.ts`):
   ```typescript
   const supabase = createClient()
   await supabase.auth.signInWithOAuth(...)
   ```

3. **Middleware** (`lib/supabase/middleware.ts`):
   Used only in `middleware.ts`, handles session refresh

**Never mix client types.** Use server client in Server Components/Actions, client in Client Components.

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=        # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # From Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=       # From Supabase project settings
DATABASE_URL=                     # Postgres connection string
NEXT_PUBLIC_APP_URL=             # App URL for OAuth redirects
NEXT_PUBLIC_GA_MEASUREMENT_ID=   # Google Analytics 4 Measurement ID (optional)
```

**Google Analytics 4 Setup:**
The app uses `@next/third-parties/google` for GA4 integration. To enable tracking:
1. Create a GA4 property at https://analytics.google.com/
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add it to `.env.local` as `NEXT_PUBLIC_GA_MEASUREMENT_ID`
4. Tracking will automatically start on all pages and custom events

**Tracked Events:**
- `add_items_to_playlist`: Track when users add items (single/bulk)
- `generate_links`: Track link generation by source
- `copy_codes`: Track code copying with selection info
- `delete_items`: Track item deletions
- `search_public_playlists`: Track surf page searches
- `copy_public_playlist`: Track playlist copying from surf page
- `copy_code_from_share`: Track code copying from share pages
- `copy_url_from_share`: Track URL copying from share pages

Custom events are defined in `lib/analytics.ts`.

## Key Conventions

1. **Server Actions over API Routes:** All mutations use Server Actions in `app/actions/`
2. **Ownership verification:** Always check `userId` matches authenticated user
3. **Path revalidation:** Call `revalidatePath()` after mutations to update UI
4. **Normalize on input:** Store both original and normalized codes
5. **UUID primary keys:** All models use UUID type (Postgres `@db.Uuid`)
6. **Share slugs:** Generated with `nanoid(10)` for public playlist URLs

## Public Sharing

Playlists with `isPublic: true` get a unique `shareSlug`:
- Access via `/share/[slug]` (no authentication required)
- Rendered server-side, no client-side data fetching
- Read-only view

## Adding New Video Code Formats

When supporting new formats (beyond JAV and FC2):

1. Update `normalizeVideoCode()` in `lib/code-normalizer.ts` with new pattern
2. Update `isValidVideoCode()` to accept new format
3. Add URL parsing logic in `lib/url-parser.ts` if URLs are supported
4. Update placeholder/hint text in `components/add-code-form.tsx`
5. Test both validation and normalization thoroughly

## Component Patterns

**Server Components** (default): Fetch data directly, no useState/useEffect
**Client Components:** Use `"use client"` directive, needed for:
- Event handlers (`onClick`, `onChange`)
- React hooks (`useState`, `useEffect`)
- Browser APIs
- Form interactions before Server Action submission

**Form submission pattern:**
```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  const formData = new FormData(e.target as HTMLFormElement)
  await serverAction(formData)
  router.refresh() // Update server component data
}
```

## Testing Strategy

Currently no automated tests. Manual testing workflow:
1. Test code normalization with various inputs
2. Verify ownership checks prevent unauthorized access
3. Test public sharing URLs work without auth
4. Check OAuth flow saves profile data correctly

## Common Gotchas

1. **Prisma in development:** Middleware checks for existing connection to avoid "too many connections"
2. **FC2 detection:** 6-8 digit pure numbers auto-convert to FC2 format
3. **Middleware matcher:** Exclude static assets to avoid unnecessary auth checks
4. **Position ordering:** PlaylistItems use integer position, not array indices
5. **OAuth avatar:** Only saved on first login or if user hasn't set custom avatar
