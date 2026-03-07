# Contributing to AV Playlist Manager

Thank you for your interest in contributing to AV Playlist Manager! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## 🤝 Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow:

- **Be respectful**: Treat everyone with respect and kindness
- **Be collaborative**: Work together and help each other
- **Be inclusive**: Welcome diverse perspectives and backgrounds
- **Be professional**: Keep discussions focused and constructive

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.17 or higher
- **npm** or **yarn**
- **Git**
- **PostgreSQL** (or use Supabase)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/av-web.git
cd av-web
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/av-web.git
```

## 💻 Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Then fill in your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_postgres_connection_string

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view your database
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your local instance.

## 🛠️ How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes**
- ✨ **New features**
- 📝 **Documentation improvements**
- 🎨 **UI/UX enhancements**
- ♿ **Accessibility improvements**
- 🌐 **Translations/i18n**
- ⚡ **Performance optimizations**
- 🧪 **Tests**

### Workflow

1. **Create a branch** for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly:

```bash
# Run type checking
npm run build

# Test manually
npm run dev
```

4. **Commit your changes** following our commit guidelines

5. **Push to your fork**:

```bash
git push origin feature/your-feature-name
```

6. **Create a Pull Request** on GitHub

## 📐 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use interfaces for object shapes
- Export types when they're used in multiple files

**Example:**

```typescript
// Good ✅
interface PlaylistData {
  name: string
  description: string | null
  isPublic: boolean
}

export async function createPlaylist(data: PlaylistData) {
  // ...
}

// Bad ❌
export async function createPlaylist(data: any) {
  // ...
}
```

### React Components

- Use functional components with hooks
- Separate server and client components appropriately
- Use `"use client"` directive only when necessary
- Follow the Single Responsibility Principle

**Example:**

```typescript
// Server Component (default)
export default async function PlaylistPage({ params }: PageProps) {
  const playlist = await getPlaylist(params.id)
  return <PlaylistView playlist={playlist} />
}

// Client Component
"use client"

export function PlaylistView({ playlist }: Props) {
  const [editing, setEditing] = useState(false)
  // ...
}
```

### Server Actions

All Server Actions must:

1. Validate user authentication
2. Verify ownership for protected resources
3. Validate input with Zod schemas
4. Use proper error handling
5. Revalidate affected paths

**Example:**

```typescript
"use server"

import { validateData, sanitizeError } from "@/lib/validations"

export async function updatePlaylist(id: string, data: unknown) {
  try {
    // 1. Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // 2. Input validation
    const validation = validateData(data, updatePlaylistSchema)
    if (!validation.success) throw new Error(validation.error)

    // 3. Ownership check
    const playlist = await prisma.playlist.findFirst({
      where: { id, userId: user.id }
    })
    if (!playlist) throw new Error("Not found")

    // 4. Perform operation
    const updated = await prisma.playlist.update({
      where: { id },
      data: validation.data
    })

    // 5. Revalidate
    revalidatePath(`/playlist/${id}`)
    return updated

  } catch (error) {
    throw new Error(sanitizeError(error))
  }
}
```

### File Organization

```
app/
├── (authenticated)/      # Protected routes
├── actions/             # Server Actions
├── api/                 # API routes (if needed)
└── [public routes]/     # Public routes

components/              # React components
├── ui/                 # shadcn/ui components
└── [feature]/          # Feature-specific components

lib/                    # Utilities and helpers
├── validations.ts      # Zod schemas
├── rate-limit.ts       # Rate limiting
└── [utils]/            # Other utilities

prisma/
└── schema.prisma       # Database schema
```

### Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Use shadcn/ui components when possible
- Maintain responsive design (mobile-first)

**Example:**

```tsx
// Good ✅
<div className="flex items-center gap-4 p-6 rounded-lg border-2 border-black">
  <Button className="bg-black hover:bg-gray-800 text-white">
    Click me
  </Button>
</div>

// Avoid ❌
<div style={{ display: 'flex', padding: '24px' }}>
  <button style={{ backgroundColor: 'black' }}>Click me</button>
</div>
```

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `security`: Security improvements

### Examples

```bash
# Feature
git commit -m "feat(playlist): add bulk delete functionality"

# Bug fix
git commit -m "fix(auth): resolve session refresh issue"

# Documentation
git commit -m "docs(contributing): add code style guidelines"

# Security
git commit -m "security(validation): add input sanitization"
```

### Commit Message Body (Optional)

For complex changes, add a detailed explanation:

```
feat(search): implement full-text search for playlists

- Add search endpoint with pagination
- Implement debounced search input
- Add loading states and error handling
- Update UI to display search results

Closes #123
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch** with the latest upstream changes:

```bash
git fetch upstream
git rebase upstream/main
```

2. **Run tests** and ensure build passes:

```bash
npm run build
```

3. **Review your changes**:

```bash
git diff upstream/main
```

### PR Title

Use the same format as commit messages:

```
feat(playlist): add bulk export functionality
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List of key changes
- Another change
- One more change

## Testing
Describe how you tested your changes:
- [ ] Manual testing
- [ ] Added tests
- [ ] Existing tests pass

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes locally
```

### Review Process

1. At least one maintainer will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Delete your branch after merging

## 🐛 Reporting Issues

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check if it's already fixed** in the latest version
3. **Gather information** about the bug

### Bug Report Template

```markdown
## Bug Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node version: [e.g., 18.17.0]
- App version/commit: [e.g., v1.0.0 or commit hash]

## Screenshots
If applicable, add screenshots.

## Additional Context
Any other information about the problem.
```

## 💡 Feature Requests

### Before Requesting

1. **Check existing feature requests**
2. **Consider if it aligns** with the project's goals
3. **Think about implementation** details

### Feature Request Template

```markdown
## Feature Description
A clear description of the feature.

## Use Case
Why is this feature needed? What problem does it solve?

## Proposed Solution
How would you like to see this implemented?

## Alternatives Considered
What other solutions have you considered?

## Additional Context
Any other information, mockups, or examples.
```

## 🏗️ Architecture Guidelines

### Adding New Features

When adding new features, consider:

1. **Database schema**: Update `prisma/schema.prisma` if needed
2. **Validation**: Add Zod schemas in `lib/validations.ts`
3. **Server Actions**: Create in `app/actions/`
4. **Components**: Separate server and client components
5. **Security**: Implement proper auth checks and input validation
6. **Documentation**: Update relevant docs

### Database Migrations

```bash
# Create a migration
dotenv -e .env.local -- prisma migrate dev --name your_migration_name

# Apply migrations
dotenv -e .env.local -- prisma migrate deploy
```

### Adding New Dependencies

1. Check if the dependency is necessary
2. Prefer well-maintained packages
3. Consider bundle size impact
4. Document why it's needed in the PR

```bash
# Install and save to package.json
npm install package-name
```

## 🔐 Security

### Reporting Security Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead, email the maintainers directly or use GitHub's private security reporting feature.

### Security Best Practices

When contributing, ensure:

- No sensitive data in commits (API keys, passwords, etc.)
- Input validation for all user inputs
- Proper authentication and authorization checks
- Rate limiting for sensitive operations
- Sanitized error messages (no internal details)

## 📚 Resources

### Project Documentation

- [CLAUDE.md](../CLAUDE.md) - Project overview and architecture
- [SECURITY.md](../SECURITY.md) - Security documentation
- [README.md](../README.md) - Getting started guide

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## ❓ Questions?

If you have questions:

1. Check the documentation first
2. Search existing issues and discussions
3. Create a new discussion on GitHub
4. Ask in the community chat (if available)

## 🎉 Thank You!

Every contribution, no matter how small, is valuable and appreciated. Thank you for helping make AV Playlist Manager better!

---

**Happy Contributing!** 🚀
