import React, { useEffect, useState } from 'react';
import {
  Alert,
  DeviceEventEmitter,
  NativeEventEmitter,
  NativeModules,
  Platform,
  StatusBar,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTheme } from 'styled-components/native';
import DeviceInfo from 'react-native-device-info';
import type { AppTheme } from '../../theme/brand';
import NetInfo from '@react-native-community/netinfo';
import Vibes, { DeviceInfoResponse } from 'vibes-react-native';
import {
  BlockButton,
  BlockButtonText,
  BuildKicker,
  BuildPanel,
  BuildVersion,
  ButtonRow,
  FieldLabel,
  HalfButton,
  HomeScroll,
  LastPanel,
  Panel,
  PersonIdInput,
  PrimaryButtonText,
  ScreenRoot,
  SectionTitle,
  ValuePill,
} from './Home.styled';

const version = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();

const Home = (): React.ReactElement => {
  const theme = useTheme() as AppTheme;
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<Partial<DeviceInfoResponse>>({});
  const [externalPersonId, setExternalPersonId] = useState('');
  const [personKey, setPersonKey] = useState('');

  const onPushReceived = (event: Readonly<Record<string, unknown>>) => {
    console.log('Push received', event);
    // eslint-disable-next-line no-alert
    Alert.alert('Push received' + JSON.stringify(event));
  };

  const onPushOpened = async (event: Readonly<Record<string, unknown>>) => {
    console.log('Push opened', event);
    // eslint-disable-next-line no-alert
    Alert.alert('Push opened' + JSON.stringify(event));
  };

  const addEventListeners = () => {
    console.log('Creating event listeners');
    const eventEmitter =
      Platform.OS === 'ios'
        ? new NativeEventEmitter(NativeModules.PushEventEmitter)
        : DeviceEventEmitter;
    eventEmitter.addListener('pushReceived', onPushReceived);
    eventEmitter.addListener('pushOpened', onPushOpened);
    console.log('Event listeners created');
  };
  useEffect(() => {
    addEventListeners();
  }, []);

  const onPressRegisterDevice = async () => {
    try {
      if (deviceId) {
        await Vibes.unregisterDevice();
        setDeviceId(null);
      } else {
        const result = await Vibes.registerDevice();
        console.log('Register Device Result -> ' + JSON.stringify(result));
        setDeviceId(result.device_id);
      }
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line no-alert
      Alert.alert('Failed to Register Device -> ' + error);
    }
  };

  const copyDeviceIdToClipboard = async () => {
    if (deviceId) {
      Clipboard.setString(deviceId);
    }
  };

  const copyExternalPersonIdToClipboard = async () => {
    if (externalPersonId) {
      Clipboard.setString(externalPersonId);
    }
  };

  const copyPersonkeyToClipboard = async () => {
    if (personKey) {
      Clipboard.setString(personKey);
    }
  };

  const onPressRegisterPush = async () => {
    try {
      if (pushToken) {
        await Vibes.unregisterPush();
        setPushToken(null);
      } else {
        await Vibes.registerPush();
        const result: DeviceInfoResponse = await Vibes.getVibesDeviceInfo();
        if (result.device_id) {
          setDeviceId(result.device_id);
        }
        if (result.push_token) {
          setPushToken(result.push_token);
        }
      }
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line no-alert
      Alert.alert('Failed to Register Push -> ' + error);
    }
  };

  const copyPushTokenToClipboard = async () => {
    if (pushToken) {
      Clipboard.setString(pushToken);
    }
  };

  const onPressAssociatePerson = async () => {
    try {
      const result = await Vibes.associatePerson(externalPersonId);
      console.log('External PersonID: ' + externalPersonId);
      console.log(result);
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line no-alert
      Alert.alert('Failed to Associate Person -> ' + error);
    }
  };

  const onPressUpdateDevice = async () => {
    try {
      const result = await Vibes.updateDevice(false, 0.0, 0.0);
      console.log(result);
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line no-alert
      Alert.alert('Failed to Update Device -> ' + error);
    }
  };

  const onPressGetPersonInfo = async () => {
    try {
      const result = await Vibes.getPerson();
      setExternalPersonId(result.external_person_id);
      setPersonKey(result.person_key);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  const getVibesDeviceInfo = async () => {
    try {
      const result: DeviceInfoResponse = await Vibes.getVibesDeviceInfo();
      if (result.device_id) {
        setDeviceId(result.device_id);
      }
      if (result.push_token) {
        setPushToken(result.push_token);
      }
      setDeviceInfo(result);
    } catch (error) {
      console.log(error);
      // eslint-disable-next-line no-alert
      Alert.alert('Failed to Fetch Device Info -> ' + error);
    }
  };

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        // eslint-disable-next-line no-alert
        Alert.alert('Error: No Internet Connection.');
      }
    });
    getVibesDeviceInfo();
  }, []);

  useEffect(() => {
    if (deviceInfo.device_id) {
      setDeviceId(deviceInfo.device_id);
    }
    if (deviceInfo.push_token) {
      setPushToken(deviceInfo.push_token);
    }
  }, [deviceInfo]);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.navBackground} />
      <ScreenRoot>
        <HomeScroll>
          <BuildPanel>
            <BuildKicker>Build</BuildKicker>
            <BuildVersion>
              {version}.{buildNumber}
            </BuildVersion>
          </BuildPanel>

          <Panel>
            <SectionTitle>Vibes device ID</SectionTitle>
            <ValuePill selectable>
              {deviceId ?? '— Not registered yet'}
            </ValuePill>
            <ButtonRow>
              <HalfButton onPress={onPressRegisterDevice} activeOpacity={0.8}>
                <PrimaryButtonText>
                  {deviceId ? 'Unregister' : 'Register'}
                </PrimaryButtonText>
              </HalfButton>
              <HalfButton
                $inactive={!deviceId}
                onPress={copyDeviceIdToClipboard}
                disabled={!deviceId}
                activeOpacity={0.8}
              >
                <PrimaryButtonText $inactive={!deviceId}>Copy</PrimaryButtonText>
              </HalfButton>
            </ButtonRow>
          </Panel>

          <Panel>
            <SectionTitle>Push token</SectionTitle>
            <ValuePill selectable>
              {pushToken ?? '— No token yet'}
            </ValuePill>
            <ButtonRow>
              <HalfButton onPress={onPressRegisterPush} activeOpacity={0.8}>
                <PrimaryButtonText>
                  {pushToken ? 'Unregister' : 'Register push'}
                </PrimaryButtonText>
              </HalfButton>
              <HalfButton
                $inactive={!pushToken}
                onPress={copyPushTokenToClipboard}
                disabled={!pushToken}
                activeOpacity={0.8}
              >
                <PrimaryButtonText $inactive={!pushToken}>Copy</PrimaryButtonText>
              </HalfButton>
            </ButtonRow>
          </Panel>

          <Panel>
            <SectionTitle>Person & device</SectionTitle>
            <FieldLabel>External person ID</FieldLabel>
            <PersonIdInput
              onChangeText={setExternalPersonId}
              value={externalPersonId}
              placeholder="Enter external person id"
              placeholderTextColor="rgba(103, 103, 103, 0.5)"
            />
            <BlockButton
              onPress={onPressAssociatePerson}
              activeOpacity={0.8}
            >
              <BlockButtonText>Associate person</BlockButtonText>
            </BlockButton>
            <ButtonRow>
              <HalfButton onPress={onPressUpdateDevice} activeOpacity={0.8}>
                <PrimaryButtonText>Update device</PrimaryButtonText>
              </HalfButton>
              <HalfButton onPress={onPressGetPersonInfo} activeOpacity={0.8}>
                <PrimaryButtonText>Get person info</PrimaryButtonText>
              </HalfButton>
            </ButtonRow>
          </Panel>

          <Panel>
            <SectionTitle>External person ID (current)</SectionTitle>
            <ValuePill selectable>
              {externalPersonId || '—'}
            </ValuePill>
            <BlockButton
              $inactive={!externalPersonId}
              onPress={copyExternalPersonIdToClipboard}
              disabled={!externalPersonId}
              activeOpacity={0.8}
            >
              <BlockButtonText $inactive={!externalPersonId}>Copy</BlockButtonText>
            </BlockButton>
          </Panel>

          <LastPanel>
            <SectionTitle>Person key</SectionTitle>
            <ValuePill selectable>
              {personKey || '—'}
            </ValuePill>
            <BlockButton
              $inactive={!personKey}
              onPress={copyPersonkeyToClipboard}
              disabled={!personKey}
              activeOpacity={0.8}
            >
              <BlockButtonText $inactive={!personKey}>Copy</BlockButtonText>
            </BlockButton>
          </LastPanel>
        </HomeScroll>
      </ScreenRoot>
    </>
  );
};

export default Home;
