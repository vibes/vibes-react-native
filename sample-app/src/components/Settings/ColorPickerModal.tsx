import Clipboard from '@react-native-clipboard/clipboard';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import ColorPicker, {
  HueSlider,
  Panel1,
  Preview,
  type ColorPickerRef,
} from 'reanimated-color-picker';
import { useTheme } from 'styled-components/native';
import { normalizeHex } from '../../theme/colorUtils';
import {
  FieldLabel,
  HexInput,
  HexRow,
  ModalActions,
  ModalBackdrop,
  ModalGhostButton,
  ModalGhostText,
  ModalHandleBar,
  ModalPrimaryButton,
  ModalPrimaryText,
  ModalSheet,
  ModalTitle,
  PasteHexButton,
  PasteHexText,
} from './Settings.styled';

type Props = {
  visible: boolean;
  title: string;
  initialHex: string;
  onRequestClose: () => void;
  onApply: (hex: string) => void;
};

function safeHex(h: string): string {
  return normalizeHex(h) ?? '#5169fd';
}

export function ColorPickerModal({
  visible,
  title,
  initialHex,
  onRequestClose,
  onApply,
}: Props): React.ReactElement {
  const theme = useTheme();
  const { height: windowH } = useWindowDimensions();
  const pickerRef = useRef<ColorPickerRef>(null);
  const [hexField, setHexField] = useState(() => safeHex(initialHex));

  useEffect(() => {
    if (!visible) {
      return;
    }
    const h = safeHex(initialHex);
    setHexField(h);
    requestAnimationFrame(() => {
      pickerRef.current?.setColor(h, 0);
    });
  }, [visible, initialHex]);

  const onHexChange = (text: string) => {
    setHexField(text);
    const n = normalizeHex(text);
    if (n) {
      pickerRef.current?.setColor(n, 0);
    }
  };

  const onPasteHex = async () => {
    const clip = await Clipboard.getString();
    const n = normalizeHex(clip.trim());
    if (n) {
      setHexField(n);
      pickerRef.current?.setColor(n, 0);
    }
  };

  const apply = () => {
    const n = normalizeHex(hexField);
    if (!n) {
      Alert.alert('Invalid color', 'Use a hex value like #5169fd (six digits).');
      return;
    }
    onApply(n);
    onRequestClose();
  };

  const maxSheet = Math.min(620, Math.round(windowH * 0.92));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
    >
      <ModalBackdrop>
        <Pressable style={{ flex: 1 }} onPress={onRequestClose} />
        <ModalSheet $maxHeight={maxSheet}>
          <GestureHandlerRootView style={{ width: '100%', flexGrow: 0 }}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <ModalHandleBar />
              <ModalTitle>{title}</ModalTitle>

              <View style={{ width: '100%', marginBottom: 12 }}>
                <ColorPicker
                  ref={pickerRef}
                  key={safeHex(initialHex)}
                  value={safeHex(initialHex)}
                  onChangeJS={({ hex }) => setHexField(hex)}
                  style={{ width: '100%' }}
                  boundedThumb
                  thumbSize={24}
                >
                  <Preview
                    style={{
                      height: 44,
                      borderRadius: 10,
                      marginBottom: 12,
                    }}
                  />
                  <Panel1 style={{ height: 200, borderRadius: 12 }} />
                  <HueSlider
                    style={{ marginTop: 16, borderRadius: 8 }}
                    sliderThickness={22}
                  />
                </ColorPicker>
              </View>

              <HexRow>
                <FieldLabel>Hex</FieldLabel>
                <HexInput
                  value={hexField}
                  onChangeText={onHexChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="#5169fd"
                  placeholderTextColor={theme.tabInactive}
                />
                <PasteHexButton onPress={onPasteHex} activeOpacity={0.85}>
                  <PasteHexText>Paste</PasteHexText>
                </PasteHexButton>
              </HexRow>

              <ModalActions>
                <ModalGhostButton
                  onPress={onRequestClose}
                  activeOpacity={0.85}
                >
                  <ModalGhostText>Cancel</ModalGhostText>
                </ModalGhostButton>
                <ModalPrimaryButton onPress={apply} activeOpacity={0.85}>
                  <ModalPrimaryText>Apply</ModalPrimaryText>
                </ModalPrimaryButton>
              </ModalActions>
            </ScrollView>
          </GestureHandlerRootView>
        </ModalSheet>
      </ModalBackdrop>
    </Modal>
  );
}
