# Development Guide

This guide covers everything you need to know for developing AV Playlist Manager locally.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development Workflow](#development-workflow)
- [Working with the Database](#working-with-the-database)
- [Common Tasks](#common-tasks)
- [Debugging](#debugging)
- [Troubleshooting](#troubleshooting)
- [Tips & Best Practices](#tips--best-practices)

## 🔧 Prerequisites

### Required Software

| Software | Minimum Version | Recommended | Installation |
|----------|----------------|-------------|--------------|
| **Node.js** | 18.17.0 | 20.x LTS | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.0.0 | Latest | Comes with Node.js |
| **Git** | 2.30.0 | Latest | [git-scm.com](https://git-scm.com/) |
| **PostgreSQL** | 14.0 | 15.x | [postgresql.org](https://www.postgresql.org/) or use Supabase |

### Optional but Recommended

- **VS Code**: With extensions
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma
  - TypeScript
- **Docker**: For local PostgreSQL
- **Postman/Insomnia**: For API testing

### Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v18.17.0 or higher

# Check npm version
npm --version
# Should output: 9.0.0 or higher

# Check Git version
git --version
# Should output: git version 2.30.0 or higher
```

## 🚀 Initial Setup

### 1. Clone the Repository

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/av-web.git
cd av-web

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/av-web.git
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies listed in `package.json`:
- Next.js, React, TypeScript
- Prisma, Supabase client
- shadcn/ui components
- Validation, utility libraries

### 3. Set Up Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
# Supabase Configuration
# Get these from: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database
# Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
DATABASE_URL=postgresql://postgres:password@localhost:5432/av_playlist

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Analytics (Optional)
# Leave empty if not using
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

#### Setting up Supabase

**Option 1: Use Supabase Cloud (Recommended)**

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the URL and keys to `.env.local`
5. The database URL is in Settings → Database

**Option 2: Self-hosted Supabase**

```bash
# Using Docker
docker run -d \
  --name supabase-db \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  postgres:15
```

### 4. Set Up the Database

```bash
# Generate Prisma Client
npm run db:generate

# Push the schema to your database
npm run db:push
```

This creates all tables defined in `prisma/schema.prisma`.

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🔄 Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes from upstream
git checkout main
git pull upstream main

# 2. Create a new branch for your feature
git checkout -b feature/your-feature-name

# 3. Make your changes
# ... code, code, code ...

# 4. Test your changes
npm run build  # Check for errors
npm run dev    # Manual testing

# 5. Commit your changes
git add .
git commit -m "feat: add your feature"

# 6. Push to your fork
git push origin feature/your-feature-name

# 7. Create Pull Request on GitHub
```

### Development Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `npm run dev` | Start dev server with Turbopack | Development |
| `npm run build` | Build for production | Testing |
| `npm run start` | Start production server | Local production test |
| `npm run lint` | Run ESLint | Check code quality |
| `npm run db:generate` | Generate Prisma Client | After schema changes |
| `npm run db:push` | Push schema to database | Apply schema changes |
| `npm run db:studio` | Open Prisma Studio | View/edit database |

### Hot Reload

Next.js automatically reloads on changes:

- **Files that trigger reload**:
  - All `.ts`, `.tsx` files in `app/`, `components/`, `lib/`
  - `.css` files
  - `next.config.ts`

- **Files that require restart**:
  - `.env.local`
  - `middleware.ts` (sometimes)

## 💾 Working with the Database

### Prisma Workflow

#### 1. Viewing Database Content

```bash
# Open Prisma Studio (GUI for database)
npm run db:studio
```

This opens [http://localhost:5555](http://localhost:5555) where you can:
- View all tables
- Edit records
- Add test data
- Run queries

#### 2. Modifying the Schema

**Edit** `prisma/schema.prisma`:

```prisma
model Playlist {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @map("user_id") @db.Uuid
  name        String
  description String?
  tags        String[] // ← Add new field
  // ... other fields
}
```

**Apply changes**:

```bash
# Option 1: Push (for development)
npm run db:push

# Option 2: Create migration (for production)
dotenv -e .env.local -- prisma migrate dev --name add_tags_to_playlist
```

#### 3. Common Database Tasks

**Reset Database**:
```bash
dotenv -e .env.local -- prisma migrate reset
```

**Seed Database** (create `prisma/seed.ts`):
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test user
  const user = await prisma.user.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'test@example.com',
      displayName: 'Test User'
    }
  })

  // Create test playlist
  await prisma.playlist.create({
    data: {
      userId: user.id,
      name: 'Test Playlist',
      shareSlug: 'test-123'
    }
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run seed:
```bash
dotenv -e .env.local -- npx tsx prisma/seed.ts
```

### Database Best Practices

1. **Always use Prisma Client** (never raw SQL)
2. **Use transactions** for related operations
3. **Include only needed fields** (use `select`)
4. **Limit results** for large tables (use `take`)
5. **Use proper indices** for frequently queried fields

**Example**:
```typescript
// Good ✅
const playlists = await prisma.playlist.findMany({
  where: { userId: user.id },
  select: {
    id: true,
    name: true,
    _count: { select: { items: true } }
  },
  take: 20,
  orderBy: { updatedAt: 'desc' }
})

// Bad ❌
const playlists = await prisma.playlist.findMany({
  where: { userId: user.id },
  include: { items: true }  // Loads ALL items
})
```

## 🛠️ Common Tasks

### Adding a New Feature

**Example**: Add tags to playlists

**1. Update Database Schema**

```prisma
// prisma/schema.prisma
model Playlist {
  // ... existing fields
  tags String[] @default([])
}
```

**2. Push Schema**

```bash
npm run db:push
```

**3. Add Validation**

```typescript
// lib/validations.ts
export const createPlaylistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(10)  // New
})
```

**4. Update Server Action**

```typescript
// app/actions/playlists.ts
export async function createPlaylist(formData: FormData) {
  // ... auth and validation

  const playlist = await prisma.playlist.create({
    data: {
      userId: user.id,
      name: validation.data.name,
      description: validation.data.description,
      tags: validation.data.tags || []  // New
    }
  })

  revalidatePath('/dashboard')
  return playlist
}
```

**5. Update UI**

```tsx
// components/playlist-form.tsx
"use client"

export function PlaylistForm() {
  const [tags, setTags] = useState<string[]>([])

  return (
    <form>
      {/* ... other fields */}
      <TagInput tags={tags} onChange={setTags} />
    </form>
  )
}
```

### Adding a New Page

**Example**: Create `/about` page

**1. Create Page File**

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold">About</h1>
      <p className="mt-4">
        AV Playlist Manager helps you organize...
      </p>
    </div>
  )
}
```

**2. Add Navigation Link**

```tsx
// components/navbar.tsx
<nav>
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/about">About</Link>
</nav>
```

**3. Update Middleware** (if protected)

```typescript
// lib/supabase/middleware.ts
if (
  !user &&
  !request.nextUrl.pathname.startsWith('/about')  // Add this
) {
  return NextResponse.redirect('/login')
}
```

### Adding a New Component

**Example**: Create a `CodeCard` component

**1. Create Component File**

```tsx
// components/code-card.tsx
interface CodeCardProps {
  code: string
  note?: string
  onDelete?: () => void
}

export function CodeCard({ code, note, onDelete }: CodeCardProps) {
  return (
    <div className="border-2 border-black rounded-lg p-4">
      <code className="text-lg font-mono">{code}</code>
      {note && <p className="text-sm text-gray-600 mt-2">{note}</p>}
      {onDelete && (
        <button onClick={onDelete}>Delete</button>
      )}
    </div>
  )
}
```

**2. Use in Page**

```tsx
// app/playlist/[id]/page.tsx
import { CodeCard } from '@/components/code-card'

export default function PlaylistPage() {
  return (
    <div>
      {items.map(item => (
        <CodeCard
          key={item.id}
          code={item.normalizedCode}
          note={item.note}
        />
      ))}
    </div>
  )
}
```

## 🐛 Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Console Logging

```typescript
// Server Components / Server Actions
console.log('Server log:', data)  // Shows in terminal

// Client Components
console.log('Client log:', data)  // Shows in browser console
```

### Database Queries

```typescript
// Enable query logging in Prisma
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

// Or use Prisma Studio
// npm run db:studio
```

### Network Requests

Use browser DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by XHR/Fetch
4. Inspect Server Action calls

## 🔧 Troubleshooting

### Common Issues

#### 1. "Module not found" Error

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 2. Database Connection Error

```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
dotenv -e .env.local -- npx prisma db pull
```

#### 3. Environment Variables Not Loading

```bash
# Restart dev server (Next.js doesn't hot-reload .env)
# Ctrl+C, then:
npm run dev
```

#### 4. TypeScript Errors

```bash
# Regenerate Prisma Client
npm run db:generate

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### 5. Build Errors

```bash
# Check for type errors
npm run build

# Clear build cache
rm -rf .next
npm run build
```

### Getting Help

1. **Check Documentation**:
   - This guide
   - [ARCHITECTURE.md](./ARCHITECTURE.md)
   - [CONTRIBUTING.md](./CONTRIBUTING.md)

2. **Search Issues**:
   - GitHub Issues
   - Stack Overflow

3. **Ask for Help**:
   - Create GitHub Discussion
   - Ask in community chat

## 💡 Tips & Best Practices

### Code Quality

```bash
# Before committing
npm run build  # Check for errors
npm run lint   # Check code style
```

### Performance

- Use Server Components by default
- Only use Client Components when needed (interactivity)
- Fetch data in Server Components (closer to database)
- Use `loading.tsx` for better UX

### Security

- Never commit `.env.local`
- Always validate inputs
- Check ownership before mutations
- Use Server Actions (automatic CSRF protection)

### Git Workflow

```bash
# Keep your fork updated
git fetch upstream
git merge upstream/main

# Commit frequently with clear messages
git commit -m "feat(playlist): add bulk export"

# Push to your fork often
git push origin feature-branch
```

### VS Code Snippets

Create `.vscode/snippets.code-snippets`:

```json
{
  "Server Action": {
    "prefix": "action",
    "body": [
      "\"use server\"",
      "",
      "export async function ${1:actionName}(${2:params}) {",
      "  try {",
      "    const supabase = await createClient()",
      "    const { data: { user } } = await supabase.auth.getUser()",
      "    if (!user) throw new Error(\"Unauthorized\")",
      "",
      "    $0",
      "",
      "    revalidatePath('/$3')",
      "  } catch (error) {",
      "    throw new Error(sanitizeError(error))",
      "  }",
      "}"
    ]
  }
}
```

## 📚 Additional Resources

### Official Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Learning Resources

- [Next.js Learn](https://nextjs.org/learn)
- [React Tutorial](https://react.dev/learn)
- [TypeScript for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

### Community

- [Next.js Discord](https://nextjs.org/discord)
- [Prisma Discord](https://pris.ly/discord)
- [Supabase Discord](https://discord.supabase.com)

---

**Happy Coding!** 🚀

If you have questions or run into issues, don't hesitate to ask for help.
