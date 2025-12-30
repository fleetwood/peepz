# Peeps

Family-centered social platform enabling direct connections, multi-channel communication, and event coordination without algorithmic feeds or marketing.

## Project Structure

```
peeps/
├── apps/
│   ├── api/          # Backend API (Express + tRPC)
│   ├── web/          # Next.js web application
│   └── mobile/       # React Native mobile app (Expo)
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utilities
│   └── config/       # Shared configurations
├── doca/             # Documentation
└── turbo.json        # Turborepo configuration
```

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **API**: Express + tRPC + Drizzle ORM
- **Web**: Next.js 14+ (App Router) + TailwindCSS
- **Mobile**: React Native (Expo)
- **State**: Zustand
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account

### Setup

1. Clone the repository:
```bash
git clone git@github.com:fleetwood/peepz.git
cd peepz
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`

5. Start development servers:
```bash
pnpm dev
```

## Development

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all apps
- `pnpm test` - Run tests

## Documentation

See `/doca` folder for detailed documentation:
- [Architecture](./doca/ARCHITECTURE.md)
- [Setup Guide](./doca/SETUP.md)
- [Business Rules](./doca/BUSINESS-RULES.md)
- [Coding Standards](./doca/CODING-STANDARDS.md)
- [Data Models](./doca/model.md)

## License

ISC
