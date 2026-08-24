export const mockInboxMessage = {
  message_uid: 'msg-1',
  subject: 'Hello',
  content: 'World',
  read: false,
  inbox_custom_data: { key: 'value' },
};

export const mockVibesNativeModule = {
  getSDKVersion: jest.fn(() => Promise.resolve('1.2.0')),
  registerDevice: jest.fn(() => Promise.resolve({ device_id: 'device-123' })),
  unregisterDevice: jest.fn(() => Promise.resolve()),
  registerPush: jest.fn(() => Promise.resolve()),
  unregisterPush: jest.fn(() => Promise.resolve()),
  getVibesDeviceInfo: jest.fn(() =>
    Promise.resolve({
      device_id: 'device-123',
      push_token: 'push-token-abc',
    })
  ),
  updateDevice: jest.fn(() => Promise.resolve()),
  associatePerson: jest.fn((externalPersonId: string) =>
    Promise.resolve({ externalPersonId, status: 'success' })
  ),
  getPerson: jest.fn(() =>
    Promise.resolve({
      person_key: 'person-key-1',
      external_person_id: 'ext-1',
    })
  ),
  fetchInboxMessages: jest.fn(() => Promise.resolve([mockInboxMessage])),
  fetchInboxMessage: jest.fn((messageId: string) =>
    Promise.resolve({
      ...mockInboxMessage,
      message_uid: messageId,
    })
  ),
  markInboxMessageAsRead: jest.fn((messageId: string) =>
    Promise.resolve({
      ...mockInboxMessage,
      message_uid: messageId,
      read: true,
    })
  ),
  expireInboxMessage: jest.fn((messageId: string) =>
    Promise.resolve({
      ...mockInboxMessage,
      message_uid: messageId,
    })
  ),
  onInboxMessageOpen: jest.fn((_message: unknown) => Promise.resolve()),
  onInboxMessagesFetched: jest.fn(() => Promise.resolve()),
  requestNotificationPermissions: jest.fn(() => Promise.resolve()),
};

export function resetMockVibesNativeModule() {
  Object.values(mockVibesNativeModule).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      (fn as jest.Mock).mockClear();
    }
  });
}
