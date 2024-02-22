import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Vibes from 'vibes-react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Grid, Row, Col } from 'react-native-easy-grid';

const wait = (timeout: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const AppInbox = ({ route, navigation }): React.ReactElement => {
  const [inboxMessages, setInboxMessages] = useState([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);

  const getInboxMessages = async () => {
    try {
      const result = await Vibes.fetchInboxMessages();
      await Vibes.onInboxMessagesFetched();
      setInboxMessages(result);
    } catch (error) {
      console.error(error);
    }
  };

  const onMarkInboxMessageAsRead = async (inboxMessage: any, messageUid: string) => {
    try {
      await Vibes.markInboxMessageAsRead(messageUid);
      let map = {
        message: JSON.stringify(inboxMessage),
      };
      await Vibes.onInboxMessageOpen(map);
      getInboxMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const onExpireInboxMessage = async (messageUid: string) => {
    try {
      await Vibes.expireInboxMessage(messageUid);
      getInboxMessages();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getInboxMessages();
  }, []);

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        // eslint-disable-next-line no-alert
        alert('Error: No Internet Connection.');
      }
    });
    getInboxMessages();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          {inboxMessages.map((item) => (
            <TouchableOpacity
              style={styles.body}
              key={item.message_uid}
              onPress={() =>
                navigation.navigate('AppInboxDetail', {
                  messageUid: item.message_uid,
                })
              }
            >
              <Text>
                <Text style={styles.sectionText}>
                  subject: {item.subject}}
                </Text>
                <Text style={styles.sectionText}>
                  message_uid: {item.message_uid}
                </Text>
                <Text style={styles.sectionText}>
                  content: {item.content}
                </Text>
                <Text style={styles.sectionText}>
                  detail: {item.detail}
                </Text>
                <Text style={styles.sectionText}>
                  collapse_key: {JSON.stringify(item.collapse_key)}
                </Text>
                <Text style={styles.sectionText}>
                  read: {item.read}
                </Text>
                <Text style={styles.sectionText}>
                  expires_at: {item.expires_at}
                </Text>
                <Text style={styles.sectionText}>
                  created_at: {item.created_at}
                </Text>
                <Text style={styles.sectionText}>
                  images: {JSON.stringify(item.images)}
                </Text>
                <Text style={styles.sectionText}>
                  inbox_custom_data: {JSON.stringify(item.inbox_custom_data)}
                </Text>
                <Text style={styles.sectionText}>
                  apprefdata: {JSON.stringify(item.apprefdata)}
                </Text>
              </Text>
              <View style={styles.hline} />
              <Grid>
                <Row>
                  {!item.read && (
                    <Col size={4} style={styles.col}>
                      <View>
                        <TouchableOpacity
                          style={styles.button}
                          onPress={() =>
                            onMarkInboxMessageAsRead(item, item.message_uid)
                          }
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
                        onPress={() =>
                          onExpireInboxMessage(item.message_uid)
                        }
                      >
                        <Text style={styles.buttonText}>Mark Expired</Text>
                      </TouchableOpacity>
                    </View>
                  </Col>
                </Row>
              </Grid>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.lighter,
  },
  body: {
    backgroundColor: Colors.white,
    margin: 10,
    padding: 10,
  },
  col: {
    margin: 1,
  },
  sectionArea: {
    display: 'flex',
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    paddingTop: 5,
    fontSize: 20,
    fontWeight: '500',
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

export default AppInbox;
