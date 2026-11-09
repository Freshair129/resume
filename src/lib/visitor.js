const VISITOR_ID_KEY = 'pp_visitor_id';
const CONVERSATION_ID_KEY = 'pp_conversation_id';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createUuid() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    if (globalThis.crypto?.getRandomValues) {
      const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
  } catch {
    // Fall through to a non-cryptographic UUID when browser crypto is unavailable.
  }

  const bytes = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function getOrCreateId(storageName, key) {
  try {
    const storage = globalThis[storageName];
    const current = storage?.getItem(key);
    if (UUID_PATTERN.test(current || '')) return current;

    const id = createUuid();
    storage?.setItem(key, id);
    return id;
  } catch {
    return createUuid();
  }
}

export function getVisitorId() {
  return getOrCreateId('localStorage', VISITOR_ID_KEY);
}

export function getConversationId() {
  return getOrCreateId('sessionStorage', CONVERSATION_ID_KEY);
}

export function getSource() {
  try {
    const ref = new URL(globalThis.location.href).searchParams.get('ref')?.trim();
    if (ref) return ref.slice(0, 255);

    if (globalThis.document?.referrer) {
      return new URL(globalThis.document.referrer).host.slice(0, 255) || 'direct';
    }
  } catch {
    // Treat inaccessible or malformed browser metadata as a direct visit.
  }

  return 'direct';
}

export function isDoNotTrackEnabled() {
  try {
    return globalThis.navigator?.doNotTrack === '1';
  } catch {
    return false;
  }
}
