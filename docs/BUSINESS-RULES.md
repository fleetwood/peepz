# Peeps Business Rules

## Overview
This document defines the business rules, governance models, and policies that govern user interactions, content management, and family administration within Peeps.

---

## Core Principles

- **No Stigmatization**: No negative status labels anywhere (no "divorced", "estranged", etc.)
- **Family Autonomy**: Families choose their own governance model
- **User Autonomy**: Users control their own tags, blocks, and privacy
- **Shared Ownership**: Tagged media becomes shared property
- **Soft Deletes**: All deletions are soft (`visible: false`) for safety/legal reasons

---

## Family Governance Models

Families can choose one of four governance models when creating a group:

### 1. Single Admin
- One admin has full control
- Can remove members immediately
- Must designate successor
- Best for: Traditional patriarch/matriarch family structures

### 2. Hierarchical
- Primary admin(s) have authority
- Can appoint/remove other admins
- Others need approval for major decisions
- Best for: Multi-generational families with clear leadership

### 3. Consensus
- All admins must agree on decisions
- Best for: Small, tight-knit families with high trust

### 4. Democratic
- Decisions made by voting
- Configurable threshold (50-100%)
- Best for: Egalitarian families who prefer voting

---

## Relationship Management

### Removing a Person from Family
- Simply remove from group (soft delete: `visible: false`)
- Historical data (events, photos, messages) remains intact
- Person can be re-invited if circumstances change
- Removal process follows family's governance model

### Marriage Endings
- Simply remove the spouse/partner relationship (soft delete)
- No negative labels or status changes
- Children maintain connections to both parents automatically
- Each parent can create their own family groups if desired
- Shared events/albums/memories remain accessible to both
- Co-parenting coordination can continue through shared threads

### Family Member Removal (Excommunication)
- Configurable based on family governance model
- **Single Admin**: Any admin can remove immediately
- **Hierarchical**: Primary admin(s) can remove, others need approval
- **Consensus**: All admins must agree
- **Democratic**: Voting with configurable threshold (50-100%)
- Removal can be immediate or require waiting period (family choice)
- Reason is optional and private (not shared with all members)
- Removed member gets notification (generic or detailed, family choice)
- Can be re-invited later if circumstances change
- Appeals handled by admins per family's process

---

## Administration

### Who Gets to Be an Admin?

**Flexible based on governance model:**
- Group creator is initial admin and sets governance model
- **Single Admin**: One admin has full control (must designate successor)
- **Hierarchical**: Primary admin(s) appoint other admins
- **Consensus**: All admins must agree on new admin
- **Democratic**: Members vote or admins vote based on threshold
- Recommended minimum 2 admins for redundancy (but not required)
- No maximum - family decides

### Admin Succession Planning

**Family always has control, regardless of admin status:**

**Designated Successor:**
- Admin can designate 1+ successors (priority order)
- Auto-promotion: If admin inactive 90+ days AND successor designated, auto-promote

**Family-Initiated Emergency Admin Appointment:**
- ANY family member can initiate admin appointment at ANY time
- No waiting period required (handles emergencies, illness, death, etc.)
- Nominate themselves or another member
- Automatic vote among all active family members
- **Voting logic**:
  - **Admin fast-track**: If >50% of admins vote YES → approved instantly (no family vote needed)
  - **Family override**: If admins don't reach majority → family vote decides
    - Instantly if 50%+ of all active members vote YES
    - After 48 hours, 50%+ of responding members vote YES
- No existing admin approval required
- Existing admin(s) can participate in vote if active

**Succession reminders:**
- System prompts single admins to designate successor (optional)

### Admin Removal

**Based on governance model:**
- Self-removal always allowed (must designate successor if last admin)
- **Single Admin**: Can be removed by self, platform (TOS), or family vote
- **Hierarchical**: Primary admin can remove other admins
- **Consensus**: All other admins must agree
- **Democratic**: Vote based on configured threshold

**Family-initiated removal:**
- Any member can initiate vote to remove admin
- **Voting logic**:
  - **Admin fast-track**: If >50% of admins vote YES → removal approved instantly
  - **Family override**: If admins don't reach majority → family vote decides
    - Instantly if 50%+ of all active members vote YES
    - After 48 hours, 50%+ of responding members vote YES
- Handles situations where admin is unresponsive, incapacitated, or problematic
- New admin appointed immediately via same voting process
- Platform can remove admins for TOS violations regardless of model

---

## Privacy & Safety

### Children/Minors

**Auto-detect minors from DOB (under 18):**
- Default privacy: family-only, no public profile
- Parent/guardian approval required for:
  - Profile changes
  - Adding contacts
  - Joining new groups
  - Photo uploads
- No direct messaging with non-family adults
- Enhanced content filtering

### Protecting from Scraping/AI

- robots.txt to block crawlers
- No public profiles by default
- Rate limiting on all endpoints
- CAPTCHA for registration
- Watermark photos (optional)
- Disable right-click/download (UI only, not foolproof)
- Legal terms prohibiting scraping

---

## Media Management

### Shared Ownership Model

**Key Principle**: Media with tagged users becomes shared property

### Tag Management

**Self-Remove Tags:**
- Any user can remove themselves from a tag instantly
- No approval needed
- Complete autonomy over their own tags

### Media Removal Requests

**Tagged User Requests Removal:**
- Media is hidden immediately
- Uploader can delete without further confirmation (respects tagged user's privacy)

**Untagged User Requests Removal:**
- Media is hidden immediately
- Normal deletion process applies (see below)

### Normal Deletion Process

**When uploader wants to delete media with tagged members:**
1. Media temporarily hidden
2. Tagged members notified
3. **Voting logic**:
   - Instantly if >50% of tagged members vote YES
   - After 48 hours, >50% of responding tagged members vote YES
4. If approved, tagged members get **48-hour grace period** to download before deletion

**Untagged Media:**
- Uploader can delete immediately (no approval needed)

**All Deletions:**
- All deletions are soft deletes: `visible: false`
- Not hard-deleted for safety and legal reasons

---

## Blocking & Muting

### Block Model

Users can block or mute:
- **Users**: Other family members
- **Threads**: Specific conversations
- **Groups**: Entire family groups

### Block Types

**Block:**
- Prevents direct messages
- Hides content from blocker
- Doesn't break family connections (relationships still exist)
- Blocked person not notified
- Can still see shared group content (but not interact)

**Mute:**
- Hides content/notifications
- Doesn't prevent interaction
- User doesn't know they're muted
- Useful for noisy threads or temporary breaks

### Time-Scoped Blocking/Muting

**untilDate field:**
- Can set expiration date for block/mute
- Mute for 1 hour, 1 day, 1 week, etc.
- Temporary block until specific date
- `null` = permanent
- Records remain in database after expiration (audit trail)
- Query logic checks if currently active

### Group Blocking

- Leave group and prevent re-invitation
- Admin can override blocks for family emergencies

---

## Voting Logic

### Standard Voting Pattern

Used for admin appointments, removals, and media deletion:

**Admin Fast-Track:**
- If >50% of admins vote YES → approved instantly
- No family vote needed
- Allows quick action when admin team agrees

**Family Override:**
- If admins don't reach majority → family vote decides
- **Instant approval**: If 50%+ of all active members vote YES
- **48-hour approval**: If 50%+ of responding members vote YES

**Key Benefits:**
- Admins can fast-track decisions when they agree
- Family always has final say if admins are split
- Prevents admin deadlock
- Emergency situations can be resolved quickly
- Respects family autonomy

---

## Content Moderation

### User-Initiated Actions

**Content Reporting:**
- Any user can report spam, inappropriate content, harassment
- Reports go to group admins
- Admin reviews and takes action per governance model

**Block/Mute:**
- Users can block or mute other users, threads, or groups
- No approval needed
- Autonomous decision

### Admin Actions

**Based on governance model:**
- Admins can delete messages, hide media, warn users, remove members
- Actions logged for audit trail
- Disputed actions can be appealed per family's process

---

## Data Retention

### Soft Deletes

**All deletions are soft:**
- `visible: false` in database
- Content not hard-deleted
- Maintains audit trail
- Legal compliance
- Dispute resolution
- Pattern detection (harassment, abuse)

### Hard Deletes

**Only platform can hard-delete:**
- Legal requirement (GDPR, COPPA)
- TOS violations
- Account closure
- Data retention policy expiration

---

## Platform Intervention

**Platform can intervene only for:**
- Terms of Service violations
- Illegal content
- Child safety issues
- Legal requirements (GDPR, COPPA, court orders)
- Security threats

**Platform cannot:**
- Override family governance model for internal disputes
- Remove admins without cause
- Access private family content without legal requirement
- Share data with third parties without consent

---

## Compliance

### GDPR
- Right to access data
- Right to deletion (hard delete)
- Right to portability
- Right to rectification
- Consent management

### COPPA
- Parental consent for minors under 13
- Limited data collection for minors
- No targeted advertising to minors
- Parent can review/delete child's data

### Terms of Service
- No harassment, hate speech, illegal content
- No spam or commercial use without permission
- No scraping or automated access
- Respect privacy and consent
- Platform reserves right to remove violating content/users
