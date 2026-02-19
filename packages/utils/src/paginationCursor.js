import { Buffer } from 'buffer';
export function decodeOffsetCursor(cursor) {
    if (!cursor)
        return 0;
    try {
        const raw = Buffer.from(cursor, 'base64').toString('utf8');
        const parsed = JSON.parse(raw);
        return typeof parsed.offset === 'number' && parsed.offset >= 0 ? parsed.offset : 0;
    }
    catch {
        return 0;
    }
}
export function encodeOffsetCursor(offset) {
    return Buffer.from(JSON.stringify({ offset }), 'utf8').toString('base64');
}
