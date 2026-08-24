import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

import type {
  AssociatePersonResponse,
  DeviceInfoResponse,
  DeviceResponse,
  InboxMessage,
  PersonResponse,
} from './types';

export type {
  AssociatePersonResponse,
  DeviceInfoResponse,
  DeviceResponse,
  InboxMessage,
  PersonResponse,
} from './types';

const LINKING_ERROR =
  `The package 'vibes-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const NativeVibes = NativeModules.Vibes
  ? NativeModules.Vibes
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

/**
 * Returns the wrapper SDK version string.
 *
 * @return {Promise<string>}
 */
export function getSDKVersion(): Promise<string> {
  return NativeVibes.getSDKVersion();
}

/**
 * Register this device with the Vibes platform
 *
 * @return {Promise<DeviceResponse>}
 */
export function registerDevice(): Promise<DeviceResponse> {
  return NativeVibes.registerDevice();
}
/**
 * Unregister this device with the Vibes platform
 *
 * @return {Promise<void>}
 */
export function unregisterDevice(): Promise<void> {
  return NativeVibes.unregisterDevice();
}

/**
 * Register this device to receive push notifications
 *
 * @return {Promise<void>}
 */
export function registerPush(): Promise<void> {
  return NativeVibes.registerPush();
}

/**
 * Unregister the device from receiving push notifications
 *
 * @return {Promise<void>}
 */
export function unregisterPush(): Promise<void> {
  return NativeVibes.unregisterPush();
}

/**
 * Fetches a DeviceInfoResponse with details about the Vibes Device ID and Push Token
 *
 * @return {Promise<DeviceInfoResponse>}
 */
export function getVibesDeviceInfo(): Promise<DeviceInfoResponse> {
  return NativeVibes.getVibesDeviceInfo();
}

/**
 * Updates the Vibes platform with changes to the device since the last time device information was submitted.
 *
 * @param updateCredential - if true, the authentication token will be refreshed. Unless required, pass false here.
 * @param latitude - if you collect geolocation information, then pass the latitude here. Otherwise, pass 0
 * @param longitude - if you collect geolocation information, then pass the latitude here. Otherwise, pass 0
 * @returns {Promise<void>}
 */
export function updateDevice(
  updateCredential: boolean,
  latitude: number,
  longitude: number
): Promise<void> {
  return NativeVibes.updateDevice(updateCredential, latitude, longitude);
}

/**
 * Associate an external ID with the current person.
 *
 * @param {string} externalPersonId
 * @return {Promise<AssociatePersonResponse>}
 */
export function associatePerson(
  externalPersonId: string
): Promise<AssociatePersonResponse> {
  return NativeVibes.associatePerson(externalPersonId);
}

/**
 * Fetches the PersonResponse associated with this device currently
 *
 * @return {Promise<PersonResponse>}
 */
export function getPerson(): Promise<PersonResponse> {
  return NativeVibes.getPerson();
}
/**
 * Fetches an array of inbox messages for the person associated with this device.
 *
 * @return {Promise<InboxMessage[]>}
 */
export function fetchInboxMessages(): Promise<InboxMessage[]> {
  return NativeVibes.fetchInboxMessages();
}

/**
 * Fetches a single inbox message by it's id.
 *
 * @param {string} message_uid
 * @return {Promise<InboxMessage>}
 */
export function fetchInboxMessage(message_uid: string): Promise<InboxMessage> {
  return NativeVibes.fetchInboxMessage(message_uid);
}

/**
 * Marks an inbox message as read.
 *
 * @param {string} message_uid
 * @return {Promise<InboxMessage>} an updated version of the InboxMessage with read field updated
 */
export function markInboxMessageAsRead(
  message_uid: string
): Promise<InboxMessage> {
  return NativeVibes.markInboxMessageAsRead(message_uid);
}

/**
 * Marks an inbox message as expired using message_uid and the expiry date supplied. Uses current date as expiry date
 *
 * @param {string} message_uid
 * @return {Promise<InboxMessage>} an updated version of the InboxMessage with expires_at date updated
 */
export function expireInboxMessage(message_uid: string): Promise<InboxMessage> {
  return NativeVibes.expireInboxMessage(message_uid);
}

/**
 * Records an event for when the user opens an inbox message.
 *
 * @param inboxMessage - json map of the InboxMessage
 * @return {Promise<void>}
 */
export function onInboxMessageOpen(inboxMessage: InboxMessage): Promise<void> {
  return NativeVibes.onInboxMessageOpen(inboxMessage);
}

/**
 * Records an event for when the user fetches a list of inbox messages.
 *
 * @return {Promise<void>}
 */
export function onInboxMessagesFetched(): Promise<void> {
  return NativeVibes.onInboxMessagesFetched();
}

/**
 * Requests notification permissions from the OS.
 *
 * - iOS: prompts via UNUserNotificationCenter and registers for remote notifications
 * - Android 13+: requests POST_NOTIFICATIONS via PermissionsAndroid
 * - Android 12 and below: no-op (permission not required)
 *
 * @return {Promise<void>}
 */
export async function requestNotificationPermissions(): Promise<void> {
  if (Platform.OS === 'android') {
    const apiLevel =
      typeof Platform.Version === 'number'
        ? Platform.Version
        : parseInt(String(Platform.Version), 10);
    // POST_NOTIFICATIONS is only required on Android 13+ (API 33)
    if (!Number.isNaN(apiLevel) && apiLevel < 33) {
      return;
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Notification permissions denied');
    }
    return;
  }
  return NativeVibes.requestNotificationPermissions();
}

const Vibes = new Proxy(NativeVibes, {
  get(target, prop, receiver) {
    if (prop === 'requestNotificationPermissions') {
      return requestNotificationPermissions;
    }
    const value = Reflect.get(target, prop, receiver);
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

export default Vibes;
