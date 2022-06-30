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

export function registerDevice(): Promise<any> {
  return Vibes.registerDevice();
}

export function unregisterDevice(): Promise<any> {
  return Vibes.unregisterDevice();
}

export function registerPush(): Promise<any> {
  return Vibes.registerPush();
}

export function getVibesDeviceInfo(): Promise<any> {
  return Vibes.getVibesDeviceInfo();
}

export function updateDevice(
  updateCredential: boolean,
  latitude: number,
  longitude: number
): Promise<any> {
  return Vibes.updateDevice(updateCredential, latitude, longitude);
}

export function associatePerson(externalPersonId: string): Promise<any> {
  return Vibes.associatePerson(externalPersonId);
}

export default Vibes;
