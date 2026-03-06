# Peeps

Family-centered social platform enabling direct connections, multi-channel communication, and event coordination without algorithmic feeds or marketing.

## Project Structure

```
peeps/
├── apps/
│   ├── api/          # Backend API (Next.js API Routes)
│   ├── web/          # Vue 3 + Nuxt web application
│   ├── socket/       # WebSocket server (Node.js)
│   └── mobile/       # React Native mobile app (Expo)
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utilities
│   ├── services/     # Business logic services
│   ├── db/           # Database schema and migrations
│   └── config/       # Shared configurations
├── docs/             # Documentation
└── turbo.json        # Turborepo configuration
```

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Database**: Supabase PostgreSQL + Drizzle ORM
- **Auth**: Supabase Auth
- **API**: Next.js API Routes + ApiRoute pattern
- **Web**: Vue 3 + Nuxt 3 + Composition API + Pinia
- **Mobile**: React Native (Expo)
- **Real-time**: WebSocket server
- **State**: Pinia (Vue) + Zustand (React)
- **Validation**: Zod
- **Styling**: TailwindCSS + shadcn/ui (Vue)

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

- `pnpm dev:all` - Start API, Web, and Socket servers
- `pnpm dev:api` - Start API server only (port 3001)
- `pnpm dev:web` - Start Web app only (port 3000)
- `pnpm dev:socket` - Start Socket server only
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all apps
- `pnpm test` - Run tests
- `pnpm clean` - Clean build artifacts
- `pnpm kill` - Kill all development servers

## Documentation

See `/docs` folder for detailed documentation:
- [Architecture](./docs/ARCHITECTURE.md) - System architecture and design patterns
- [Setup Guide](./docs/SETUP.md) - Development environment setup
- [Business Rules](./docs/BUSINESS-RULES.md) - Domain rules and constraints
- [Data Models](./docs/model.md) - Database schema and relationships
- [Integrations](./docs/INTEGRATIONS.md) - Third-party service integrations
- [Packages](./docs/PACKAGES.md) - Package structure and dependencies
- [Socket Domains](./docs/SocketDomains.md) - WebSocket event domains
- [Plan](./docs/plan.md) - Development roadmap and planning

### Architecture Layers:
- [API Layer](./docs/LAYER.API.md) - API route patterns and structure
- [Service Layer](./docs/LAYER.SERVICE.md) - Business logic services
- [Client Layer](./docs/LAYER.CLIENT.md) - Client-side architecture

### Feature Documentation:
- [Notifications](./docs/notifications/) - Notification system documentation
- [Onboarding](./docs/onboarding/) - User onboarding flow

## License

ISC
