import type { InboxMessage } from './inbox';

/**
 * Full message JSON shown in the "Notification data" section — same as an
 * {@link InboxMessage} returned from the SDK.
 */
export type NotificationData = InboxMessage;

/**
 * Payload for push open/received handlers. Native modules pass an opaque
 * object; use narrow guards when reading fields.
 */
export type PushNotificationEvent = Readonly<Record<string, unknown>>;
