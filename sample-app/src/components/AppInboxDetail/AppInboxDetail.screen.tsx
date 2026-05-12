import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, type ImageStyle } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Vibes, { InboxMessage } from 'vibes-react-native';
import { useTheme } from 'styled-components/native';
import type { AppTheme } from '../../theme/brand';
import {
  formatInboxDateField,
  formatInboxSentDate,
  formatInboxValue,
  getIconAndMainFromImages,
  messageToJsonString,
} from '../../utils/inboxMessage';
import {
  ActionButton,
  ActionButtonRow,
  ActionButtonText,
  BlockSectionLabel,
  BlockSpaced,
  ContentScroll,
  DetailRoot,
  JsonBody,
  JsonPanel,
  JsonTitle,
  KeyValueBlock,
  KvKey,
  KvVal,
  LoadingBlock,
  LoadingLabel,
  MessageErrorBox,
  MessageErrorText,
  MessageImageCaption,
  MessageImageElement,
  MessageImageFrame,
  MessageImageLoaderOverlay,
  MessageImageRoot,
  MessageImageSubtle,
  MessagePanel,
  MetaItem,
  MetaKey,
  MetaRow,
  MetaVal,
  ProseText,
  SubjectText,
} from './AppInboxDetail.styled';
import type { AppInboxDetailScreenProps } from '../../navigation/routes';

const AppInboxDetail = ({
  route,
}: AppInboxDetailScreenProps): React.ReactElement => {
  const theme = useTheme() as AppTheme;
  const { messageUid } = route.params;
  const [inboxMessage, setInboxMessage] = useState<InboxMessage | null>(null);
  const [inboxMessageRead, setInboxMessageRead] = useState(false);

  const getInboxMessage = async (message_uid: string) => {
    try {
      const result = (await Vibes.fetchInboxMessage(
        message_uid
      )) as InboxMessage;
      setInboxMessage(result);
      setInboxMessageRead(!!result.read);
      await Vibes.onInboxMessageOpen(result);
    } catch (error) {
      console.error(error);
    }
  };

  const onMarkInboxMessageAsRead = async () => {
    try {
      const result = (await Vibes.markInboxMessageAsRead(
        messageUid
      )) as InboxMessage;
      setInboxMessage(result);
      setInboxMessageRead(!!result.read);
    } catch (error) {
      console.error(error);
    }
  };

  const onExpireInboxMessage = async () => {
    try {
      const result = (await Vibes.expireInboxMessage(
        messageUid
      )) as InboxMessage;
      setInboxMessage(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        Alert.alert('Error: No Internet Connection.');
      }
    });
    getInboxMessage(messageUid);
  }, [messageUid]);

  const { icon, main: mainImageUrl } = getIconAndMainFromImages(
    inboxMessage?.images
  );
  const sent = inboxMessage ? formatInboxSentDate(inboxMessage) : '';
  const expires = formatInboxDateField(inboxMessage?.expires_at);

  return (
    <DetailRoot>
      <ContentScroll
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: 32,
          paddingHorizontal: 12,
        }}
      >
        {inboxMessage == null ? (
          <LoadingBlock>
            <ActivityIndicator size="small" color={theme.primary} />
            <LoadingLabel>Loading message…</LoadingLabel>
          </LoadingBlock>
        ) : (
          <>
            <MessagePanel>
              <SubjectText selectable>
                {formatInboxValue(inboxMessage.subject) || 'Message'}
              </SubjectText>

              <MetaRow>
                {sent ? (
                  <MetaItem>
                    <MetaKey>Sent</MetaKey>
                    <MetaVal>{sent}</MetaVal>
                  </MetaItem>
                ) : null}
                {expires ? (
                  <MetaItem>
                    <MetaKey>Expires</MetaKey>
                    <MetaVal>{expires}</MetaVal>
                  </MetaItem>
                ) : null}
                <MetaItem>
                  <MetaKey>Status</MetaKey>
                  <MetaVal>
                    {inboxMessageRead ? 'Read' : 'Unread'}
                  </MetaVal>
                </MetaItem>
              </MetaRow>

              {inboxMessage.collapse_key ? (
                <KeyValueBlock>
                  <KvKey>Collapse key</KvKey>
                  <KvVal selectable>
                    {formatInboxValue(inboxMessage.collapse_key)}
                  </KvVal>
                </KeyValueBlock>
              ) : null}

              {inboxMessage.content ? (
                <BlockSpaced>
                  <BlockSectionLabel>Content</BlockSectionLabel>
                  <ProseText selectable>
                    {formatInboxValue(inboxMessage.content)}
                  </ProseText>
                </BlockSpaced>
              ) : null}

              {inboxMessage.detail ? (
                <BlockSpaced>
                  <BlockSectionLabel>Detail</BlockSectionLabel>
                  <ProseText selectable>
                    {formatInboxValue(inboxMessage.detail)}
                  </ProseText>
                </BlockSpaced>
              ) : null}

              {icon || mainImageUrl ? (
                <BlockSpaced>
                  <BlockSectionLabel>Images</BlockSectionLabel>
                  {icon ? <MessageImageBlock uri={icon} caption="Icon" /> : null}
                  {mainImageUrl ? (
                    <MessageImageBlock uri={mainImageUrl} caption="Main" />
                  ) : null}
                </BlockSpaced>
              ) : null}
            </MessagePanel>

            <ActionButtonRow>
              {!inboxMessageRead ? (
                <ActionButton onPress={onMarkInboxMessageAsRead} activeOpacity={0.8}>
                  <ActionButtonText>Mark Read</ActionButtonText>
                </ActionButton>
              ) : null}
              <ActionButton onPress={onExpireInboxMessage} activeOpacity={0.8}>
                <ActionButtonText>Mark Expired</ActionButtonText>
              </ActionButton>
            </ActionButtonRow>

            <JsonPanel>
              <JsonTitle>Notification data</JsonTitle>
              <JsonBody selectable testID="notificationDataJson">
                {messageToJsonString(inboxMessage)}
              </JsonBody>
            </JsonPanel>
          </>
        )}
      </ContentScroll>
    </DetailRoot>
  );
};

function MessageImageBlock({ uri, caption }: { uri: string; caption: string }) {
  const theme = useTheme() as AppTheme;
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>(
    'loading'
  );
  const [aspect, setAspect] = useState<number | null>(null);

  const imageLayoutStyle: ImageStyle = (() => {
    if (aspect != null) {
      return { width: '100%', aspectRatio: aspect };
    }
    // Until dimensions are known, reserve space without cropping.
    return { width: '100%', minHeight: 200 };
  })();

  useEffect(() => {
    let cancelled = false;
    Image.getSize(
      uri,
      (w, h) => {
        if (!cancelled && w > 0 && h > 0) {
          setAspect((a) => (a == null ? w / h : a));
        }
      },
      () => {
        // onLoad can still set aspect from the decoded bitmap
      }
    );
    return () => {
      cancelled = true;
    };
  }, [uri]);

  return (
    <MessageImageRoot>
      <MessageImageCaption>{caption}</MessageImageCaption>
      <MessageImageFrame>
        {loadState === 'error' ? (
          <MessageErrorBox>
            <MessageErrorText>Image could not be loaded</MessageErrorText>
          </MessageErrorBox>
        ) : (
          <>
            {loadState === 'loading' && (
              <MessageImageLoaderOverlay pointerEvents="none">
                <ActivityIndicator size="small" color={theme.primary} />
                <MessageImageSubtle>Loading image…</MessageImageSubtle>
              </MessageImageLoaderOverlay>
            )}
            <MessageImageElement
              source={{ uri }}
              $faded={loadState !== 'loaded'}
              style={imageLayoutStyle}
              resizeMode="contain"
              onLoad={(e) => {
                setLoadState('loaded');
                const s = e.nativeEvent.source;
                if (s && typeof s.width === 'number' && typeof s.height === 'number' && s.width > 0 && s.height > 0) {
                  setAspect((a) => (a == null ? s.width / s.height : a));
                }
              }}
              onError={() => setLoadState('error')}
              accessibilityLabel={caption}
            />
          </>
        )}
      </MessageImageFrame>
    </MessageImageRoot>
  );
}

export default AppInboxDetail;
