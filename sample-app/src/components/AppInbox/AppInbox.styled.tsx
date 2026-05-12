import { Image, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { withAlpha } from '../../theme/colorUtils';

export const InboxRoot = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

export const InboxScroll = styled(ScrollView).attrs({
  contentInsetAdjustmentBehavior: 'automatic' as const,
  contentContainerStyle: {
    paddingBottom: 28,
    paddingTop: 8,
  },
})``;

export const ListContainer = styled.View`
  padding: 0 12px;
`;

export const InboxListItem = styled.View``;

export const InboxRow = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: flex-start;
  background-color: ${({ theme }) => theme.surface};
  margin: 8px 4px;
  padding: 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.12)};
`;

export const MessageTextColumn = styled.View<{ $hasImage?: boolean }>`
  flex: 1;
  min-width: 0;
  padding: 2px 0;
  margin-right: ${({ $hasImage }) => ($hasImage ? 12 : 0)}px;
  flex-direction: column;
`;

export const InboxSubject = styled.Text`
  font-size: 18px;
  font-weight: 700;
  line-height: 24px;
  color: ${({ theme }) => theme.primary};
`;

export const InboxDateText = styled.Text`
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.body};
  margin-top: 4px;
`;

export const InboxBody = styled.Text<{ $withSentDate?: boolean }>`
  font-size: 15px;
  line-height: 22px;
  color: ${({ theme }) => theme.body};
  margin-top: ${({ $withSentDate }) => ($withSentDate ? 6 : 8)}px;
`;

export const ThumbImage = styled(Image)`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  background-color: ${({ theme }) => withAlpha(theme.primary, 0.08)};
`;

export const RowSeparator = styled.View`
  height: 1px;
  background-color: rgba(60, 60, 60, 0.55);
  margin: 4px 8px;
`;
