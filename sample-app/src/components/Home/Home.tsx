import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
  Platform,
  TextInput,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Clipboard from '@react-native-clipboard/clipboard';
import { Col, Grid, Row } from 'react-native-easy-grid';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import Vibes from 'vibes-react-native';

const version = DeviceInfo.getVersion();
const buildNumber = DeviceInfo.getBuildNumber();

const Home = ({ navigation }): React.ReactElement => {
  const [deviceId, setDeviceId] = useState(null);
  const [pushToken, setPushToken] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [externalPersonId, setExternalPersonId] = useState('');
  const [personKey, setPersonKey] = useState('');
  const [inboxMessages, setInboxMessages] = useState({});

  const onPushReceived = (event: { payload: any }) => {
    // eslint-disable-next-line no-alert
    alert('Push received. Payload -> ' + JSON.stringify(event.payload));
  };

  const onPushOpened = async (event: { payload: any }) => {
    // eslint-disable-next-line no-alert
    alert('Push opened. Payload -> ' + JSON.stringify(event.payload));
  };

  const eventEmitter =
    Platform.OS === 'ios'
      ? new NativeEventEmitter(NativeModules.PushEventEmitter)
      : DeviceEventEmitter;

  eventEmitter.addListener('pushReceived', onPushReceived);
  eventEmitter.addListener('pushOpened', onPushOpened);

  const onPressRegisterDevice = async () => {
    try {
      if (deviceId) {
        await Vibes.unregisterDevice();
        setDeviceId(null);
      } else {
        const result = await Vibes.registerDevice();
        setDeviceId(result.device_id);
      }
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line no-alert
      alert('Failed to Register Device -> ' + error);
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
        const result = await Vibes.getVibesDeviceInfo();
        // setDeviceInfo(result);
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
      alert('Failed to Register Push -> ' + error);
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
      alert('Failed to Associate Person -> ' + error);
    }
  };

  const onPressUpdateDevice = async () => {
    try {
      const result = await Vibes.updateDevice(false, 0.0, 0.0);
      console.log(result);
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line no-alert
      alert('Failed to Update Device -> ' + error);
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
      const result = await Vibes.getVibesDeviceInfo();
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
      alert('Failed to Fetch Device Info -> ' + error);
    }
  };

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        // eslint-disable-next-line no-alert
        alert('Error: No Internet Connection.');
      }
    });
    getVibesDeviceInfo();
  }, []);

  useEffect(() => {
    if (deviceInfo && deviceInfo.deviceId) {
      setDeviceId(deviceInfo.device_id);
    }
    if (deviceInfo && deviceInfo.pushToken) {
      setPushToken(deviceInfo.push_token);
    }
  }, [deviceInfo]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}
        >
          <View style={styles.hr} />
          <Text style={styles.buildHeader}>Build #</Text>
          <Text style={styles.buildBody}>
            {version}.{buildNumber}
          </Text>
          <View style={styles.hr} />
          <Grid>
            <Row>
              <Col size={4}>
                <View style={styles.sectionArea}>
                  <Text style={styles.sectionTitle}>Vibes Device ID</Text>
                </View>
              </Col>
              <Col size={2}>
                <View>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => onPressRegisterDevice()}
                  >
                    <Text style={styles.buttonText}>
                      {deviceId ? 'Unregister' : 'Register'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Col>
            </Row>
            <Row>
              <Col size={4}>
                <View style={styles.sectionArea}>
                  <Text>{deviceId}</Text>
                </View>
              </Col>
              <Col size={2}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => copyDeviceIdToClipboard()}
                >
                  <Text style={styles.buttonText}>Copy</Text>
                </TouchableOpacity>
              </Col>
            </Row>
            <Row>
              <Col size={4}>
                <View style={styles.sectionArea}>
                  <Text style={styles.sectionTitle}>Push Token</Text>
                </View>
              </Col>
              <Col size={2}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => onPressRegisterPush()}
                >
                  <Text style={styles.buttonText}>
                    {pushToken ? 'Unregister' : 'Register'}
                  </Text>
                </TouchableOpacity>
              </Col>
            </Row>
            <Row>
              <Col size={4}>
                <View style={styles.sectionArea}>
                  <Text>{pushToken}</Text>
                </View>
              </Col>
              <Col size={2}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => copyPushTokenToClipboard()}
                >
                  <Text style={styles.buttonText}>Copy</Text>
                </TouchableOpacity>
              </Col>
            </Row>
            <Row>
              <Col size={4}>
                <View style={styles.sectionArea}>
                  <TextInput
                    style={styles.input}
                    onChangeText={setExternalPersonId}
                    value={externalPersonId}
                    placeholder="External Person Id"
                  />
                </View>
              </Col>
              <Col size={2}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => onPressAssociatePerson()}
                >
                  <Text style={styles.buttonText}>Associate Person</Text>
                </TouchableOpacity>
              </Col>
            </Row>
            <Row>
              <Col size={2}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => onPressUpdateDevice()}
                >
                  <Text style={styles.buttonText}>Update Device</Text>
                </TouchableOpacity>
              </Col>
            </Row>
            <Row>
              <Col size={2}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => onPressGetPersonInfo()}
                >
                  <Text style={styles.buttonText}>Get Person Info</Text>
                </TouchableOpacity>
              </Col>
            </Row>
            <Row>
              <Col size={4}>
                <View style={styles.sectionArea}>
                  <Text style={styles.sectionTitle}>External Person ID</Text>
                </View>
              </Col>
            </Row>
            <Row>
              <Col size={4}>
                <View style={styles.sectionArea}>
                  <Text>{externalPersonId}</Text>
                </View>
              </Col>
              <Col size={2}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => copyExternalPersonIdToClipboard()}
                >
                  <Text style={styles.buttonText}>Copy</Text>
                </TouchableOpacity>
              </Col>
            </Row>
            <Row>
              <Col size={4}>
                <View style={styles.sectionArea}>
                  <Text style={styles.sectionTitle}>Person Key</Text>
                </View>
              </Col>
            </Row>
            <Row>
              <Col size={4}>
                <View style={styles.sectionArea}>
                  <Text>{personKey}</Text>
                </View>
              </Col>
              <Col size={2}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => copyPersonkeyToClipboard()}
                >
                  <Text style={styles.buttonText}>Copy</Text>
                </TouchableOpacity>
              </Col>
            </Row>
          </Grid>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  body: {
    backgroundColor: Colors.white,
  },
  headerArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    margin: 20,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hr: {
    borderBottomColor: '#999999',
    borderBottomWidth: 1,
  },
  buildHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    padding: 10,
  },
  buildBody: {
    fontSize: 18,
    padding: 10,
    color: '#999999',
  },
  sectionArea: {
    display: 'flex',
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleArea: {
    width: '80%',
    alignItems: 'center',
  },
  buttonArea: {
    width: '20%',
  },
  sectionTitle: {
    paddingTop: 5,
    fontSize: 20,
    fontWeight: '500',
  },
  sectionText: {
    fontSize: 11,
  },
  button: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    borderColor: '#fff',
    backgroundColor: '#007AFF',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default Home;
