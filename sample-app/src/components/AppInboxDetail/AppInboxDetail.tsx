import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Vibes from 'vibes-react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Grid, Row, Col } from 'react-native-easy-grid';

const AppInboxDetail = ({ route, navigation }): React.ReactElement => {
  const { messageUid } = route.params;
  const [inboxMessage, setInboxMessage] = useState();
  const [inboxMessageRead, setInboxMessageRead] = useState(Boolean);

  const getInboxMessage = async (message_uid: string) => {
    try {
      const result = await Vibes.fetchInboxMessage(message_uid);
      setInboxMessage(result);
      setInboxMessageRead(result.read);
      await Vibes.onInboxMessageOpen(result);
    } catch (error) {
      console.error(error);
    }
  };

  const onMarkInboxMessageAsRead = async () => {
    try {
      const result = await Vibes.markInboxMessageAsRead(messageUid);
      setInboxMessage(result);
      setInboxMessageRead(result.read);
    } catch (error) {
      console.error(error);
    }
  };

  const onExpireInboxMessage = async () => {
    try {
      const result = await Vibes.expireInboxMessage(messageUid);
      setInboxMessage(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        // eslint-disable-next-line no-alert
        alert('Error: No Internet Connection.');
      }
    });
    getInboxMessage(messageUid);
  }, []);

  return (
    <>
      <View style={styles.body}>
        <Text style={styles.sectionText}>{JSON.stringify(inboxMessage)}</Text>
        <View style={styles.hline} />
      </View>
      <Grid style={styles.container}>
        <Row>
          {!inboxMessageRead && (
            <Col size={4} style={styles.col}>
              <View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => onMarkInboxMessageAsRead()}
                >
                  <Text style={styles.buttonText}>Mark Read</Text>
                </TouchableOpacity>
              </View>
            </Col>
          )}
          <Col size={4} style={styles.col}>
            <View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => onExpireInboxMessage()}
              >
                <Text style={styles.buttonText}>Mark Expired</Text>
              </TouchableOpacity>
            </View>
          </Col>
        </Row>
      </Grid>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
  body: {
    backgroundColor: Colors.white,
    margin: 10,
    padding: 10,
  },
  col: {
    margin: 1,
  },
  sectionText: {
    fontSize: 11,
  },
  hline: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 10,
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
});

export default AppInboxDetail;
