import {
  Image,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import { withAlpha } from '../../theme/colorUtils';

export const ScreenRoot = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

export const SettingsScroll = styled(ScrollView).attrs({
  contentInsetAdjustmentBehavior: 'automatic' as const,
  contentContainerStyle: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
})``;

export const Panel = styled.View`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.12)};
  padding: 16px;
  margin-bottom: 16px;
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 10px;
`;

export const Subtle = styled.Text`
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.body};
  margin-bottom: 12px;
`;

export const ColorRow = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => withAlpha(theme.primary, 0.08)};
`;

export const ColorRowLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

export const Swatch = styled.View<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background-color: ${({ $color }) => $color};
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.body, 0.28)};
`;

export const ColorLabel = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.body};
`;

export const ColorHex = styled.Text`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.tabInactive};
  font-variant: tabular-nums;
`;

export const LogoPreview = styled(Image).attrs({ resizeMode: 'contain' as const })`
  width: 160px;
  height: 42px;
  align-self: center;
  margin-bottom: 14px;
`;

export const RowButton = styled(TouchableOpacity)`
  min-height: 48px;
  justify-content: center;
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 10px;
  background-color: ${({ theme }) => theme.primary};
`;

export const RowButtonSecondary = styled(TouchableOpacity)`
  min-height: 48px;
  justify-content: center;
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 10px;
  background-color: ${({ theme }) => withAlpha(theme.primary, 0.15)};
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.35)};
`;

export const RowButtonDanger = styled(TouchableOpacity)`
  min-height: 48px;
  justify-content: center;
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 10px;
  background-color: ${({ theme }) => withAlpha(theme.body, 0.12)};
`;

export const RowButtonText = styled.Text`
  color: ${({ theme }) => theme.white};
  text-align: center;
  font-size: 15px;
  font-weight: 600;
`;

export const RowButtonTextSecondary = styled.Text`
  color: ${({ theme }) => theme.primary};
  text-align: center;
  font-size: 15px;
  font-weight: 600;
`;

export const RowButtonTextDanger = styled.Text`
  color: ${({ theme }) => theme.body};
  text-align: center;
  font-size: 15px;
  font-weight: 600;
`;

/* Modal */
export const ModalBackdrop = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.45);
  justify-content: flex-end;
`;

export const ModalSheet = styled.View<{ $maxHeight: number }>`
  background-color: ${({ theme }) => theme.surface};
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 16px 18px 24px;
  max-height: ${({ $maxHeight }) => $maxHeight}px;
`;

export const ModalHandleBar = styled.View`
  align-self: center;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background-color: ${({ theme }) => withAlpha(theme.body, 0.2)};
  margin-bottom: 12px;
`;

export const ModalTitle = styled.Text`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 14px;
  text-align: center;
`;

export const PreviewSwatch = styled.View`
  align-self: center;
  width: 100%;
  height: 56px;
  border-radius: 12px;
  margin-bottom: 16px;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.1);
`;

export const HexRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
`;

export const FieldLabel = styled.Text`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.body};
  width: 36px;
`;

export const HexInput = styled(TextInput)`
  flex: 1;
  height: 44px;
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.25)};
  border-radius: 10px;
  padding: 0 12px;
  font-size: 15px;
  color: ${({ theme }) => theme.body};
  background-color: ${({ theme }) => withAlpha(theme.background, 0.9)};
`;

export const PasteHexButton = styled(TouchableOpacity)`
  padding: 0 14px;
  height: 44px;
  justify-content: center;
  border-radius: 10px;
  background-color: ${({ theme }) => withAlpha(theme.primary, 0.12)};
`;

export const PasteHexText = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
`;

export const ModalActions = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-top: 18px;
`;

export const ModalGhostButton = styled(TouchableOpacity)`
  flex: 1;
  min-height: 48px;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => withAlpha(theme.primary, 0.35)};
`;

export const ModalGhostText = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
`;

export const ModalPrimaryButton = styled(TouchableOpacity)`
  flex: 1;
  min-height: 48px;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.primary};
`;

export const ModalPrimaryText = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.white};
`;
