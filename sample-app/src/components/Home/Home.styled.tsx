import { ScrollView, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import styled from 'styled-components/native';
import { withAlpha } from '../../theme/colorUtils';

export const ScreenRoot = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

export const HomeScroll = styled(ScrollView).attrs({
  contentInsetAdjustmentBehavior: 'automatic' as const,
  contentContainerStyle: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
})`
  background-color: ${({ theme }) => theme.background};
`;

export const BuildPanel = styled.View`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.12)};
  padding: 16px;
  margin-bottom: 16px;
`;

export const BuildKicker = styled.Text`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 6px;
`;

export const BuildVersion = styled.Text`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.body};
`;

export const Panel = styled.View`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.12)};
  padding: 16px;
  margin-bottom: 12px;
`;

export const LastPanel = styled.View`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.12)};
  padding: 16px;
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 6px;
`;

export const FieldLabel = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.body};
  margin-bottom: 6px;
`;

export const ValuePill = styled.Text`
  font-size: 13px;
  line-height: 20px;
  color: ${({ theme }) => theme.body};
  background-color: ${({ theme }) => withAlpha(theme.primary, 0.06)};
  border-radius: 8px;
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.1)};
  padding: 10px 12px;
  margin-bottom: 12px;
  min-height: 44px;
`;

export const PersonIdInput = styled(TextInput)`
  height: 48px;
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.25)};
  border-radius: 10px;
  padding: 0 12px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.body};
  background-color: rgba(255, 255, 255, 0.7);
`;

export const ButtonRow = styled.View`
  flex-direction: row;
  align-items: stretch;
  gap: 10px;
`;

export const HalfButton = styled(TouchableOpacity)<{ $inactive?: boolean }>`
  flex: 1;
  min-height: 48px;
  justify-content: center;
  padding: 12px 8px;
  border-radius: 12px;
  background-color: ${({ $inactive, theme }) =>
    $inactive ? withAlpha(theme.primary, 0.35) : theme.primary};
`;

export const BlockButton = styled(TouchableOpacity)<{ $inactive?: boolean }>`
  min-height: 48px;
  justify-content: center;
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 10px;
  background-color: ${({ $inactive, theme }) =>
    $inactive ? withAlpha(theme.primary, 0.35) : theme.primary};
`;

export const PrimaryButtonText = styled.Text<{ $inactive?: boolean }>`
  color: ${({ $inactive, theme }) =>
    $inactive ? withAlpha(theme.white, 0.6) : theme.white};
  text-align: center;
  font-size: 15px;
  font-weight: 600;
`;

export const BlockButtonText = styled.Text<{ $inactive?: boolean }>`
  color: ${({ $inactive, theme }) =>
    $inactive ? withAlpha(theme.white, 0.6) : theme.white};
  text-align: center;
  font-size: 15px;
  font-weight: 600;
`;
