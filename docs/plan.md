# Peeps Implementation Plan

## Overview
Family-centered social platform enabling direct connections, multi-channel communication, and event coordination without algorithmic feeds or marketing.

## Core Principles
- **Family-first architecture**: Relationships drive all access and visibility
- **Privacy by default**       : Especially for minors,   with opt-in sharing
- **Communication hub**        : Aggregate multiple platforms into unified threads
- **No algorithms**            : Direct connections only, no ML-driven content

---


## Architecture Overview

**Monorepo Structure** (Turborepo):
- `apps/web` - Next.js app (web UI + REST API routes)
- `apps/web` - Next.js web application
- `apps/mobile` - React Native mobile app (Expo)
- `packages/ui` - Shared UI components
- `packages/types` - Shared TypeScript types
- `packages/config` - Shared configurations
- `packages/utils` - Shared utilities

---

## Tech Stack by Codebase

### API (`apps/web/app/api`)
- **Runtime**     : Node.js (Next.js server runtime)
- **Framework**   : Next.js (App Router)
- **API Layer**   : REST (Next.js Route Handlers)
- **Database**    : Supabase PostgreSQL (500MB free)
- **ORM**         : Drizzle ORM
- **Auth**        : Supabase Auth (unlimited users, OAuth included)
- **File Storage**: Cloudinary (25GB free)
- **Real-time**   : Pusher (200k messages/day free) or Supabase Realtime
- **Email**       : Resend (3k emails/month free)
- **SMS**         : Twilio (deferred to post-MVP)
- **Queue**       : BullMQ + Upstash Redis (10k commands/day free)
- **Payments**    : Stripe (2.9% + 30¢ per transaction)
- **Validation**  : Zod schemas

### Web App (`apps/web`)
- **Framework**: Next.js 14+ (App Router)
- **UI**       : React + TailwindCSS + shadcn/ui (custom auth UI)
- **Theming**  : Tailwind CSS variables (primary, secondary, accent, etc)
- **State**    : Zustand
- **Data**     : TanStack Query + `@peeps/client` (fetch-based REST)
- **Auth**     : Supabase Auth SDK
- **Forms**    : React Hook Form + Zod
- **Icons**    : Lucide React
- **Real-time**: Pusher JS client or Supabase Realtime

### Mobile App (`apps/mobile`)
- **Framework**   : React Native (Expo)
- **Navigation**  : React Navigation / Expo Router
- **UI**          : React Native Paper or NativeBase (custom auth UI)
- **State**       : Zustand (shared with web)
- **Data**        : TanStack Query + `@peeps/client` (fetch-based REST)
- **Auth**        : Supabase Auth SDK
- **Forms**       : React Hook Form + Zod
- **Icons**       : React Native Vector Icons
- **Real-time**   : Pusher React Native client or Supabase Realtime
- **Notifications**: Expo Notifications
- **Camera**      : Expo Camera/Image Picker
- **Storage**     : Expo SecureStore

### Shared Packages
- **types**  : TypeScript interfaces, enums, API types
- **utils**  : Date formatting, validation helpers, business logic
- **config** : ESLint, TypeScript, Prettier configs
- **ui**     : Shared component logic (not UI, logic only)

### Infrastructure
- **API Hosting**  : Vercel Serverless (free) or Railway ($5-10/mo for queues)
- **Web Hosting**  : Vercel (Hobby plan free)
- **Mobile Build** : Expo EAS ($0 local, $29/mo cloud builds)
- **Database**     : Supabase (500MB free, includes auth + realtime)
- **Cache**        : Upstash Redis (10k commands/day free)
- **CDN**          : Vercel Edge (included)
- **Monitoring**   : Vercel Analytics + Sentry (5k events/month free)

---


## Phase 1: Foundation (Weeks 1-3)

### 1.1 Project Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure TailwindCSS + shadcn/ui
- [ ] Set up ESLint, Prettier
- [ ] Configure environment variables structure
- [ ] Set up Git repository and branching strategy

### 1.2 Database & Auth
- [ ] Design and implement Prisma schema
- [ ] Set up PostgreSQL database
- [ ] Configure NextAuth.js with email/password
- [ ] Implement user registration flow
- [ ] Add email verification
- [ ] Create protected route middleware

### 1.3 Core UI Components
- [ ] Layout components (header, sidebar, footer)
- [ ] Authentication pages (login, register, forgot password)
- [ ] User profile page
- [ ] Navigation system
- [ ] Error boundaries and loading states

---

## Phase 2: People & Relationships (Weeks 4-6)

### 2.1 Person Management
- [ ] Create person profile CRUD
- [ ] Add person form with contact information
- [ ] Implement person search/directory
- [ ] Build relationship request system
- [ ] Create relationship confirmation flow
- [ ] Display family tree visualization (optional: use D3.js or React Flow)

### 2.2 Privacy & Permissions
- [ ] Implement privacy level system
- [ ] Add minor protection logic (auto-detect from DOB)
- [ ] Create visibility rules engine
- [ ] Build permission checking middleware
- [ ] Add data access audit logging

### 2.3 Contact Information
- [ ] Multi-contact input component
- [ ] Contact verification system (email, phone)
- [ ] Contact visibility controls
- [ ] Primary contact designation

---

## Phase 3: Groups (Weeks 7-8)

### 3.1 Group Foundation
- [ ] Group creation and management
- [ ] Member invitation system
- [ ] Admin role management
- [ ] Group settings page
- [ ] Member list with roles

### 3.2 Group Permissions
- [ ] Admin selection/election system
- [ ] Multi-admin support
- [ ] Member removal workflow
- [ ] Removal request system
- [ ] Conflict resolution UI (voting/consensus)

---

## Phase 4: Messaging & Threads (Weeks 9-12)

### 4.1 Basic Messaging
- [ ] Thread creation (direct, group)
- [ ] Real-time message sending/receiving
- [ ] Message history pagination
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Message editing/deletion

### 4.2 Multi-Platform Integration
- [ ] Email integration (IMAP/SMTP)
- [ ] SMS integration (Twilio)
- [ ] WhatsApp Business API setup
- [ ] Telegram Bot API integration
- [ ] Message aggregation service
- [ ] Unified thread view
- [ ] Source indicator per message

### 4.3 Thread Management
- [ ] Thread participants management
- [ ] Mute/unmute threads
- [ ] Thread search
- [ ] Thread archiving
- [ ] Notification preferences

---

## Phase 5: Events & Calendar (Weeks 13-14)

### 5.1 Event System
- [ ] Event creation form
- [ ] Calendar view (month/week/day)
- [ ] RSVP system
- [ ] Event reminders
- [ ] Recurring events
- [ ] Event-linked threads

### 5.2 Event Coordination
- [ ] Participant management
- [ ] Group event invitations
- [ ] Event updates/notifications
- [ ] Event export (iCal)
- [ ] Timezone handling

---

## Phase 6: Albums & Photos (Weeks 15-16)

### 6.1 Photo Management
- [ ] Album creation
- [ ] Photo upload (with compression)
- [ ] Thumbnail generation
- [ ] Photo gallery view
- [ ] Photo tagging system
- [ ] Tag approval workflow

### 6.2 Photo Privacy
- [ ] Photo removal requests
- [ ] Removal request review system
- [ ] Photo visibility controls
- [ ] Download prevention options
- [ ] Watermarking (optional)

---

## Phase 7: Advanced Features (Weeks 17-20)

### 7.1 Feed & Activity
- [ ] Personal feed (connection-based only)
- [ ] Activity notifications
- [ ] Post creation (text, photos)
- [ ] Comments and reactions
- [ ] Feed privacy controls

### 7.2 Search & Discovery
- [ ] Global person search (privacy-aware)
- [ ] Group discovery (invite-only)
- [ ] Content search within groups
- [ ] Advanced filters

### 7.3 Moderation & Safety
- [ ] Content reporting system
- [ ] Block/unblock users
- [ ] Group member removal voting
- [ ] Dispute resolution workflow
- [ ] Admin audit logs

---

## Phase 8: Polish & Launch (Weeks 21-24)

### 8.1 Performance
- [ ] Image optimization
- [ ] Database query optimization
- [ ] Caching strategy
- [ ] CDN setup
- [ ] Load testing

### 8.2 Security
- [ ] Security audit
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] SQL injection prevention
- [ ] Penetration testing

### 8.3 Compliance
- [ ] GDPR compliance (data export, deletion)
- [ ] COPPA compliance (minors)
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie consent

### 8.4 Launch Prep
- [ ] User documentation
- [ ] Onboarding flow
- [ ] Email templates
- [ ] Error monitoring setup
- [ ] Backup strategy
- [ ] Beta testing
- [ ] Production deployment

---

## Business Rules

For detailed business rules including:
- Family governance models (Single Admin, Hierarchical, Consensus, Democratic)
- Relationship management and removal policies
- Admin succession planning and emergency appointments
- Privacy and safety rules for minors
- Media ownership and deletion policies
- Blocking and muting rules
- Voting logic and decision-making processes
- Content moderation and compliance

**See: [BUSINESS-RULES.md](./BUSINESS-RULES.md)**

---

## Technical Considerations

### Scalability
- Use database indexes on foreign keys and search fields
- Implement pagination for all lists
- Cache frequently accessed data (Redis)
- Use CDN for static assets
- Consider read replicas for database

### Real-time Architecture
- Socket.io rooms per thread
- Presence system for online status
- Optimistic UI updates
- Message queue for external integrations
- Webhook receivers for incoming messages

### External Integrations
- Separate microservice for message aggregation
- Queue-based processing (BullMQ)
- Retry logic with exponential backoff
- Rate limit handling per platform
- OAuth token refresh management

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical flows (Playwright)
- Load testing for messaging system
- Security testing (OWASP Top 10)

---

## Success Metrics

### MVP Launch Criteria
- [ ] 100+ beta users across 10+ families
- [ ] <2s page load time
- [ ] 99.5% uptime
- [ ] Zero critical security vulnerabilities
- [ ] GDPR/COPPA compliant
- [ ] All Phase 1-6 features complete

### Post-Launch Goals
- Monthly active users growth
- Message volume across platforms
- Event creation and attendance rates
- Photo upload and engagement
- User retention (30/60/90 day)
- Support ticket volume and resolution time

---

## Risk Mitigation

### Technical Risks
- **External API failures**: Implement fallbacks, queue retries
- **Data loss**            : Automated backups,   point-in-time recovery
- **Security breach**      : Regular audits,      bug bounty program
- **Performance issues**   : Monitoring,          auto-scaling

### Business Risks
- **Low adoption**     : Focus on one family at a time, referral system
- **Privacy concerns** : Transparent policies,          user control
- **Moderation burden**: Automated tools,               clear guidelines
- **Legal issues**     : Legal review,                  insurance, terms of service

### Operational Risks
- **Single point of failure**: Multi-admin requirement
- **Abuse/harassment**       : Reporting tools,        quick response
- **Content moderation**     : AI-assisted flagging,   human review
- **Platform dependencies**  : Diversify integrations, fallback options

---

## Next Steps

1. **Validate tech stack** with your preferences
2. **Refine data model** based on specific requirements
3. **Set up development environment** and repository
4. **Begin Phase 1** with project scaffolding
5. **Create detailed user stories** for each feature
6. **Design mockups** for key user flows
7. **Establish CI/CD pipeline** early

---

## Project Configuration

### Confirmed Decisions
1. **Hosting**       : Vercel (Hobby plan, upgrade to Pro when needed)
2. **Budget**        : Zero-cost MVP (defer SMS/WhatsApp to post-MVP)
3. **Timeline**      : ASAP (aggressive 24-week timeline, all phases)
4. **Team**          : Solo developer
5. **Design**        : shadcn/ui with Tailwind theme variables
6. **MVP Scope**     : All 8 phases required for launch
7. **Monetization**  : Freemium model via Stripe (premium features TBD)

### Zero-Cost MVP Strategy

**Free Tier Limits:**
- Vercel Postgres    : 256 MB storage, 60 hours compute/month
- Clerk Auth         : 10,000 monthly active users
- Cloudinary         : 25 GB storage, 25 GB bandwidth/month
- Pusher             : 200k messages/day, 100 concurrent connections
- Resend Email       : 3,000 emails/month
- Upstash Redis      : 10,000 commands/day
- Sentry             : 5,000 events/month

**Cost Optimization:**
- Defer SMS integration (Twilio pay-as-you-go) until post-MVP
- Defer WhatsApp Business API ($0 setup but requires Facebook Business verification)
- Use email-only notifications for MVP
- Implement SMS/WhatsApp as premium features
- Compress images aggressively before Cloudinary upload
- Use Vercel Edge caching to reduce database queries

**Upgrade Triggers:**
- Vercel Pro ($20/mo): When exceeding 100GB bandwidth or need team features
- Neon Scale ($19/mo): When exceeding 0.5GB database storage
- Clerk Pro ($25/mo): When exceeding 10k MAU
- Cloudinary Plus ($99/mo): When exceeding 25GB storage/bandwidth

### Premium Feature Ideas (Freemium Model)
- SMS/WhatsApp integration (power users)
- Advanced analytics (family insights, engagement metrics)
- Custom branding (remove "Powered by Peeps")
- Priority support
- Increased storage limits (photos/albums)
- Video uploads
- Advanced event management (recurring events, reminders)
- Export family data (genealogy formats)
- API access for third-party integrations
- Multi-family management (for large extended families)