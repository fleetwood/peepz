# Socket Pub/Sub Domain Rules

## Overview

The socket server broadcasts real-time events to all connected clients using a hierarchical domain topic system. A **topic** is a `Set<string>` of domain segments. Clients subscribe to topics and receive updates when a broadcast topic matches their subscription.

All connections are public — no authentication is required to receive broadcasts. Authentication only affects presence tracking (logged-in member count).

---

## Message Shape

```ts
{ topic: Set<string>, payload: unknown }
```

- `topic` — a Set of domain segments, e.g. `{ 'POST', 'comments', 'abc123' }`
- `payload` — arbitrary data relevant to the event

> **Wire format**: topics are serialized as slash-separated strings over the wire (`POST/comments/abc123`) and parsed into a `Set` on receipt. Order in the wire format is stylistic only — matching is always set-based.

---

## Matching Rules

A subscription fires when the broadcast topic and the subscription topic share a **bidirectional subset** relationship:

> A subscription fires if **all segments of the smaller Set are present in the larger Set**.

### Rule

```
const smaller = pub.size <= sub.size ? pub : sub
const larger  = pub.size <= sub.size ? sub : pub
fires = [...smaller].every(seg => larger.has(seg))
```

### Examples

| Pub | Sub | Fires? | Reason |
|-----|-----|--------|--------|
| `[POST]` | `[POST, comments, abc123]` | Yes | Sub contains all pub segments |
| `[POST, comments]` | `[POST, comments, abc123]` | Yes | Sub contains all pub segments |
| `[POST, comments, abc123]` | `[POST, comments, abc123]` | Yes | Exact match |
| `[POST, comments, abc123]` | `[POST, abc123]` | Yes | Sub is subset of pub (skips `comments`) |
| `[POST, comments, abc123]` | `[POST]` | Yes | Sub is subset of pub |
| `[POST, comments]` | `[POST, likes, abc123]` | No | `likes` not in pub, `comments` not in sub |
| `[POST, likes, abc123]` | `[POST, likes, xyz999]` | No | Key mismatch (`abc123` != `xyz999`) |
| `[GALLERY, comments]` | `[POST, comments]` | No | Domain mismatch (`GALLERY` != `POST`) |

---

## Topic Structure

A topic is a `Set<string>` with the following conventions:

```
{ DOMAIN, subdomain?, nomenclature?, key? }
```

- **DOMAIN** — top-level entity type (required). **Only one domain per topic.**
- **subdomain** — optional relationship or sub-entity classifier
- **nomenclature** — optional further classification
- **key** — primary key (UUID). Multiple keys are allowed.

When serialized for readability (wire format or docs), segments are written broadest-to-atomic with the key last: `DOMAIN/subdomain/nomenclature/key`. Matching ignores order.

---

## Domains

### `presence`

Tracks the count of authenticated members currently connected.

```
presence
```

- `payload: number` — current count of unique logged-in members
- Broadcast on every connect and disconnect
- Anonymous visitors receive this but do not increment the count

---

### `POST`

```
{ POST }
{ POST, key }
{ POST, comments, key }
{ POST, comments, postKey, commentKey }
{ POST, likes, key }
{ POST, likes, postKey, likeKey }
```

| Broadcast | Affected Subscribers |
|-----------|----------------------|
| `{ POST }` | All post-related subscribers |
| `{ POST, key }` | Subscribers to that specific post or any of its sub-topics |
| `{ POST, comments, key }` | Comment list for that post |
| `{ POST, comments, postKey, commentKey }` | Specific comment; also fires `{ POST, postKey }` and `{ POST }` subs |
| `{ POST, likes, key }` | Like count/list for that post |

---

### `GROUP`

```
{ GROUP }
{ GROUP, key }
{ GROUP, members, key }
{ GROUP, members, groupKey, memberKey }
{ GROUP, events, key }
{ GROUP, events, groupKey, eventKey }
{ GROUP, albums, key }
{ GROUP, albums, groupKey, albumKey }
```

---

### `THREAD`

```
{ THREAD }
{ THREAD, key }
{ THREAD, messages, key }
{ THREAD, messages, threadKey, messageKey }
{ THREAD, participants, key }
{ THREAD, participants, threadKey, participantKey }
```

---

### `ALBUM`

```
{ ALBUM }
{ ALBUM, key }
{ ALBUM, media, key }
{ ALBUM, media, albumKey, mediaKey }
{ ALBUM, media, tags, albumKey, mediaKey, tagKey }
```

---

### `EVENT`

```
{ EVENT }
{ EVENT, key }
{ EVENT, participants, key }
{ EVENT, participants, eventKey, personKey }
```

---

### `MEMBER`

```
{ MEMBER, key }
{ MEMBER, presence, key }
```

- `{ MEMBER, presence, key }` — online/offline status of a specific member
- Only broadcast when a member's session changes

---

## Server Broadcast Triggers

Broadcasts are initiated by server actions after a successful write. The socket server exposes a `/broadcast` HTTP endpoint for internal use by Next.js server actions.

| Action | Broadcast Topic |
|--------|---------------|
| New post created | `{ POST }` |
| Post updated | `{ POST, key }` |
| Comment added | `{ POST, comments, postKey }` |
| Comment deleted | `{ POST, comments, postKey, commentKey }` |
| Like added/removed | `{ POST, likes, postKey }` |
| New message in thread | `{ THREAD, messages, threadKey }` |
| Member joins group | `{ GROUP, members, groupKey }` |
| Event RSVP updated | `{ EVENT, participants, eventKey }` |
| Media added to album | `{ ALBUM, media, albumKey }` |
| Member comes online | `{ presence }` |
| Member goes offline | `{ presence }` |

---

## Constraints

- **One domain per topic** — a topic must contain exactly one domain segment. Cross-domain subscriptions are not supported.
- **Key is always last** — when serializing for readability, keys (UUIDs) are written last.
- **Multiple keys are allowed** — e.g. `{ POST, comments, postKey, commentKey }` scopes a comment to a specific post.
- **Matching is set-based** — the wire format is slash-separated for readability only. The matching algorithm treats topics as `Set<string>` and is order-independent.