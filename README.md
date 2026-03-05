# AV Playlist Manager

A web application for managing video code collections with smart URL auto-completion.

## Features

- **ID-First Management**: Organize by video codes (e.g., SSIS-123), not URLs
- **Playlist Organization**: Create and manage multiple playlists
- **Bulk Import**: Paste multiple codes at once with automatic normalization
- **Smart Export**: Export as .txt, copy all codes, or share public links
- **Source Templates**: Define your preferred source URLs and auto-generate links
- **Public Sharing**: Share playlists with unique URLs
- **Code Normalization**: Automatically formats codes (e.g., "ssis123" → "SSIS-123")

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Authentication**: Supabase Auth (Email Magic Link)
- **Database**: Supabase Postgres
- **ORM**: Prisma
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Git

### 1. Clone and Install

```bash
cd av-web
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API**
3. Copy your project URL and anon key
4. Go to **Project Settings** → **Database**
5. Copy your connection string

### 3. Configure Environment

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database URL
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to Supabase
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

- **users**: User accounts (synced with Supabase Auth)
- **playlists**: User playlists with names, descriptions, and share settings
- **playlist_items**: Video codes within playlists
- **source_templates**: User-defined URL templates for auto-completion

## Core Features

### Video Code Normalization

Input examples:
- `ssis123` → `SSIS-123`
- ` waaa-412 ` → `WAAA-412`
- `IPX920` → `IPX-920`

### Source Templates

Create URL patterns with `{code}` as a placeholder:

- MissAV: `https://missav.ws/{code}`
- Jable: `https://jable.tv/videos/{code}/`
- Custom: `https://example.com/search?q={code}`

### Export Options

1. **Copy All Codes**: Copy normalized codes to clipboard
2. **Export as TXT**: Download as plain text file
3. **Copy Share Link**: Share public playlists via URL
4. **Generate Links**: Apply source templates to create full URLs

## Project Structure

```
av-web/
├── app/
│   ├── (authenticated)/     # Protected routes
│   │   ├── dashboard/       # User's playlists
│   │   └── settings/        # Source templates settings
│   ├── actions/             # Server actions
│   ├── api/                 # API routes
│   ├── auth/                # Auth callback
│   ├── playlist/[id]/       # Playlist detail page
│   ├── share/[slug]/        # Public share page
│   └── login/               # Login page
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── ...                  # Custom components
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── prisma.ts            # Prisma client
│   ├── code-normalizer.ts   # Code normalization logic
│   └── utils.ts             # Utilities
├── prisma/
│   └── schema.prisma        # Database schema
└── middleware.ts            # Auth middleware
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables from `.env.local`
4. Deploy!

### Post-Deployment

1. Update `NEXT_PUBLIC_APP_URL` in environment variables
2. Configure Supabase redirect URLs in Authentication settings:
   - Add `https://your-domain.vercel.app/auth/callback`

## Development Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run db:push     # Push Prisma schema to database
npm run db:studio   # Open Prisma Studio
npm run db:generate # Generate Prisma Client
```

## Future Enhancements

- [ ] Video metadata (actress, studio, tags)
- [ ] Cover images
- [ ] Public discovery page
- [ ] Tag-based recommendations
- [ ] Collaborative filtering
- [ ] Advanced search
- [ ] Import from .txt files
- [ ] Duplicate detection
- [ ] Dark mode

## License

MIT

## Support

For issues or questions, please create an issue on GitHub.

---

Built with ❤️ using Next.js, Supabase, and Prisma
