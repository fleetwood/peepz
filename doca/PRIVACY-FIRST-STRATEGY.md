# Peeps Privacy-First Integration Strategy

## Core Philosophy

**Peeps is a closed, family-only platform that prioritizes:**
1. **Privacy**: Your data stays with you, not sold to corporations
2. **Safety**: No bots, no marketing, no political spam
3. **Family-first**: Designed for real family connections, not engagement metrics
4. **User control**: You decide who sees what, always

---

## Integration Strategy: Outbound Only

### The Key Principle: One-Way Communication

Instead of giving Facebook/WhatsApp/etc access to POST to your platform, Peeps sends notifications OUT to these platforms, but all replies come back through controlled channels.

```
Peeps Platform (Closed System)
    ↓ Outbound Notifications Only
SMS / Email / WhatsApp (Notification Channels)
    ↓ Replies via Secure Link
Peeps Platform (User logs in to reply)
```

### How It Works

**Scenario: New message in family thread**

1. User A posts message in Peeps (web/mobile app)
2. Peeps sends notifications to participants:
   - **SMS**: "New message from Mom in Family Chat. Reply: https://peeps.family/t/abc123"
   - **Email**: "New message from Mom" with link to thread
   - **WhatsApp**: "New message from Mom. View: https://peeps.family/t/abc123"
3. User B clicks link → Opens Peeps app/website (authenticated)
4. User B replies in Peeps
5. Cycle repeats

**Benefits:**
- No external platform can POST to Peeps
- No bots can infiltrate
- No marketing spam
- No data sharing with Meta/Facebook
- You control the entire experience

---

## Recommended Integration Tiers

### Tier 1: MVP - Fully Controlled Channels

**1. Peeps Native App (Web + Mobile)**
- Primary interface
- Full feature set
- Complete control
- Real-time updates via Pusher

**2. Email Notifications (Outbound Only)**
- Send: "You have a new message" with link
- No inbound email processing (avoids spam)
- Use Resend (3k/month free)

**3. SMS Notifications (Outbound Only, Premium)**
- Send: "New message from [Name]. Reply at: [link]"
- No inbound SMS processing (avoids costs and spam)
- Use Twilio (~$0.008/message)
- Premium feature: 100 notifications/month included

### Tier 2: Optional - Controlled Inbound

**4. Email Replies (Optional, with strict filtering)**
- Allow replies to notification emails
- Strict sender verification (SPF, DKIM, DMARC)
- Whitelist only known family members
- Aggressive spam filtering
- Rate limiting per sender

**5. SMS Replies (Optional, Premium)**
- Allow replies to SMS notifications
- Phone number verification required
- Rate limiting
- Premium feature only

### Tier 3: Never Implement

❌ **Facebook Messenger** - Meta owns your data
❌ **WhatsApp Business API** - Requires Facebook Business account
❌ **Instagram** - Meta platform
❌ **Twitter/X** - Expensive and toxic
❌ **TikTok** - Not family-appropriate

---

## Privacy-First Architecture

### Data Ownership

```typescript
// All data stored in YOUR database
// No external platform has access

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;              // Stored in YOUR database
  createdAt: Date;
  
  // NO external platform IDs
  // NO syncing to external platforms
  // NO data sharing
}
```

### Notification System (Outbound Only)

```typescript
// apps/api/src/services/notifications.ts

export async function notifyThreadParticipants(
  threadId: string,
  message: Message,
  excludeUserId: string
) {
  const participants = await getThreadParticipants(threadId);
  const sender = await getUser(message.senderId);
  
  for (const participant of participants) {
    if (participant.id === excludeUserId) continue;
    
    // Generate secure, time-limited link
    const threadLink = await generateSecureThreadLink(threadId, participant.id);
    
    // Get user's notification preferences
    const prefs = await getNotificationPreferences(participant.id);
    
    // Send via their preferred channels (outbound only)
    if (prefs.sms && participant.phone) {
      await sendSMS(
        participant.phone,
        `New message from ${sender.firstName} in ${threadName}. View: ${threadLink}`
      );
    }
    
    if (prefs.email && participant.email) {
      await sendEmail(
        participant.email,
        `New message from ${sender.firstName}`,
        renderEmailTemplate({
          senderName: sender.firstName,
          messagePreview: message.content.slice(0, 100),
          threadLink,
        })
      );
    }
    
    // Push notification for mobile app users
    if (participant.pushToken) {
      await sendPushNotification(participant.pushToken, {
        title: `${sender.firstName} in ${threadName}`,
        body: message.content.slice(0, 100),
        data: { threadId },
      });
    }
  }
}

// Generate secure, time-limited link
async function generateSecureThreadLink(threadId: string, userId: string) {
  const token = generateRandomToken();
  
  // Store token with 24-hour expiry
  await redis.set(
    `thread-link:${token}`,
    JSON.stringify({ threadId, userId }),
    'EX',
    86400 // 24 hours
  );
  
  return `${process.env.APP_URL}/t/${token}`;
}
```

### Secure Link Handler

```typescript
// apps/web/app/t/[token]/page.tsx

export default async function ThreadLinkPage({ params }: { params: { token: string } }) {
  const { user } = await auth();
  
  // Verify token
  const linkData = await redis.get(`thread-link:${params.token}`);
  if (!linkData) {
    return <div>Link expired. Please request a new notification.</div>;
  }
  
  const { threadId, userId } = JSON.parse(linkData);
  
  // Verify user is authorized
  if (!user || user.id !== userId) {
    return redirect(`/sign-in?redirect=/t/${params.token}`);
  }
  
  // Redirect to thread
  return redirect(`/messages/${threadId}`);
}
```

---

## Bot Prevention Strategy

### 1. Family Verification System

**Open Registration with Family Verification:**
- Anyone can create an account (standard email verification)
- During onboarding, user selects existing family members
- Requires confirmation from 1 admin OR 2 non-admin family members
- Only verified family members can access family content

```typescript
// User can register, but needs family verification to join groups
// See model.md for FamilyJoinRequest interface

// claimedRelationships: Array<{      // Who they claim to be related to
//   personId: string;
//   relationshipType: RelationshipType;
// }>;
// confirmations: Array<{             // Confirmations from family members
//   confirmedBy: string;
//   confirmedAt: Date;
//   isAdmin: boolean;
// }>;
// Step 1: User creates account (standard registration)
export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
}) {
  // Standard account creation
  const user = await db.insert(users).values({
    ...data,
    passwordHash: await hashPassword(data.password),
    emailVerified: false,
  }).returning();
  
  // Send email verification
  await sendVerificationEmail(user.email, user.id);
  
  return user;
}

// Step 2: Onboarding - User searches for family members
export async function searchFamilyMembers(query: string) {
  // Search by name (privacy-aware, limited info)
  return await db.query.users.findMany({
    where: or(
      ilike(users.firstName, `%${query}%`),
      ilike(users.lastName, `%${query}%`)
    ),
    columns: {
      id: true,
      firstName: true,
      lastName: true,
      // NO email, phone, or other private info
    },
    limit: 20,
  });
}

// Step 3: User submits family join request
export async function requestToJoinFamily(
  userId: string,
  groupId: string,
  claimedRelationships: Array<{
    personId: string;
    relationshipType: RelationshipType;
  }>
) {
  // Create join request
  const request = await db.insert(familyJoinRequests).values({
    userId,
    groupId,
    claimedRelationships,
    status: RequestStatus.PENDING,
    confirmations: [],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }).returning();
  
  // Notify claimed family members
  for (const claim of claimedRelationships) {
    await notifyFamilyMember(claim.personId, {
      type: NotificationType.FAMILY_JOIN_REQUEST,
      requestId: request.id,
      userId,
      relationshipType: claim.relationshipType,
    });
  }
  
  // Notify all group admins
  const admins = await getGroupAdmins(groupId);
  for (const admin of admins) {
    await notifyFamilyMember(admin.id, {
      type: NotificationType.FAMILY_JOIN_REQUEST,
      requestId: request.id,
      userId,
    });
  }
  
  return request;
}

// Step 4: Family member confirms relationship
export async function confirmFamilyMember(
  requestId: string,
  confirmerId: string
) {
  const request = await db.query.familyJoinRequests.findFirst({
    where: eq(familyJoinRequests.id, requestId),
  });
  
  if (!request || request.status !== RequestStatus.PENDING) {
    throw new Error('Invalid or expired request');
  }
  
  // Check if confirmer is admin or claimed family member
  const isAdmin = await isGroupAdmin(confirmerId, request.groupId);
  const isClaimed = request.claimedRelationships.some(
    r => r.personId === confirmerId
  );
  
  if (!isAdmin && !isClaimed) {
    throw new Error('You cannot confirm this request');
  }
  
  // Add confirmation
  const confirmations = [
    ...request.confirmations,
    {
      confirmedBy: confirmerId,
      confirmedAt: new Date(),
      isAdmin,
    },
  ];
  
  // Check if request is approved
  const hasAdminApproval = confirmations.some(c => c.isAdmin);
  const nonAdminConfirmations = confirmations.filter(c => !c.isAdmin).length;
  
  const isApproved = hasAdminApproval || nonAdminConfirmations >= 2;
  
  await db.update(familyJoinRequests)
    .set({
      confirmations,
      status: isApproved ? RequestStatus.APPROVED : RequestStatus.PENDING,
    })
    .where(eq(familyJoinRequests.id, requestId));
  
  // If approved, add user to family
  if (isApproved) {
    await addUserToFamily(request.userId, request.groupId, request.claimedRelationships);
    
    // Notify user
    await notifyUser(request.userId, {
      type: NotificationType.FAMILY_JOIN_APPROVED,
      groupId: request.groupId,
    });
  }
  
  return { approved: isApproved };
}

// Add user to family group and create relationships
async function addUserToFamily(
  userId: string,
  groupId: string,
  relationships: Array<{ personId: string; relationshipType: RelationshipType }>
) {
  // Add to group
  await db.insert(groupMemberships).values({
    groupId,
    personId: userId,
    role: GroupRole.MEMBER,
    status: MembershipStatus.ACTIVE,
    joinedAt: new Date(),
  });
  
  // Create relationships (pending confirmation from other party)
  for (const rel of relationships) {
    await db.insert(relationships).values({
      personAId: userId,
      personBId: rel.personId,
      relationshipType: rel.relationshipType,
      status: RelationshipStatus.PENDING,
      confirmedBy: [userId], // User confirms, other party needs to confirm
    });
  }
}
```

### 2. Optional Invitations (Encourage Family to Join)

```typescript
// Users can send invitations to encourage family members to join
// But invitations are NOT required - anyone can register
// See model.md for Invitation interface

export async function inviteFamilyMember(
  inviterId: string,
  email: string,
  data: {
    firstName?: string;
    lastName?: string;
    relationship?: RelationshipType;
    groupId: string;
  }
) {
  const inviter = await getUser(inviterId);
  if (!inviter) throw new Error('Invalid inviter');
  
  // Create invitation
  const invitation = await db.insert(invitations).values({
    invitedBy: inviterId,
    email,
    ...data,
    status: RequestStatus.PENDING,
    token: generateRandomToken(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  }).returning();
  
  // Send invitation email
  await sendEmail(
    email,
    `${inviter.firstName} invited you to join their family on Peeps`,
    renderInvitationEmail({
      inviterName: inviter.firstName,
      inviteLink: `${process.env.APP_URL}/join?token=${invitation.token}`,
    })
  );
  
  return invitation;
}

// When invited user signs up, auto-approve if they use invitation token
export async function registerWithInvitation(token: string, userData: any) {
  const invitation = await db.query.invitations.findFirst({
    where: and(
      eq(invitations.token, token),
      eq(invitations.status, 'pending')
    ),
  });
  
  if (!invitation || invitation.expiresAt < new Date()) {
    throw new Error('Invalid or expired invitation');
  }
  
  // Create user account
  const user = await registerUser(userData);
  
  // Auto-approve and add to family (invitation = pre-approval)
  await db.insert(groupMemberships).values({
    groupId: invitation.groupId,
    personId: user.id,
    role: GroupRole.MEMBER,
    status: MembershipStatus.ACTIVE,
    invitedBy: invitation.invitedBy,
    joinedAt: new Date(),
  });
  
  // Create relationship if specified
  if (invitation.relationship) {
    await db.insert(relationships).values({
      personAId: user.id,
      personBId: invitation.invitedBy,
      relationshipType: invitation.relationship,
      status: RelationshipStatus.ACTIVE, // Pre-approved via invitation
      confirmedBy: [user.id, invitation.invitedBy],
    });
  }
  
  // Mark invitation as accepted
  await db.update(invitations)
    .set({ status: RequestStatus.APPROVED })
    .where(eq(invitations.id, invitation.id));
  
  return user;
}
```

### 3. Parent-Child Relationship Creation

```typescript
// Parents can add children without child's confirmation
// Children are auto-verified if added by parent

export async function addChild(
  parentId: string,
  childData: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: Date;
    email?: string; // Optional for minors
  }
) {
  const parent = await getUser(parentId);
  if (!parent) throw new Error('Invalid parent');
  
  const isMinor = calculateAge(childData.dateOfBirth) < 18;
  
  // Create child account (or person record if no email)
  const child = await db.insert(users).values({
    ...childData,
    createdBy: parentId,
    isMinor,
    privacyLevel: isMinor ? PrivacyLevel.PRIVATE : PrivacyLevel.FAMILY,
    requiresParentApproval: isMinor,
    emailVerified: false,
  }).returning();
  
  // Create parent-child relationship (auto-confirmed)
  await db.insert(relationships).values({
    personAId: parentId,
    personBId: child.id,
    relationshipType: RelationshipType.PARENT,
    status: RelationshipStatus.ACTIVE,
    confirmedBy: [parentId], // Parent confirms, child auto-confirmed
  });
  
  // Add child to parent's family groups
  const parentGroups = await getUserGroups(parentId);
  for (const group of parentGroups) {
    await db.insert(groupMemberships).values({
      groupId: group.id,
      personId: child.id,
      role: GroupRole.MEMBER,
      status: MembershipStatus.ACTIVE,
      invitedBy: parentId,
      joinedAt: new Date(),
    });
  }
  
  // If child has email, send welcome email (parent can help them set password)
  if (childData.email) {
    await sendEmail(
      childData.email,
      'Welcome to Peeps!',
      renderChildWelcomeEmail({
        childName: childData.firstName,
        parentName: parent.firstName,
        setupLink: `${process.env.APP_URL}/setup/${child.id}`,
      })
    );
  }
  
  return child;
}

// Child can claim their account when they turn 13+
export async function claimChildAccount(
  childId: string,
  password: string
) {
  const child = await getUser(childId);
  if (!child) throw new Error('Invalid account');
  
  const age = calculateAge(child.dateOfBirth);
  if (age < 13) {
    throw new Error('Must be at least 13 to claim account');
  }
  
  // Set password and activate account
  await db.update(users)
    .set({
      passwordHash: await hashPassword(password),
      emailVerified: true,
      requiresParentApproval: age < 18, // Still need approval until 18
    })
    .where(eq(users.id, childId));
  
  return child;
}
```

### 4. Relationship Verification

```typescript
// Both parties must confirm relationship (except parent-child)

export async function confirmRelationship(
  relationshipId: string,
  userId: string
) {
  const relationship = await db.query.relationships.findFirst({
    where: eq(relationships.id, relationshipId),
  });
  
  if (!relationship) throw new Error('Relationship not found');
  
  // Check if user is part of this relationship
  if (relationship.personAId !== userId && relationship.personBId !== userId) {
    throw new Error('Unauthorized');
  }
  
  // Add user to confirmed list
  const confirmedBy = [...relationship.confirmedBy, userId];
  
  // Relationship active only when BOTH parties confirm
  const status = confirmedBy.length >= 2 ? RelationshipStatus.ACTIVE : RelationshipStatus.PENDING;
  
  await db.update(relationships)
    .set({ confirmedBy, status })
    .where(eq(relationships.id, relationshipId));
  
  // Notify other party if now active
  if (status === RelationshipStatus.ACTIVE) {
    const otherPartyId = relationship.personAId === userId 
      ? relationship.personBId 
      : relationship.personAId;
    
    await notifyUser(otherPartyId, {
      type: NotificationType.RELATIONSHIP_CONFIRMED,
      relationshipId,
    });
  }
}
```

### 5. Rate Limiting

```typescript
// Prevent spam and abuse

import rateLimit from 'express-rate-limit';

// Limit invitations per user
export const inviteLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // 10 invitations per day
  message: 'Too many invitations. Please try again tomorrow.',
});

// Limit messages per user
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: 'Slow down! Too many messages.',
});

// Limit API calls per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP.',
});
```

### 6. Content Moderation

```typescript
// Automated content filtering

import Filter from 'bad-words';

const filter = new Filter();

export async function moderateContent(content: string) {
  // Check for profanity
  if (filter.isProfane(content)) {
    return {
      allowed: false,
      reason: 'Content contains inappropriate language',
    };
  }
  
  // Check for spam patterns
  if (isSpam(content)) {
    return {
      allowed: false,
      reason: 'Content appears to be spam',
    };
  }
  
  // Check for links (optional, configurable per family)
  if (containsExternalLinks(content)) {
    return {
      allowed: true,
      flagged: true,
      reason: 'Content contains external links',
    };
  }
  
  return { allowed: true };
}

function isSpam(content: string): boolean {
  const spamPatterns = [
    /buy now/i,
    /click here/i,
    /limited time/i,
    /act now/i,
    /congratulations/i,
    /you've won/i,
    /crypto/i,
    /investment opportunity/i,
  ];
  
  return spamPatterns.some(pattern => pattern.test(content));
}
```

### 7. Admin Controls

```typescript
// Family admins can moderate content
// See model.md for ModerationAction interface

export async function deleteMessage(
  messageId: string,
  adminId: string,
  reason: string
) {
  // Verify admin has permission
  const isAdmin = await verifyGroupAdmin(adminId, threadId);
  if (!isAdmin) throw new Error('Unauthorized');
  
  // Soft delete message
  await db.update(messages)
    .set({ deletedAt: new Date(), deletedBy: adminId })
    .where(eq(messages.id, messageId));
  
  // Log moderation action
  await db.insert(moderationActions).values({
    performedBy: adminId,
    targetType: ResourceType.MESSAGE,
    targetId: messageId,
    action: ModerationAction.DELETE,
    reason,
  });
}
```

---

## User Experience: Notification Preferences

```typescript
// apps/web/app/settings/notifications/page.tsx
// See model.md for NotificationPreferences interface
```

---

## Cost Analysis: Privacy-First Approach

### MVP (Free Tier)
- **Peeps App**: $0 (Vercel Hobby)
- **Database**: $0 (Vercel Postgres free tier)
- **Auth**: $0 (Clerk free tier, 10k MAU)
- **Email**: $0 (Resend 3k/month)
- **Push**: $0 (Expo Notifications)
- **Total**: $0/month

### With Premium Features
- **Peeps App**: $0 (Vercel Hobby)
- **Database**: $0-19 (Neon free or Scale)
- **Auth**: $0-25 (Clerk free or Pro)
- **Email**: $0-20 (Resend free or paid)
- **SMS**: ~$10 (100 notifications/month)
- **Total**: $10-74/month

### At Scale (1,000 families)
- **Hosting**: $20 (Vercel Pro)
- **Database**: $19 (Neon Scale)
- **Auth**: $25 (Clerk Pro)
- **Email**: $40 (Resend)
- **SMS**: $80 (1,000 notifications/month)
- **Total**: $184/month

**No data sold. No ads. No corporate surveillance.**

---

## Revised Integration Priority

### Phase 1: MVP (Weeks 9-12)
1. ✅ Peeps native app (web + mobile)
2. ✅ Email notifications (outbound only)
3. ✅ Push notifications (mobile)
4. ✅ Invitation system
5. ✅ Basic content moderation

### Phase 2: Premium (Weeks 13-16)
1. SMS notifications (outbound only, premium)
2. Email replies (with strict filtering)
3. SMS replies (premium)
4. Advanced content moderation
5. Admin moderation tools

### Phase 3: Never
- ❌ Facebook integration
- ❌ WhatsApp Business API
- ❌ Instagram
- ❌ Any platform that requires data sharing

---

## Family Safety Features

### 1. Minor Protection
```typescript
// Automatic protections for users under 18

export async function createUser(data: UserData) {
  const isMinor = calculateAge(data.dateOfBirth) < 18;
  
  if (isMinor) {
    // Force privacy settings
    data.privacyLevel = 'private';
    
    // Require parent approval
    data.requiresParentApproval = true;
    
    // Disable external notifications
    data.notificationPreferences = {
      pushNotifications: true,  // In-app only
      email: false,             // No email
      sms: false,               // No SMS
    };
  }
  
  return await db.insert(users).values(data);
}
```

### 2. Content Reporting
```typescript
// See model.md for ContentReport interface
```

### 3. Block/Mute Users
```typescript
// Users can block or mute other users
// See model.md for UserBlock interface

// Blocked users can't:
// - Send direct messages
// - See your posts
// - Tag you in photos
// - Invite you to groups

// Muted users:
// - You don't see their messages
// - They don't know they're muted
```

---

## Summary: Privacy-First Peeps

**What Peeps IS:**
- Closed family platform
- Your data, your control
- No bots, no spam, no marketing
- Safe for all ages
- Free from corporate surveillance

**What Peeps IS NOT:**
- Not a public social network
- Not connected to Facebook/Meta
- Not selling your data
- Not showing ads
- Not using algorithms

**Communication Strategy:**
- Peeps app is primary (web + mobile)
- Email/SMS for notifications only
- All replies happen in Peeps
- No external platforms can post
- Complete control over your family's data

This approach keeps your family safe, private, and free from the nonsense that plagues other platforms.
