# Architecture Documentation

This document provides an in-depth overview of the AV Playlist Manager architecture, design decisions, and technical implementation details.

## 📐 System Architecture

### Tech Stack Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                    │
│  Next.js 15 (App Router) + React 19 + TypeScript   │
│        shadcn/ui + Tailwind CSS + Radix UI          │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                  Server Layer                       │
│     Next.js Server Components + Server Actions      │
│           Middleware (Auth + Rate Limiting)         │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                 Data Access Layer                   │
│              Prisma ORM + Validation                │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                  Data Layer                         │
│       Supabase Auth + PostgreSQL Database           │
└─────────────────────────────────────────────────────┘
```

### Core Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 | React framework with App Router |
| **Language** | TypeScript | Type-safe JavaScript |
| **UI Library** | React 19 | Component-based UI |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Components** | shadcn/ui | Accessible component library |
| **Auth** | Supabase Auth | Authentication & session management |
| **Database** | PostgreSQL | Relational database |
| **ORM** | Prisma | Type-safe database client |
| **Validation** | Zod | Schema validation |
| **Analytics** | Google Analytics 4 | User analytics (optional) |

## 🏗️ Application Structure

### Directory Structure

```
av-web/
├── app/                          # Next.js App Router
│   ├── (authenticated)/         # Protected route group
│   │   ├── layout.tsx          # Auth layout with Navbar
│   │   ├── dashboard/          # User dashboard
│   │   ├── profile/            # User profile
│   │   ├── settings/           # Settings pages
│   │   └── surf/               # Public playlist discovery
│   ├── actions/                # Server Actions
│   │   ├── playlists.ts       # Playlist operations
│   │   ├── profile.ts         # Profile operations
│   │   ├── source-templates.ts # Template operations
│   │   ├── surf.ts            # Public playlist operations
│   │   └── favorites.ts       # Favorites operations
│   ├── api/                    # API routes (minimal usage)
│   ├── auth/                   # Authentication routes
│   ├── login/                  # Login page
│   ├── playlist/[id]/          # Playlist detail page
│   ├── share/[slug]/           # Public playlist sharing
│   └── about/                  # About page
├── components/                  # React components
│   ├── ui/                     # shadcn/ui base components
│   └── [features]/             # Feature components
├── lib/                        # Utilities and helpers
│   ├── supabase/              # Supabase clients
│   │   ├── client.ts          # Client-side client
│   │   ├── server.ts          # Server-side client
│   │   └── middleware.ts      # Middleware client
│   ├── validations.ts         # Zod schemas
│   ├── rate-limit.ts          # Rate limiting
│   ├── code-normalizer.ts     # Video code normalization
│   ├── url-parser.ts          # URL parsing
│   ├── analytics.ts           # GA4 tracking
│   ├── env.ts                 # Environment validation
│   └── prisma.ts              # Prisma client singleton
├── prisma/
│   └── schema.prisma          # Database schema
├── docs/                       # Documentation
├── public/                     # Static assets
└── [config files]             # Configuration files
```

## 🔐 Authentication Flow

### Authentication Architecture

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. Visit protected route
     ▼
┌────────────────┐
│   Middleware   │ ◄── Runs on EVERY request
│  (Auth Check)  │
└────┬───────────┘
     │ 2. Check session cookie
     ▼
┌──────────────────┐
│  Supabase Auth   │
│  Session Valid?  │
└────┬─────────────┘
     │
     ├─ YES ─────────────► Allow access
     │
     └─ NO ──────────────► Redirect to /login
```

### Auth Implementation

**1. Middleware Layer** (`middleware.ts` + `lib/supabase/middleware.ts`)

```typescript
// Runs on ALL requests (except static assets)
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Protects routes based on authentication status
export async function updateSession(request: NextRequest) {
  const user = await supabase.auth.getUser()

  if (!user && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect('/login')
  }

  return NextResponse.next()
}
```

**2. Login Methods**

- **Magic Link**: Email-based passwordless authentication
- **Google OAuth**: Sign in with Google account

**3. OAuth Callback** (`app/auth/callback/route.ts`)

```typescript
// Handles OAuth and magic link redirects
export async function GET(request: Request) {
  const code = searchParams.get('code')

  if (code) {
    // Exchange code for session
    const { user } = await supabase.auth.exchangeCodeForSession(code)

    // Upsert user in database
    await prisma.user.upsert({
      where: { id: user.id },
      create: { /* user data */ },
      update: { /* OAuth metadata */ }
    })
  }

  return redirect('/dashboard')
}
```

## 💾 Data Model

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │◄─────────┐
│ email           │          │
│ displayName     │          │ userId (FK)
│ avatarUrl       │          │
│ preferences     │          │
│ isAdmin         │          │
└─────────────────┘          │
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐
│    Playlist     │  │ SourceTemplate  │  │FavoritePlaylist  │
│─────────────────│  │─────────────────│  │──────────────────│
│ id (PK)         │  │ id (PK)         │  │ id (PK)          │
│ userId (FK)     │  │ userId (FK)     │  │ userId (FK)      │
│ name            │  │ name            │  │ playlistId (FK)  │
│ description     │  │ baseTemplate    │  │ createdAt        │
│ isPublic        │  │ isDefault       │  └──────────────────┘
│ shareSlug       │  │ createdAt       │
│ createdAt       │  └─────────────────┘
│ updatedAt       │
└────────┬────────┘
         │
         │ playlistId (FK)
         ▼
┌─────────────────┐
│  PlaylistItem   │
│─────────────────│
│ id (PK)         │
│ playlistId (FK) │
│ videoCode       │ ◄── Original input
│ normalizedCode  │ ◄── Standardized format
│ note            │
│ position        │ ◄── Ordering
│ createdAt       │
└─────────────────┘
```

### Key Design Decisions

**1. Dual Code Storage**
- Store both `videoCode` (original) and `normalizedCode` (standardized)
- Preserves user input while enabling consistent display/search
- Normalization handles formats like `ssis123` → `SSIS-123`

**2. UUID Primary Keys**
- All models use UUID for security (hard to guess)
- Type: `@db.Uuid` in Prisma schema

**3. Cascade Deletes**
- Deleting a user deletes all their playlists
- Deleting a playlist deletes all its items
- Maintains data integrity automatically

**4. Position-Based Ordering**
- PlaylistItems use `position: Int` field
- Allows flexible reordering without array indices
- Gaps in positions are allowed

## 🔄 Data Flow Patterns

### Server Actions Pattern

All mutations follow this pattern:

```typescript
"use server"

export async function performAction(params: unknown) {
  try {
    // 1. Authentication
    const user = await getAuthenticatedUser()
    if (!user) throw new Error("Unauthorized")

    // 2. Input Validation
    const validation = validateData(params, schema)
    if (!validation.success) throw new Error(validation.error)

    // 3. Authorization (Ownership Check)
    const resource = await prisma.resource.findFirst({
      where: { id: params.id, userId: user.id }
    })
    if (!resource) throw new Error("Not found")

    // 4. Business Logic
    const result = await prisma.resource.update({
      where: { id: params.id },
      data: validation.data
    })

    // 5. Cache Revalidation
    revalidatePath("/relevant-path")

    return result

  } catch (error) {
    // 6. Error Sanitization
    throw new Error(sanitizeError(error))
  }
}
```

### Server vs Client Components

**Server Components** (default)
```typescript
// app/playlist/[id]/page.tsx
export default async function PlaylistPage({ params }: Props) {
  // Can directly query database
  const playlist = await prisma.playlist.findUnique({
    where: { id: params.id }
  })

  return <PlaylistView playlist={playlist} />
}
```

**Client Components** (interactive)
```typescript
// components/playlist-form.tsx
"use client"

export function PlaylistForm({ playlist }: Props) {
  const [name, setName] = useState(playlist.name)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await updatePlaylist(playlist.id, { name })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## 🎯 Core Features Implementation

### 1. Video Code Normalization

**Input Formats Supported:**
- Standard JAV: `ssis123` → `SSIS-123`
- FC2 with prefix: `fc2ppv1234567` → `FC2-PPV-1234567`
- FC2 pure numbers: `1234567` → `FC2-PPV-1234567` (6-8 digits)

**Implementation** (`lib/code-normalizer.ts`):

```typescript
export function normalizeVideoCode(code: string): string {
  const normalized = code.trim().toUpperCase()
  const noHyphens = normalized.replace(/-/g, '')

  // Check FC2 patterns
  const fc2WithPrefix = noHyphens.match(/^FC2PPV(\d+)$/)
  if (fc2WithPrefix) return `FC2-PPV-${fc2WithPrefix[1]}`

  const pureNumber = noHyphens.match(/^(\d{6,8})$/)
  if (pureNumber) return `FC2-PPV-${pureNumber[1]}`

  // Standard format: LETTERS-NUMBERS
  const standardMatch = noHyphens.match(/^([A-Z]+)(\d+)$/)
  if (standardMatch) return `${standardMatch[1]}-${standardMatch[2]}`

  return normalized
}
```

### 2. URL Parsing

**Supported URLs:**
- Direct codes: `SSIS-123`, `fc2ppv1234567`
- missav.com: `https://missav.com/SSIS-123`
- javdb.com: `https://javdb.com/v/abc123`
- FC2: `https://adult.contents.fc2.com/article/1234567/`

**Implementation** (`lib/url-parser.ts`):

```typescript
export function parseVideoInput(input: string): ParseResult {
  const isUrl = input.startsWith('http') || input.includes('.')

  if (isUrl) {
    const url = new URL(input)
    const extractedCode = extractCodeFromUrl(url)
    return {
      success: isValidVideoCode(extractedCode),
      code: extractedCode,
      normalizedCode: normalizeVideoCode(extractedCode),
      source: 'url'
    }
  }

  return {
    success: isValidVideoCode(input),
    code: input,
    normalizedCode: normalizeVideoCode(input),
    source: 'direct'
  }
}
```

### 3. Source Templates

**Purpose**: Generate URLs from video codes using user-defined templates

**Template Format**: `https://example.com/{code}`

**Example**:
```
Template: https://missav.ws/{code}
Code:     SSIS-123
Result:   https://missav.ws/SSIS-123
```

**Validation**:
- Must contain `{code}` placeholder
- Must be valid URL format
- One template can be marked as default

### 4. Public Sharing

**Feature**: Users can share playlists publicly via unique URLs

**Implementation**:
- Each playlist has `shareSlug` (10-char nanoid)
- Public access via `/share/{slug}` (no auth required)
- Only visible if `isPublic: true`
- Read-only view for non-owners

**Route** (`app/share/[slug]/page.tsx`):
```typescript
export default async function SharedPlaylistPage({ params }: Props) {
  const playlist = await prisma.playlist.findUnique({
    where: {
      shareSlug: params.slug,
      isPublic: true  // Critical: only public playlists
    }
  })

  if (!playlist) notFound()

  return <PublicPlaylistView playlist={playlist} />
}
```

### 5. Favorites System

**Feature**: Users can favorite public playlists for quick access

**Implementation**:
```typescript
// Many-to-many relationship
model FavoritePlaylist {
  id         String @id @default(uuid())
  userId     String
  playlistId String

  user     User     @relation(...)
  playlist Playlist @relation(...)

  @@unique([userId, playlistId])  // Prevent duplicates
}
```

## 🛡️ Security Architecture

### Defense Layers

```
┌─────────────────────────────────────────────────┐
│          1. Security Headers                    │
│  X-Frame-Options, CSP, HSTS, etc.              │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│          2. Rate Limiting                       │
│  60 req/min per IP (middleware level)          │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│          3. Authentication                      │
│  Supabase Auth + Session Validation            │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│          4. Input Validation                    │
│  Zod schemas + Length limits                   │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│          5. Authorization                       │
│  Ownership verification (userId check)         │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│          6. Data Access                         │
│  Prisma ORM (SQL Injection prevention)         │
└─────────────────────────────────────────────────┘
```

### Rate Limiting

**Strategy**: In-memory rate limiting (single-server)

**Implementation**:
```typescript
// lib/rate-limit.ts
const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.namespace}:${identifier}`
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < Date.now()) {
    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetAt: Date.now() + config.windowMs
    })
    return { success: true, ... }
  }

  if (entry.count >= config.maxRequests) {
    return { success: false, ... }
  }

  entry.count++
  return { success: true, ... }
}
```

**Limits**:
- `auth`: 10 req/min
- `search`: 30 req/min
- `bulk`: 20 req/min
- `api`: 60 req/min
- `public`: 100 req/min

**Production Note**: For multi-server deployments, use Redis (Upstash/Vercel KV)

### Input Validation

**All inputs validated with Zod schemas** (`lib/validations.ts`):

```typescript
export const createPlaylistSchema = z.object({
  name: z.string()
    .min(1, "Name required")
    .max(100, "Max 100 characters"),
  description: z.string()
    .max(500, "Max 500 characters")
    .optional()
    .nullable(),
})
```

**Validation in Server Actions**:
```typescript
const validation = validateFormData(formData, createPlaylistSchema)
if (!validation.success) {
  throw new Error(validation.error)
}
```

### Error Handling

**Principle**: Never expose internal details to clients

**Implementation**:
```typescript
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    const safeMessages = [
      'Unauthorized', 'Not found', 'Invalid input', ...
    ]

    if (safeMessages.some(msg => error.message.includes(msg))) {
      return error.message  // Safe to expose
    }

    console.error('Sanitized error:', error)  // Log server-side
    return 'An error occurred'  // Generic message
  }

  return 'An unexpected error occurred'
}
```

## 📊 Analytics Integration

**Google Analytics 4** (optional)

**Implementation** (`lib/analytics.ts`):
```typescript
export function trackAddItemsToPlaylist(data: {
  playlist_id: string
  item_count: number
  is_bulk: boolean
}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_items_to_playlist', data)
  }
}
```

**Tracked Events**:
- `add_items_to_playlist`
- `generate_links`
- `copy_codes`
- `delete_items`
- `search_public_playlists`
- `copy_public_playlist`

## 🚀 Performance Optimizations

### Server Components

- **Default behavior**: All components are Server Components
- **Benefits**:
  - Zero JavaScript shipped for static content
  - Direct database access
  - Better SEO

### Caching Strategy

```typescript
// Next.js automatically caches fetch() and Server Component renders
// Force revalidation when data changes:
revalidatePath('/playlist/[id]')
```

### Database Query Optimization

```typescript
// Include related data in single query
const playlist = await prisma.playlist.findUnique({
  where: { id },
  include: {
    items: {
      orderBy: { position: 'asc' },
      take: 100  // Limit for performance
    },
    user: {
      select: { displayName: true }  // Select only needed fields
    },
    _count: {
      select: { items: true }  // Count without loading all
    }
  }
})
```

## 🧪 Testing Strategy

### Current State

- **Manual testing** for all features
- **Type safety** via TypeScript
- **Build-time validation** catches many issues

### Recommended Additions

```typescript
// Example: Unit tests for utilities
describe('normalizeVideoCode', () => {
  it('should normalize standard JAV codes', () => {
    expect(normalizeVideoCode('ssis123')).toBe('SSIS-123')
  })

  it('should handle FC2 codes', () => {
    expect(normalizeVideoCode('fc2ppv1234567'))
      .toBe('FC2-PPV-1234567')
  })
})

// Example: Integration tests for Server Actions
describe('createPlaylist', () => {
  it('should create playlist for authenticated user', async () => {
    const result = await createPlaylist(mockFormData)
    expect(result.name).toBe('Test Playlist')
  })

  it('should reject unauthenticated requests', async () => {
    await expect(createPlaylist(mockFormData))
      .rejects.toThrow('Unauthorized')
  })
})
```

## 🔮 Future Considerations

### Scalability

**Current**: Single-server deployment (Vercel)

**Scaling to multiple servers**:
1. Replace in-memory rate limiting with Redis
2. Use connection pooling for database
3. Consider read replicas for heavy read operations

### Features to Add

1. **Search & Filtering**
   - Full-text search for playlists
   - Advanced filters (date, creator, tags)

2. **Collaboration**
   - Shared playlists (multiple editors)
   - Comments/notes on items

3. **Import/Export**
   - CSV import/export
   - JSON API for integrations

4. **Internationalization**
   - Multi-language support
   - Locale-specific formatting

## 📚 References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [OWASP Security](https://owasp.org/www-project-top-ten/)

---

**Last Updated**: 2026-03-07
**Maintainer**: Development Team
