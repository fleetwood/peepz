## Data Model Architecture

### Core Entities

### Base
```typescript
{
  id       : uuid
  createdAt: timestamp
  updatedAt: timestamp
  visible  : boolean (default true)
}
```

**Note**: All models extend Base and inherit `id`, `createdAt`, `updatedAt`, and `visible` properties.

---

#### Person
```typescript
extends Base {
  name: string[]           // ["John", "Michael", "Anthony"] - first + middle names
  familyNames: Array<{
    name     : string
    category : enum (maternal, paternal, adopted, surrogate, chosen, other)
    active   : boolean
    order    : number
  }>
  dateOfBirth: date
  preferredName?: string   // "Call me Johnny"
  createdByMemberId?: uuid // member who added them (nullable = self-created)
  
  // Duplicate detection heuristic:
  // (array_to_string(name, ' '), active family name(s) in order, dateOfBirth)
}
```

#### Member (Person with an account)
```typescript
extends Base {
  personId      : uuid (foreign key to Person.id)
  email         : string (unique)
  passwordHash  : string
  privacyLevel  : enum (PUBLIC, FAMILY, PRIVATE)
}
```

**Identity & uniqueness rules:** see `BUSINESS-RULES.md`

#### Relationship
```typescript
extends Base {
  personAId       : uuid
  personBId       : uuid
  relationshipType: enum (parent, child, sibling, spouse, partner, etc)
  status          : enum (active, pending)
  confirmedBy     : uuid[] (both parties must confirm)
}
```

#### Group
```typescript
extends Base {
  name            : string
  type            : enum (FAMILY, FRIENDS, CLUB, OTHER)
  description    ?: string
  createdByMemberId: uuid
  privacyLevel    : enum (PRIVATE, INVITE_ONLY)
  governanceModel : enum (SINGLE_ADMIN, HIERARCHICAL, CONSENSUS, DEMOCRATIC)
  removalPolicy   : enum (IMMEDIATE, VOTE_REQUIRED, CONSENSUS_REQUIRED)
  voteThreshold  ?: number (percentage, 50-100, for democratic model)
}
```

Admins are represented as `GroupMembership` rows with `role = ADMIN`.

#### Family
```typescript
extends Base {
  groupId : uuid (foreign key to Group.id, where Group.type = family)
}
```

#### GroupMembership
```typescript
extends Base {
  groupId  : uuid
  personId : uuid
  role     : enum (ADMIN, MEMBER)
  status   : enum (ACTIVE, INVITED, REMOVED)
  invitedByMemberId?: uuid
  joinedAt : timestamp
}
```

#### ContactInfo
```typescript
extends Base {
  personId  : uuid
  type      : enum (email, phone, address, whatsapp, telegram, etc)
  value     : string
  isPrimary : boolean
  isVerified: boolean
  visibility: enum (public, family, private)
}
```

#### Thread
```typescript
extends Base {
  title      ?: string
  description?: string
  type        : enum (direct, group, event)
  groupId    ?: uuid
  eventId    ?: uuid
  createdBy   : uuid
}
```

#### ThreadParticipant
```typescript
extends Base {
  threadId   : uuid
  personId   : uuid
  role       : enum (member, admin)
  lastReadAt : timestamp
  mutedUntil?: timestamp
}
```

#### Message
```typescript
extends Base {
  threadId          : uuid
  senderId          : uuid
  content           : string
  messageType       : enum (text, image, file, system)
  externalSource   ?: enum (email, sms, whatsapp, telegram)
  externalMessageId?: string
  attachments       : json[]
  sentAt            : timestamp
  editedAt         ?: timestamp
  deletedAt        ?: timestamp
}
```

#### Event
```typescript
extends Base {
  title       : string
  description?: string
  startDate   : timestamp
  endDate    ?: timestamp
  location   ?: string
  groupId    ?: uuid
  threadId   ?: uuid
  albumId    ?: uuid
  createdBy   : uuid
}
```

#### EventParticipant
```typescript
extends Base {
  eventId     : uuid
  personId    : uuid
  rsvpStatus  : enum (yes, no, maybe, pending)
  respondedAt?: timestamp
}
```

#### Album
```typescript
extends Base {
  title        : string
  description ?: string
  groupId     ?: uuid
  eventId     ?: uuid
  createdBy    : uuid
  privacyLevel : enum (public, family, private)
}
```

#### Media
```typescript
extends Base {
  albumId      : uuid
  uploadedBy   : uuid
  mediaType    : enum (photo, video)
  fileUrl      : string
  thumbnailUrl : string
  caption     ?: string
  takenAt     ?: timestamp
  uploadedAt   : timestamp
  deletedAt   ?: timestamp
  duration    ?: number (for videos, in seconds)
  width       ?: number
  height      ?: number
  fileSize     : number (bytes)
}
```

#### MediaTag
```typescript
extends Base {
  mediaId : uuid
  personId: uuid
  taggedBy: uuid
  status  : enum (pending, approved, rejected)
}
```

#### RemovalRequest
```typescript
extends Base {
  resourceType    : enum (media, message, member)
  resourceId      : uuid
  requestedBy     : uuid
  requestType     : enum (tagged_member, untagged_member, uploader)
  reason         ?: string
  status          : enum (pending, approved, rejected)
  votes           : Array<{
    memberId: uuid
    vote   : enum (approve, reject)
    votedAt: timestamp
  }>
  reviewedBy     ?: uuid
  reviewedAt     ?: timestamp
  gracePeriodEnds?: timestamp (48 hours after approval for download)
}
```

#### FamilyJoinRequest
```typescript
extends Base {
  memberId            : string
  groupId             : string
  claimedRelationships: Array<{
    personId        : string
    relationshipType: RelationshipType
  }>
  status       : enum (pending, approved, rejected)
  confirmations: Array<{
    confirmedBy: string
    confirmedAt: Date
    isAdmin    : boolean
  }>
  expiresAt: timestamp
}
```

#### Invitation
```typescript
extends Base {
  invitedBy    : string
  email        : string
  firstName   ?: string
  lastName    ?: string
  relationship?: RelationshipType
  groupId      : string
  status       : enum (pending, accepted, expired)
  token        : string
  expiresAt    : timestamp
}
```

#### ModerationAction
```typescript
extends Base {
  performedBy: string
  targetType : enum (message, member, media)
  targetId   : string
  action     : enum (delete, hide, warn, remove_member)
  reason     : string
}
```

#### NotificationPreferences
```typescript
extends Base {
  memberId           : string
  pushNotifications  : boolean
  email              : boolean
  sms                : boolean
  realtime           : boolean
  digest             : enum (hourly, daily, weekly, never)
  mentions           : boolean
  directMessages     : boolean
  allMessages        : boolean
  quietHoursEnabled  : boolean
  quietHoursStart   ?: string
  quietHoursEnd     ?: string
  quietHoursTimezone?: string
}
```

#### Block
```typescript
extends Base {
  memberId      : uuid
  resourceType  : enum (member, thread, group)
  resourceId   : uuid
  blockType    : enum (block, mute)
  untilDate   ?: timestamp (null = permanent)
  reason      ?: string
}
```

#### ContentReport
```typescript
extends Base {
  reportedBy  : string
  contentType : enum (message, media, member)
  contentId   : string
  reason      : enum (spam, inappropriate, harassment, other)
  description?: string
  status      : enum (pending, reviewed, resolved)
  reviewedBy ?: string
}
```

---

## Enums

### PrivacyLevel
```typescript
enum PrivacyLevel {
  PUBLIC  = 'PUBLIC',
  FAMILY  = 'FAMILY',
  PRIVATE = 'PRIVATE',
}
```

### RelationshipType
```typescript
enum RelationshipType {
  PARENT       = 'PARENT',
  CHILD        = 'CHILD',
  SIBLING      = 'SIBLING',
  SPOUSE       = 'SPOUSE',
  PARTNER      = 'PARTNER',
  GRANDPARENT  = 'GRANDPARENT',
  GRANDCHILD   = 'GRANDCHILD',
  AUNT_UNCLE   = 'AUNT_UNCLE',
  NIECE_NEPHEW = 'NIECE_NEPHEW',
  COUSIN       = 'COUSIN',
}
```

### RelationshipStatus
```typescript
enum RelationshipStatus {
  ACTIVE  = 'ACTIVE',
  PENDING = 'PENDING',
}
```

### GroupType
```typescript
enum GroupType {
  FAMILY  = 'FAMILY',
  FRIENDS = 'FRIENDS',
  CLUB    = 'CLUB',
  OTHER   = 'OTHER',
}
```

### GovernanceModel
```typescript
enum GovernanceModel {
  SINGLE_ADMIN = 'SINGLE_ADMIN',
  HIERARCHICAL = 'HIERARCHICAL',
  CONSENSUS    = 'CONSENSUS',
  DEMOCRATIC   = 'DEMOCRATIC',
}
```

### RemovalPolicy
```typescript
enum RemovalPolicy {
  IMMEDIATE          = 'IMMEDIATE',
  VOTE_REQUIRED      = 'VOTE_REQUIRED',
  CONSENSUS_REQUIRED = 'CONSENSUS_REQUIRED',
}
```

### MessageType
```typescript
enum MessageType {
  TEXT   = 'TEXT',
  IMAGE  = 'IMAGE',
  FILE   = 'FILE',
  SYSTEM = 'SYSTEM',
}
```

### MediaType
```typescript
enum MediaType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
}
```

### ExternalSource
```typescript
enum ExternalSource {
  EMAIL    = 'EMAIL',
  SMS      = 'SMS',
  WHATSAPP = 'WHATSAPP',
  TELEGRAM = 'TELEGRAM',
}
```

### RSVPStatus
```typescript
enum RSVPStatus {
  YES     = 'YES',
  NO      = 'NO',
  MAYBE   = 'MAYBE',
  PENDING = 'PENDING',
}
```

### GroupRole
```typescript
enum GroupRole {
  ADMIN  = 'ADMIN',
  MEMBER = 'MEMBER',
}
```

### MembershipStatus
```typescript
enum MembershipStatus {
  ACTIVE  = 'ACTIVE',
  INVITED = 'INVITED',
  REMOVED = 'REMOVED',
}
```

### BlockType
```typescript
enum BlockType {
  BLOCK = 'BLOCK',
  MUTE  = 'MUTE',
}
```

### ResourceType
```typescript
enum ResourceType {
  MEMBER = 'MEMBER',
  THREAD = 'THREAD',
  GROUP  = 'GROUP',
  MEDIA  = 'MEDIA',
  MESSAGE = 'MESSAGE',
}
```

### RequestStatus
```typescript
enum RequestStatus {
  PENDING  = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
```

### TagStatus
```typescript
enum TagStatus {
  PENDING  = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}
```

### ReportReason
```typescript
enum ReportReason {
  SPAM          = 'SPAM',
  INAPPROPRIATE = 'INAPPROPRIATE',
  HARASSMENT    = 'HARASSMENT',
  OTHER         = 'OTHER',
}
```

### ReportStatus
```typescript
enum ReportStatus {
  PENDING  = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
}
```

### ModerationAction
```typescript
enum ModerationAction {
  DELETE      = 'DELETE',
  HIDE        = 'HIDE',
  WARN        = 'WARN',
  REMOVE_MEMBER = 'REMOVE_MEMBER',
}
```

### NotificationDigest
```typescript
enum NotificationDigest {
  HOURLY = 'HOURLY',
  DAILY  = 'DAILY',
  WEEKLY = 'WEEKLY',
  NEVER  = 'NEVER',
}
```

---

## Calendar Import/Export

### Mapping plan (no schema changes)

| iCalendar | Our field | Notes |
|----------|-----------|-------|
| UID | `event_series.id` | Global unique identifier |
| DTSTAMP | `event_series.updatedAt` | Last-modified timestamp |
| DTSTART/DTEND | `event_instances.startsAt`/`endsAt` | Stored with timezone |
| SUMMARY | `event_series.title` | |
| DESCRIPTION | `event_series.description` | |
| LOCATION | `addresses` (via `event_instances.locationId`) | |
| RRULE | `event_series.recurrenceRule` | RFC 5545 compatible |
| ATTENDEE | `event_attendees` → `members.email` | Join for emails |
| ORGANIZER | `event_series.createdByMemberId` → `members.email` | Optional: add explicit organizerEmail later |

### TODO: Implement calendar utils

- **Export**: Map our fields to iCalendar VEVENT properties
- **Import**: Parse iCalendar and populate `event_series`/`event_instances`
- **Other formats**: Google Calendar API, Microsoft Graph API, Apple Calendar (CalDAV)

---