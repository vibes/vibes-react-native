import type { InboxMessage as VibesInboxMessage } from 'vibes-react-native';

/**
 * Inbox message in the sample app: SDK shape plus optional `sent_at` when
 * the platform sends it.
 */
export type InboxMessage = VibesInboxMessage & { sent_at?: string };

export type InboxTimeFields = Pick<InboxMessage, 'sent_at' | 'created_at'>;

/** Route params for the inbox message detail screen (root stack). */
export type InboxMessageDetailParams = { messageUid: string };
