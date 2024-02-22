import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'vibes-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const Vibes = NativeModules.Vibes
  ? NativeModules.Vibes
  : new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  );

export interface DeviceResponse {
  device_id?: string;
}
export interface DeviceInfoResponse extends DeviceResponse {
  push_token?: string;
}

export interface PersonResponse {
  person_key?: string;
  external_person_id?: string;
}

export interface InboxMessage {
  content?: string;
  created_at?: string;
  expires_at?: string;
  message_uid?: string;
  read?: boolean;
  subject?: string;
  detail?: string;
  collapse_key?: string;
  apprefdata?: any;
  images?: any;
  inbox_custom_data: any;
}

/**
 * Register this device with the Vibes platform
 *
 * @return {Promise<DeviceResponse>}
 */
export function registerDevice(): Promise<DeviceResponse> {
  return Vibes.registerDevice();
}
/**
 * Unregister this device with the Vibes platform
 *
 * @return {Promise<void>}
 */
export function unregisterDevice(): Promise<void> {
  return Vibes.unregisterDevice();
}

/**
 * Register this device to receive push notifications
 *
 * @return {Promise<void>}
 */
export function registerPush(): Promise<void> {
  return Vibes.registerPush();
}

/**
* Unregister the device from receiving push notifications
*
* @return {Promise<void>}
*/
export function unregisterPush(): Promise<void> {
  return Vibes.registerPush();
}

/**
 * Fetches a DeviceInfoResponse with details about the Vibes Device ID and Push Token
 *
 * @return {Promise<DeviceInfoResponse>}
 */
export function getVibesDeviceInfo(): Promise<DeviceInfoResponse> {
  return Vibes.getVibesDeviceInfo();
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
  return Vibes.updateDevice(updateCredential, latitude, longitude);
}

/**
 * Associate an external ID with the current person.
 *
 * @param {string} externalPersonId
 * @return {Promise<void>}
 */
export function associatePerson(externalPersonId: string): Promise<void> {
  return Vibes.associatePerson(externalPersonId);
}

/**
 * Fetches the PersonResponse associated with this device currently
 *
 * @return {Promise<PersonResponse>}
 */
export function getPerson(): Promise<PersonResponse> {
  return Vibes.getPerson();
}
/**
 * Fetches an array of inbox messages for the person associated with this device.
 *
 * @return {Promise<InboxMessage[]>}
 */
export function fetchInboxMessages(): Promise<InboxMessage[]> {
  return Vibes.fetchInboxMessages();
}

/**
 * Fetches a single inbox message by it's id.
 *
 * @param {string} message_uid
 * @return {Promise<InboxMessage>}
 */
export function fetchInboxMessage(message_uid: string): Promise<InboxMessage> {
  return Vibes.fetchInboxMessage(message_uid);
}

/**
 * Marks an inbox message as read.
 *
 * @param {string} message_uid
 * @return {Promise<InboxMessage>} an updated version of the InboxMessage with read field updated
 */
export function markInboxMessageAsRead(message_uid: string): Promise<InboxMessage> {
  return Vibes.markInboxMessageAsRead(message_uid);
}

/**
 * Marks an inbox message as expired using message_uid and the expiry date supplied. Uses current date as expiry date
 *
 * @param {string} message_uid
 * @return {Promise<InboxMessage>} an updated version of the InboxMessage with expires_at date updated
 */
export function expireInboxMessage(message_uid: string): Promise<InboxMessage> {
  return Vibes.expireInboxMessage(message_uid);
}

/**
 * Records an event for when the user opens an inbox message.
 *
 * @param inboxMap json map of the InboxMessage
 * @return {Promise<void>}
 */
export function onInboxMessageOpen(inboxMap: InboxMessage): Promise<void> {
  return Vibes.onInboxMessageOpen(inboxMap);
}

/**
 * Records an event for when the user fetches a list of inbox messages.
 *
 * @return {Promise<void>}
 */
export function onInboxMessagesFetched(): Promise<void> {
  return Vibes.onInboxMessagesFetched();
}

export default Vibes;
