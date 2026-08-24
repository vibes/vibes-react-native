import {
  mockInboxMessage,
  mockVibesNativeModule,
  resetMockVibesNativeModule,
} from './mocks/vibesNativeModule';

import * as VibesSDK from '..';
import VibesDefault from '..';

describe('vibes-react-native public API', () => {
  beforeEach(() => {
    resetMockVibesNativeModule();
  });

  describe('export surface', () => {
    it('exposes all named public methods', () => {
      const expectedMethods = [
        'getSDKVersion',
        'registerDevice',
        'unregisterDevice',
        'registerPush',
        'unregisterPush',
        'associatePerson',
        'updateDevice',
        'getPerson',
        'fetchInboxMessages',
        'fetchInboxMessage',
        'markInboxMessageAsRead',
        'expireInboxMessage',
        'onInboxMessageOpen',
        'onInboxMessagesFetched',
        'getVibesDeviceInfo',
        'requestNotificationPermissions',
      ] as const;

      for (const method of expectedMethods) {
        expect(typeof VibesSDK[method]).toBe('function');
      }
    });

    it('supports default-export style calls used by the sample app', () => {
      expect(VibesDefault).toBeDefined();
      expect(typeof VibesDefault.registerDevice).toBe('function');
      expect(typeof VibesDefault.getSDKVersion).toBe('function');
      expect(typeof VibesDefault.getVibesDeviceInfo).toBe('function');
    });
  });

  describe('device and push APIs', () => {
    it('getSDKVersion returns a version string', async () => {
      await expect(VibesSDK.getSDKVersion()).resolves.toBe('1.2.0');
      expect(mockVibesNativeModule.getSDKVersion).toHaveBeenCalledTimes(1);
    });

    it('registerDevice returns device info with device_id', async () => {
      const result = await VibesSDK.registerDevice();
      expect(result).toEqual({ device_id: 'device-123' });
      expect(mockVibesNativeModule.registerDevice).toHaveBeenCalledTimes(1);
    });

    it('unregisterDevice completes successfully', async () => {
      await expect(VibesSDK.unregisterDevice()).resolves.toBeUndefined();
      expect(mockVibesNativeModule.unregisterDevice).toHaveBeenCalledTimes(1);
    });

    it('registerPush completes successfully', async () => {
      await expect(VibesSDK.registerPush()).resolves.toBeUndefined();
      expect(mockVibesNativeModule.registerPush).toHaveBeenCalledTimes(1);
    });

    it('unregisterPush completes successfully', async () => {
      await expect(VibesSDK.unregisterPush()).resolves.toBeUndefined();
      expect(mockVibesNativeModule.unregisterPush).toHaveBeenCalledTimes(1);
    });

    it('getVibesDeviceInfo returns device_id and push_token', async () => {
      const info = await VibesSDK.getVibesDeviceInfo();
      expect(info).toMatchObject({
        device_id: 'device-123',
        push_token: 'push-token-abc',
      });
    });

    it('updateDevice forwards credentials and coordinates', async () => {
      await VibesSDK.updateDevice(false, 41.88, -87.63);
      expect(mockVibesNativeModule.updateDevice).toHaveBeenCalledWith(
        false,
        41.88,
        -87.63
      );
    });
  });

  describe('person APIs', () => {
    it('associatePerson returns association status', async () => {
      const result = await VibesSDK.associatePerson('ext-person-1');
      expect(result).toEqual({
        externalPersonId: 'ext-person-1',
        status: 'success',
      });
      expect(mockVibesNativeModule.associatePerson).toHaveBeenCalledWith(
        'ext-person-1'
      );
    });

    it('getPerson returns person_key and external_person_id', async () => {
      const person = await VibesSDK.getPerson();
      expect(person).toMatchObject({
        person_key: 'person-key-1',
        external_person_id: 'ext-1',
      });
    });
  });

  describe('inbox APIs', () => {
    it('fetchInboxMessages returns messages with RN inbox fields', async () => {
      const messages = await VibesSDK.fetchInboxMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        message_uid: 'msg-1',
        subject: 'Hello',
        content: 'World',
        read: false,
        inbox_custom_data: { key: 'value' },
      });
    });

    it('fetchInboxMessage returns a single message by id', async () => {
      const message = await VibesSDK.fetchInboxMessage('msg-42');
      expect(message.message_uid).toBe('msg-42');
      expect(mockVibesNativeModule.fetchInboxMessage).toHaveBeenCalledWith(
        'msg-42'
      );
    });

    it('markInboxMessageAsRead returns an updated message', async () => {
      const message = await VibesSDK.markInboxMessageAsRead('msg-1');
      expect(message.read).toBe(true);
      expect(mockVibesNativeModule.markInboxMessageAsRead).toHaveBeenCalledWith(
        'msg-1'
      );
    });

    it('expireInboxMessage returns an updated message', async () => {
      const message = await VibesSDK.expireInboxMessage('msg-1');
      expect(message.message_uid).toBe('msg-1');
      expect(mockVibesNativeModule.expireInboxMessage).toHaveBeenCalledWith(
        'msg-1'
      );
    });

    it('onInboxMessageOpen forwards a full InboxMessage object', async () => {
      await VibesSDK.onInboxMessageOpen(mockInboxMessage);
      expect(mockVibesNativeModule.onInboxMessageOpen).toHaveBeenCalledWith(
        mockInboxMessage
      );
    });

    it('onInboxMessageOpen forwards legacy message_uid-only objects unchanged', async () => {
      const legacyMessage = {
        message_uid: 'legacy-uid',
        subject: 'Legacy',
        content: 'Body',
        read: false,
        inbox_custom_data: {},
      };
      await VibesSDK.onInboxMessageOpen(legacyMessage);
      expect(mockVibesNativeModule.onInboxMessageOpen).toHaveBeenCalledWith(
        legacyMessage
      );
    });

    it('default.onInboxMessageOpen forwards the full message map', async () => {
      await VibesDefault.onInboxMessageOpen(mockInboxMessage);
      expect(mockVibesNativeModule.onInboxMessageOpen).toHaveBeenCalledWith(
        mockInboxMessage
      );
    });

    it('onInboxMessagesFetched completes successfully', async () => {
      await expect(VibesSDK.onInboxMessagesFetched()).resolves.toBeUndefined();
      expect(
        mockVibesNativeModule.onInboxMessagesFetched
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('notification helpers', () => {
    const { PermissionsAndroid, Platform } = require('react-native');
    let originalOS: string;
    let originalVersion: string | number;

    beforeEach(() => {
      originalOS = Platform.OS;
      originalVersion = Platform.Version;
    });

    afterEach(() => {
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        writable: true,
        value: originalOS,
      });
      Object.defineProperty(Platform, 'Version', {
        configurable: true,
        writable: true,
        value: originalVersion,
      });
      jest.restoreAllMocks();
    });

    function mockPlatform(os: string, version: string | number) {
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        writable: true,
        value: os,
      });
      Object.defineProperty(Platform, 'Version', {
        configurable: true,
        writable: true,
        value: version,
      });
    }

    it('requestNotificationPermissions on iOS delegates to native', async () => {
      mockPlatform('ios', '17.0');
      await VibesSDK.requestNotificationPermissions();
      expect(
        mockVibesNativeModule.requestNotificationPermissions
      ).toHaveBeenCalledTimes(1);
    });

    it('requestNotificationPermissions on Android 13+ uses PermissionsAndroid', async () => {
      mockPlatform('android', 33);
      const requestSpy = jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);

      await VibesSDK.requestNotificationPermissions();

      expect(requestSpy).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      expect(
        mockVibesNativeModule.requestNotificationPermissions
      ).not.toHaveBeenCalled();
    });

    it('requestNotificationPermissions on Android 12 and below is a no-op', async () => {
      mockPlatform('android', 32);
      const requestSpy = jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);

      await VibesSDK.requestNotificationPermissions();

      expect(requestSpy).not.toHaveBeenCalled();
      expect(
        mockVibesNativeModule.requestNotificationPermissions
      ).not.toHaveBeenCalled();
    });

    it('requestNotificationPermissions rejects when Android permission is denied', async () => {
      mockPlatform('android', 34);
      jest
        .spyOn(PermissionsAndroid, 'request')
        .mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

      await expect(VibesSDK.requestNotificationPermissions()).rejects.toThrow(
        'Notification permissions denied'
      );
    });

    it('default.requestNotificationPermissions uses the JS wrapper', async () => {
      mockPlatform('ios', '17.0');
      await VibesDefault.requestNotificationPermissions();
      expect(
        mockVibesNativeModule.requestNotificationPermissions
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('default export parity with sample-app usage', () => {
    it('default.registerDevice reaches the native module', async () => {
      await VibesDefault.registerDevice();
      expect(mockVibesNativeModule.registerDevice).toHaveBeenCalledTimes(1);
    });

    it('default.getVibesDeviceInfo reaches the native module', async () => {
      const info = await VibesDefault.getVibesDeviceInfo();
      expect(info.device_id).toBe('device-123');
    });

    it('default.associatePerson reaches the native module', async () => {
      await VibesDefault.associatePerson('ext-2');
      expect(mockVibesNativeModule.associatePerson).toHaveBeenCalledWith(
        'ext-2'
      );
    });
  });

  describe('linking error', () => {
    it('throws when the Vibes native module is missing', () => {
      const { NativeModules } = require('react-native');
      const previous = NativeModules.Vibes;
      NativeModules.Vibes = undefined;

      try {
        jest.isolateModules(() => {
          const { registerDevice } = require('..');
          expect(() => registerDevice()).toThrow(/doesn't seem to be linked/);
        });
      } finally {
        NativeModules.Vibes = previous;
      }
    });
  });
});
