import type { InboxMessage, InboxTimeFields } from '../types/inbox';
import type { NotificationData } from '../types/notification';

/**
 * Picks a displayable string from various shapes the native bridge may return.
 */
function resolveImageUrlFromEntry(value: unknown): string | undefined {
  if (value == null) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value || undefined;
  }
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    for (const key of ['url', 'uri', 'src'] as const) {
      const v = o[key];
      if (typeof v === 'string' && v) {
        return v;
      }
    }
  }
  return undefined;
}

/**
 * If `images` is a string array, return the first usable URL; otherwise
 * return `undefined` (keyed object handled by {@link getImageUrlByKey}).
 */
function getFirstArrayEntryUrl(images: unknown): string | undefined {
  if (!Array.isArray(images) || images.length === 0) {
    return undefined;
  }
  for (const item of images) {
    const u = resolveImageUrlFromEntry(item);
    if (u) {
      return u;
    }
  }
  return undefined;
}

/**
 * Resolves a URL for a key like `icon` or `main` on a map-shaped `images`
 * value.
 */
function getImageUrlByKey(
  images: unknown,
  key: string
): string | undefined {
  if (images == null) {
    return undefined;
  }
  if (typeof images !== 'object' || Array.isArray(images)) {
    return undefined;
  }
  const o = images as Record<string, unknown>;
  if (!(key in o)) {
    return undefined;
  }
  return resolveImageUrlFromEntry(o[key]);
}

/**
 * Picks a thumbnail for the list: prefers `main`, then `icon`, then any
 * string/nested value.
 */
export function getFirstImageUrl(
  images: InboxMessage['images'] | undefined
): string | undefined {
  if (images == null) {
    return undefined;
  }
  const fromMain = getImageUrlByKey(images, 'main');
  if (fromMain) {
    return fromMain;
  }
  const fromIcon = getImageUrlByKey(images, 'icon');
  if (fromIcon) {
    return fromIcon;
  }
  if (Array.isArray(images)) {
    return getFirstArrayEntryUrl(images);
  }
  if (typeof images === 'object') {
    const o = images as Record<string, unknown>;
    for (const v of Object.values(o)) {
      const u = resolveImageUrlFromEntry(v);
      if (u) {
        return u;
      }
    }
  }
  return undefined;
}

/**
 * Resolves `icon` and `main` URLs for the detail screen.
 */
export function getIconAndMainFromImages(
  images: InboxMessage['images'] | undefined
): { icon: string | undefined; main: string | undefined } {
  return {
    icon: getImageUrlByKey(images, 'icon'),
    main: getImageUrlByKey(images, 'main'),
  };
}

const pad = (n: number) => n.toString().padStart(2, '0');

/**
 * Formats an ISO-8601-ish or native date string for a short in-app label.
 */
function formatInboxDateString(value: string): string {
  const t = Date.parse(value);
  if (Number.isNaN(t)) {
    return value;
  }
  const d = new Date(t);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/**
 * Shown in meta rows; empty string if missing or invalid.
 */
export function formatInboxDateField(
  value: string | null | undefined
): string {
  if (value == null || value === '') {
    return '';
  }
  return formatInboxDateString(value);
}

/**
 * Prefer `sent_at`, else `created_at` for a list/detail “sent” label.
 */
export function formatInboxSentDate(
  m: InboxTimeFields
): string {
  const raw = m.sent_at ?? m.created_at;
  if (raw == null || raw === '') {
    return '';
  }
  return formatInboxDateString(raw);
}

/**
 * Renders string fields; empty string when missing.
 */
export function formatInboxValue(
  v: string | null | undefined
): string {
  if (v == null) {
    return '';
  }
  return v;
}

/**
 * Pretty-prints the message for the “Notification data” block.
 */
export function messageToJsonString(data: NotificationData): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}
