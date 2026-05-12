import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useBranding } from '../../branding/BrandingContext';
import type { AppTheme } from '../../theme/brand';
import { ColorPickerModal } from './ColorPickerModal';
import {
  ColorHex,
  ColorLabel,
  ColorRow,
  ColorRowLeft,
  LogoPreview,
  Panel,
  RowButton,
  RowButtonDanger,
  RowButtonSecondary,
  RowButtonText,
  RowButtonTextDanger,
  RowButtonTextSecondary,
  ScreenRoot,
  SectionTitle,
  SettingsScroll,
  Subtle,
  Swatch,
} from './Settings.styled';

const COLOR_ROWS: { key: keyof AppTheme; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'navBackground', label: 'Navigation background' },
  { key: 'background', label: 'Screen background' },
  { key: 'surface', label: 'Cards / surfaces' },
  { key: 'body', label: 'Body text' },
  { key: 'tabActive', label: 'Tab (active)' },
  { key: 'tabInactive', label: 'Tab (inactive)' },
  { key: 'white', label: 'On-primary text' },
];

const Settings = (): React.ReactElement => {
  const {
    theme,
    headerLogoSource,
    headerLogoKey,
    setBrandColor,
    resetBrandColors,
    pickLogoFromPhotos,
    pickLogoFromFiles,
    clearCustomLogo,
  } = useBranding();

  const [pickerKey, setPickerKey] = useState<keyof AppTheme | null>(null);
  const activeRow = pickerKey
    ? COLOR_ROWS.find((r) => r.key === pickerKey)
    : null;

  const onResetColors = () => {
    Alert.alert(
      'Reset colors?',
      'All brand colors will return to the default Vibes palette.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetBrandColors },
      ]
    );
  };

  return (
    <ScreenRoot>
      <SettingsScroll>
        <Panel>
          <SectionTitle>Header logo</SectionTitle>
          <Subtle>
            Choose an image from Photos or Files. It is saved on this device
            only. Remove it anytime to restore the default Vibes logo.
          </Subtle>
          <LogoPreview key={headerLogoKey} source={headerLogoSource} />
          <RowButton onPress={pickLogoFromPhotos} activeOpacity={0.88}>
            <RowButtonText>Choose from Photos</RowButtonText>
          </RowButton>
          <RowButtonSecondary
            onPress={pickLogoFromFiles}
            activeOpacity={0.88}
          >
            <RowButtonTextSecondary>Choose from Files</RowButtonTextSecondary>
          </RowButtonSecondary>
          <RowButtonDanger
            onPress={() => void clearCustomLogo()}
            activeOpacity={0.88}
          >
            <RowButtonTextDanger>Remove custom logo</RowButtonTextDanger>
          </RowButtonDanger>
        </Panel>

        <Panel>
          <SectionTitle>Brand colors</SectionTitle>
          <Subtle>
            Tap a color to open the picker. Drag on the panel and hue bar,
            edit or paste a hex code, then tap Apply.
          </Subtle>
          {COLOR_ROWS.map((row) => (
            <ColorRow
              key={row.key}
              onPress={() => setPickerKey(row.key)}
              activeOpacity={0.75}
            >
              <ColorRowLeft>
                <Swatch $color={theme[row.key]} />
                <ColorLabel>{row.label}</ColorLabel>
              </ColorRowLeft>
              <ColorHex>{theme[row.key]}</ColorHex>
            </ColorRow>
          ))}
          <RowButtonDanger
            onPress={onResetColors}
            activeOpacity={0.88}
            style={{ marginTop: 12, marginBottom: 0 }}
          >
            <RowButtonTextDanger>Reset all colors to default</RowButtonTextDanger>
          </RowButtonDanger>
        </Panel>
      </SettingsScroll>

      <ColorPickerModal
        visible={pickerKey != null}
        title={activeRow ? `Edit ${activeRow.label}` : 'Color'}
        initialHex={pickerKey ? theme[pickerKey] : '#000000'}
        onRequestClose={() => setPickerKey(null)}
        onApply={(hex) => {
          if (pickerKey) {
            setBrandColor(pickerKey, hex);
          }
        }}
      />
    </ScreenRoot>
  );
};

export default Settings;
