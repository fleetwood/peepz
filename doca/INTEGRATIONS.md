# Peeps Messaging Platform Integrations

## Overview

Peeps aggregates messages from multiple platforms into unified threads. This document outlines integration requirements, costs, and implementation strategies for each platform.

---

## Platform Priority Matrix

### Tier 1: MVP (Free/Low Cost)
- ✅ Email (SMTP/IMAP)
- ✅ SMS (Twilio - deferred to premium)
- ⚠️ WhatsApp (Business API - deferred to premium)

### Tier 2: Post-MVP
- Telegram
- Facebook Messenger
- Signal
- Discord

### Tier 3: Future Consideration
- Instagram DMs
- Slack
- Microsoft Teams
- iMessage (Apple ecosystem only)
- WeChat (China market)
- Line (Asian market)

### Not Supported
- ❌ Twitter/X DMs (API too expensive: $100/month minimum)
- ❌ Snapchat (no public API)
- ❌ TikTok (limited API access)

---

## Integration Details

### 1. Email (IMAP/SMTP)

**Status**: MVP - Free

**Use Case**: Universal fallback, works with any email provider

**Implementation**:
- **Incoming**: IMAP polling or webhooks (SendGrid Inbound Parse)
- **Outgoing**: SMTP via Resend or SendGrid
- **Threading**: Email thread IDs, In-Reply-To headers

**Costs**:
- Resend: 3,000 emails/month free, then $20/month for 50k
- SendGrid: 100 emails/day free, then $19.95/month for 50k

**Setup**:
```typescript
// apps/api/src/services/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  await resend.emails.send({
    from: 'notifications@peeps.family',
    to,
    subject,
    html,
  });
}

// Inbound email webhook handler
export async function handleInboundEmail(payload: any) {
  // Parse email, extract thread ID, store message
  const threadId = extractThreadId(payload.headers);
  await createMessage({
    threadId,
    content: payload.text,
    externalSource: 'email',
    externalMessageId: payload.messageId,
  });
}
```

**Pros**:
- Universal compatibility
- No API costs
- Reliable delivery

**Cons**:
- Not real-time (polling delay)
- Spam filtering issues
- Complex threading logic

---

### 2. SMS (Twilio)

**Status**: Premium Feature (Pay-as-you-go)

**Use Case**: Direct mobile communication, especially for older family members

**Implementation**:
- **Incoming**: Twilio webhook
- **Outgoing**: Twilio API
- **Threading**: Custom thread ID in message body or database mapping

**Costs**:
- Outbound SMS: $0.0079/message (US)
- Inbound SMS: $0.0079/message (US)
- Phone number: $1.15/month
- Group SMS: Limited to 20 recipients per message

**Setup**:
```typescript
// apps/api/src/services/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, body: string) {
  await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    body,
  });
}

// Webhook handler for incoming SMS
export async function handleInboundSMS(req: Request) {
  const { From, Body, MessageSid } = req.body;
  
  // Find or create thread for this phone number
  const threadId = await findThreadByPhone(From);
  
  await createMessage({
    threadId,
    content: Body,
    externalSource: 'sms',
    externalMessageId: MessageSid,
  });
}
```

**Pros**:
- Works on any mobile phone
- High delivery rate
- No app required

**Cons**:
- Costs per message
- 20-person group limit
- No rich media (MMS costs more)
- Carrier restrictions

**Premium Feature Strategy**:
- Free tier: 0 SMS
- Premium: 500 SMS/month included, then pay-as-you-go

---

### 3. WhatsApp Business API

**Status**: Premium Feature (Free API, but requires verification)

**Use Case**: International families, especially in Europe, Latin America, Asia

**Implementation**:
- **Incoming**: WhatsApp webhook (via Twilio or Meta)
- **Outgoing**: WhatsApp Business API
- **Threading**: WhatsApp conversation IDs

**Costs**:
- **Via Twilio**: $0.005-0.02/message depending on country
- **Via Meta Direct**: Free for first 1,000 conversations/month, then $0.005-0.09/message
- **Setup**: Requires Facebook Business verification (1-2 weeks)

**Setup Options**:

**Option A: Twilio (Easier)**
```typescript
// apps/api/src/services/whatsapp.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsApp(to: string, body: string) {
  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`,
    body,
  });
}
```

**Option B: Meta Cloud API (Cheaper)**
```typescript
// apps/api/src/services/whatsapp-meta.ts
import axios from 'axios';

export async function sendWhatsApp(to: string, body: string) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      },
    }
  );
}
```

**Pros**:
- 2+ billion users globally
- Rich media support (images, videos, documents)
- End-to-end encryption
- Read receipts
- Group messaging

**Cons**:
- Requires Facebook Business verification
- 24-hour messaging window (unless template messages)
- Complex setup
- Costs per message

**Premium Feature Strategy**:
- Free tier: 0 WhatsApp messages
- Premium: 100 messages/month included, then pay-as-you-go

---

### 4. Telegram Bot API

**Status**: Post-MVP (Free)

**Use Case**: Tech-savvy families, privacy-conscious users

**Implementation**:
- **Incoming**: Telegram webhook or long polling
- **Outgoing**: Telegram Bot API
- **Threading**: Telegram chat IDs

**Costs**:
- **Free**: Unlimited messages
- No phone number required

**Setup**:
```typescript
// apps/api/src/services/telegram.ts
import axios from 'axios';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function sendTelegram(chatId: string, text: string) {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
  });
}

// Webhook handler
export async function handleTelegramWebhook(update: any) {
  const message = update.message;
  
  await createMessage({
    threadId: await findThreadByTelegramChat(message.chat.id),
    content: message.text,
    externalSource: 'telegram',
    externalMessageId: message.message_id.toString(),
  });
}

// Set webhook
export async function setTelegramWebhook() {
  await axios.post(`${TELEGRAM_API}/setWebhook`, {
    url: `${process.env.API_URL}/webhooks/telegram`,
  });
}
```

**Pros**:
- Completely free
- Rich media support
- Group chats up to 200,000 members
- Bots can be added to existing groups
- File sharing up to 2GB

**Cons**:
- Requires users to have Telegram
- Less popular in US
- Bot must be added to groups

**Implementation Priority**: High (free and easy)

---

### 5. Facebook Messenger

**Status**: Post-MVP (Free API, requires Facebook app)

**Use Case**: Families already using Facebook

**Implementation**:
- **Incoming**: Messenger webhook
- **Outgoing**: Send API
- **Threading**: Messenger conversation IDs

**Costs**:
- **Free**: Unlimited messages
- Requires Facebook App review

**Setup**:
```typescript
// apps/api/src/services/messenger.ts
import axios from 'axios';

export async function sendMessenger(recipientId: string, text: string) {
  await axios.post(
    `https://graph.facebook.com/v18.0/me/messages`,
    {
      recipient: { id: recipientId },
      message: { text },
    },
    {
      params: {
        access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
      },
    }
  );
}

// Webhook handler
export async function handleMessengerWebhook(entry: any) {
  const messaging = entry.messaging[0];
  
  if (messaging.message) {
    await createMessage({
      threadId: await findThreadByMessengerId(messaging.sender.id),
      content: messaging.message.text,
      externalSource: 'facebook',
      externalMessageId: messaging.message.mid,
    });
  }
}
```

**Pros**:
- Free
- Large user base
- Rich media support
- Group conversations

**Cons**:
- Requires Facebook account
- App review process
- Privacy concerns
- 24-hour messaging window

**Implementation Priority**: Medium (popular but requires Facebook)

---

### 6. Signal

**Status**: Future (Limited API)

**Use Case**: Privacy-focused families

**Implementation**:
- **Incoming**: Signal CLI or third-party bridge
- **Outgoing**: Signal CLI
- **Threading**: Signal group IDs

**Costs**:
- **Free**: Unlimited messages

**Setup**:
```bash
# Requires signal-cli installation
# Not officially supported, uses unofficial CLI tool
```

**Pros**:
- End-to-end encryption
- Privacy-focused
- Open source

**Cons**:
- No official API
- Requires phone number
- Unofficial tools may break
- Complex setup

**Implementation Priority**: Low (no official API)

---

### 7. Discord

**Status**: Post-MVP (Free)

**Use Case**: Gaming families, tech-savvy groups

**Implementation**:
- **Incoming**: Discord bot with message events
- **Outgoing**: Discord API
- **Threading**: Discord channel IDs

**Costs**:
- **Free**: Unlimited messages

**Setup**:
```typescript
// apps/api/src/services/discord.ts
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  await createMessage({
    threadId: await findThreadByDiscordChannel(message.channelId),
    content: message.content,
    externalSource: 'discord',
    externalMessageId: message.id,
  });
});

export async function sendDiscord(channelId: string, content: string) {
  const channel = await client.channels.fetch(channelId);
  if (channel?.isTextBased()) {
    await channel.send(content);
  }
}

client.login(process.env.DISCORD_BOT_TOKEN);
```

**Pros**:
- Free
- Rich media and embeds
- Voice/video channels
- Large communities

**Cons**:
- Requires Discord account
- More for communities than families
- Bot must be invited to servers

**Implementation Priority**: Low (niche use case)

---

### 8. Instagram DMs

**Status**: Future (Limited API)

**Use Case**: Younger family members

**Implementation**:
- **Incoming**: Instagram webhook (business accounts only)
- **Outgoing**: Instagram Graph API
- **Threading**: Instagram conversation IDs

**Costs**:
- **Free**: Unlimited messages
- Requires Instagram Business account
- Requires Facebook App review

**Pros**:
- Popular with younger users
- Rich media support

**Cons**:
- Business account required
- Complex setup
- Limited API access
- 24-hour messaging window

**Implementation Priority**: Low (limited API, business only)

---

### 9. Slack

**Status**: Future (Free API)

**Use Case**: Work-family groups, remote families

**Implementation**:
- **Incoming**: Slack Events API
- **Outgoing**: Slack Web API
- **Threading**: Slack channel/thread IDs

**Costs**:
- **Free**: Unlimited messages

**Pros**:
- Free
- Rich integrations
- Threading support
- File sharing

**Cons**:
- Requires Slack workspace
- More for work than family
- OAuth complexity

**Implementation Priority**: Low (work-focused)

---

### 10. iMessage (Apple)

**Status**: Not Feasible

**Use Case**: Apple ecosystem families

**Implementation**:
- No official API
- Would require Mac server with iMessage
- Violates Apple ToS

**Pros**:
- Popular in US
- Rich features

**Cons**:
- No official API
- Apple ecosystem only
- Not feasible

**Implementation Priority**: None (no API)

---

## Integration Architecture

### Unified Message Queue

```typescript
// apps/api/src/services/message-aggregator.ts
import { Queue } from 'bullmq';
import { ExternalSource } from '@peeps/types';

const messageQueue = new Queue('messages', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
});

export async function queueInboundMessage(data: {
  source: ExternalSource;
  externalId: string;
  threadId: string;
  content: string;
  senderId: string;
  metadata?: any;
}) {
  await messageQueue.add('inbound', data);
}

// Worker processes messages from all sources
export async function processInboundMessage(job: any) {
  const { source, externalId, threadId, content, senderId } = job.data;
  
  // Check for duplicates
  const exists = await db
    .select()
    .from(messages)
    .where(eq(messages.externalMessageId, externalId))
    .limit(1);
  
  if (exists.length > 0) return;
  
  // Store message
  await db.insert(messages).values({
    threadId,
    senderId,
    content,
    externalSource: source,
    externalMessageId: externalId,
    messageType: 'text',
  });
  
  // Notify thread participants via Pusher
  await notifyThreadParticipants(threadId, {
    type: 'message:new',
    message: { content, source },
  });
}
```

### Webhook Router

```typescript
// apps/api/src/routes/webhooks.ts
import express from 'express';

const router = express.Router();

router.post('/email', handleEmailWebhook);
router.post('/sms', handleSMSWebhook);
router.post('/whatsapp', handleWhatsAppWebhook);
router.post('/telegram', handleTelegramWebhook);
router.post('/messenger', handleMessengerWebhook);
router.post('/discord', handleDiscordWebhook);

export default router;
```

---

## Implementation Roadmap

### Phase 1: MVP (Weeks 9-12)
- ✅ Email (IMAP/SMTP)
- ✅ In-app messaging (Pusher)
- ⚠️ SMS (premium only, defer implementation)

### Phase 2: Post-MVP (Weeks 13-16)
- Telegram Bot API (free, easy)
- WhatsApp Business API (premium)
- SMS via Twilio (premium)

### Phase 3: Future (Weeks 17+)
- Facebook Messenger
- Discord
- Instagram DMs (if business use case emerges)

---

## Cost Estimates

### Free Tier (MVP)
- Email: 3,000/month (Resend)
- Telegram: Unlimited
- Total: $0/month

### Premium Tier (Post-MVP)
- Email: 50,000/month ($20)
- SMS: 500 messages/month (~$4)
- WhatsApp: 100 messages/month (~$1)
- Total: ~$25/month for premium features

### At Scale (1,000 active families)
- Email: 100,000/month ($40)
- SMS: 10,000 messages/month (~$80)
- WhatsApp: 5,000 messages/month (~$25)
- Total: ~$145/month

---

## Security Considerations

### Webhook Verification
- Verify all incoming webhooks with signatures
- Use HTTPS only
- Rate limit webhook endpoints

### Token Storage
- Store API tokens in environment variables
- Rotate tokens regularly
- Use separate tokens per environment

### Message Privacy
- Encrypt messages at rest
- Don't log message content
- Respect platform privacy policies

---

## Testing Strategy

### Mock Services
- Create mock webhook payloads
- Test message threading logic
- Verify deduplication

### Integration Tests
- Test each platform in sandbox mode
- Verify bidirectional messaging
- Test error handling

---

## Recommended Implementation Order

1. **Email** (Week 9) - Universal, free
2. **In-app** (Week 10) - Core feature
3. **Telegram** (Week 15) - Free, easy API
4. **SMS** (Week 16) - Premium feature
5. **WhatsApp** (Week 17) - Premium feature, requires verification
6. **Messenger** (Week 18+) - If demand exists
7. **Discord** (Week 19+) - Niche use case

---

## Questions to Consider

1. **Should we support all platforms or focus on most popular?**
   - Recommendation: Start with Email + Telegram (both free), add SMS/WhatsApp as premium

2. **How do we handle platform-specific features (reactions, threads, etc)?**
   - Recommendation: Normalize to common denominator, store platform-specific data as metadata

3. **What happens when a platform API changes or shuts down?**
   - Recommendation: Abstract integrations behind service layer, easy to swap implementations

4. **Should users link their own accounts or use Peeps bot accounts?**
   - Recommendation: Peeps bot accounts (simpler), user accounts for premium (more features)
