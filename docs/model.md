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

#### User
```typescript
extends Base {
  email         : string (unique)
  passwordHash  : string
  firstName     : string
  middleName   ?: string
  lastName      : string
  preferredName?: string
  dateOfBirth   : date
  isMinor       : boolean (computed)
  privacyLevel  : enum (public, family, private)
}
```

#### Person (extends User for family members without accounts)
```typescript
extends Base {
  userId       ?: uuid (null if no account)
  firstName     : string
  middleName   ?: string
  lastName      : string
  preferredName?: string
  dateOfBirth  ?: date
  createdBy     : uuid (user who added them)
}
```

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
  type            : enum (family, friends, club, other)
  description    ?: string
  createdBy       : uuid
  adminIds        : uuid[]
  privacyLevel    : enum (private, invite-only)
  governanceModel : enum (democratic, hierarchical, consensus, single_admin)
  removalPolicy   : enum (immediate, vote_required, consensus_required)
  voteThreshold  ?: number (percentage, 50-100, for democratic model)
}
```

#### GroupMembership
```typescript
extends Base {
  groupId  : uuid
  personId : uuid
  role     : enum (admin, member)
  status   : enum (active, invited, removed)
  invitedBy: uuid
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
  requestType     : enum (tagged_user, untagged_user, uploader)
  reason         ?: string
  status          : enum (pending, approved, rejected)
  votes           : Array<{
    userId : uuid
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
  userId              : string
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
  targetType : enum (message, user, media)
  targetId   : string
  action     : enum (delete, hide, warn, remove_user)
  reason     : string
}
```

#### NotificationPreferences
```typescript
extends Base {
  userId             : string
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
  userId       : uuid
  resourceType : enum (user, thread, group)
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
  contentType : enum (message, media, user)
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
  USER   = 'USER',
  THREAD = 'THREAD',
  GROUP  = 'GROUP',
  MEDIA  = 'MEDIA',
  MESSAGE = 'MESSAGE',
  MEMBER  = 'MEMBER',
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
  REMOVE_USER = 'REMOVE_USER',
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