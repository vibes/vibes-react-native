import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Vibes, { InboxMessage } from 'vibes-react-native';
import { useTheme } from 'styled-components/native';
import type { AppTheme } from '../../theme/brand';
import {
  formatInboxSentDate,
  formatInboxValue,
  getFirstImageUrl,
} from '../../utils/inboxMessage';
import {
  InboxBody,
  InboxDateText,
  InboxListItem,
  InboxRoot,
  InboxRow,
  InboxScroll,
  InboxSubject,
  ListContainer,
  MessageTextColumn,
  RowSeparator,
  ThumbImage,
} from './AppInbox.styled';
import type { AppInboxTabScreenProps } from '../../navigation/routes';

const AppInbox = ({
  navigation,
}: AppInboxTabScreenProps): React.ReactElement => {
  const theme = useTheme() as AppTheme;
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback( async () => {
    setRefreshing(true);
    await getInboxMessages();
    setRefreshing(false);
  }, []);

  const getInboxMessages = async () => {
    try {
      const result: InboxMessage[] = await Vibes.fetchInboxMessages();
      await Vibes.onInboxMessagesFetched();
      setInboxMessages(result);
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
        Alert.alert('Error: No Internet Connection.');
      }
    });
    getInboxMessages();
  }, []);

  return (
    <InboxRoot>
      <InboxScroll
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <ListContainer>
          {inboxMessages.map((item, index) => {
            
            const imageUrl = getFirstImageUrl(item.images);
            const sentLabel = formatInboxSentDate(item);
            return (
              <InboxListItem key={item.message_uid}>
                <InboxRow
                  onPress={() => {
                    const messageUid = item.message_uid;
                    if (messageUid == null) {
                      return;
                    }
                    navigation.navigate('AppInboxDetail', { messageUid });
                  }}
                  activeOpacity={0.85}
                >
                  <MessageTextColumn $hasImage={!!imageUrl}>
                    <InboxSubject numberOfLines={2}>
                      {formatInboxValue(item.subject)}
                    </InboxSubject>
                    {sentLabel ? <InboxDateText>{sentLabel}</InboxDateText> : null}
                    <InboxBody
                      $withSentDate={!!sentLabel}
                      numberOfLines={6}
                      selectable
                    >
                      {formatInboxValue(item.content)}
                    </InboxBody>
                  </MessageTextColumn>
                  {imageUrl ? (
                    <ThumbImage
                      source={{ uri: imageUrl }}
                      resizeMode="cover"
                      accessibilityLabel="Message image"
                    />
                  ) : null}
                </InboxRow>
                {index < inboxMessages.length - 1 ? <RowSeparator /> : null}
              </InboxListItem>
            );
          })}
        </ListContainer>
      </InboxScroll>
    </InboxRoot>
  );
};

export default AppInbox;
