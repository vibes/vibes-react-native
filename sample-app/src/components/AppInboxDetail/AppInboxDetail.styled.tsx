import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import { withAlpha } from '../../theme/colorUtils';

const monoFont = Platform.select({ ios: 'Menlo', default: 'monospace' }) ?? 'monospace';

export const DetailRoot = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

export const ContentScroll = styled(ScrollView)``;

export const LoadingBlock = styled.View`
  padding: 32px;
  align-items: center;
`;

export const LoadingLabel = styled.Text`
  margin-top: 12px;
  font-size: 15px;
  color: ${({ theme }) => theme.body};
`;

export const MessagePanel = styled.View`
  background-color: ${({ theme }) => theme.surface};
  margin-top: 8px;
  padding: 16px;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.12)};
`;

export const SubjectText = styled.Text`
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  color: ${({ theme }) => theme.primary};
`;

export const MetaRow = styled.View`
  margin-top: 12px;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

export const MetaItem = styled.View`
  min-width: 30%;
`;

export const MetaKey = styled.Text`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.body};
  opacity: 0.8;
`;

export const MetaVal = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.body};
  margin-top: 2px;
`;

export const KeyValueBlock = styled.View`
  margin-top: 14px;
  padding-top: 12px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => withAlpha(theme.primary, 0.15)};
`;

export const KvKey = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
`;

export const KvVal = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.body};
  margin-top: 4px;
`;

export const BlockSpaced = styled.View`
  margin-top: 16px;
`;

export const BlockSectionLabel = styled.Text`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 8px;
`;

export const ProseText = styled.Text`
  font-size: 16px;
  line-height: 24px;
  color: ${({ theme }) => theme.body};
`;

export const ActionButtonRow = styled.View`
  flex: 1;
  margin-top: 8px;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 8px;
`;

export const ActionButton = styled(TouchableOpacity)`
  flex: 1;
  padding: 12px 8px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.primary};
  margin: 8px 0;
  min-height: 48px;
  justify-content: center;
  align-items: center;
`;

export const ActionButtonText = styled.Text`
  color: ${({ theme }) => theme.white};
  text-align: center;
  font-size: 15px;
  font-weight: 600;
`;

export const JsonPanel = styled(MessagePanel)`
  margin-top: 8px;
`;

export const JsonTitle = styled.Text`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 10px;
`;

export const JsonBody = styled.Text`
  font-family: ${monoFont};
  font-size: 12px;
  line-height: 18px;
  color: ${({ theme }) => theme.body};
`;

export const MessageImageRoot = styled.View`
  margin-bottom: 12px;
`;

export const MessageImageCaption = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 6px;
`;

export const MessageImageFrame = styled.View`
  border-radius: 12px;
  background-color: ${({ theme }) => withAlpha(theme.primary, 0.06)};
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.2)};
  overflow: hidden;
`;

export const MessageImageLoaderOverlay = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.65);
`;

export const MessageImageSubtle = styled.Text`
  margin-top: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.body};
`;

export const MessageImageElement = styled(Image)<{ $faded?: boolean }>`
  width: 100%;
  opacity: ${({ $faded }) => ($faded ? 0.02 : 1)};
`;

export const MessageErrorBox = styled.View`
  min-height: 200px;
  justify-content: center;
  padding: 16px;
`;

export const MessageErrorText = styled.Text`
  text-align: center;
  color: ${({ theme }) => theme.body};
  font-size: 14px;
`;
