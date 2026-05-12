import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { useBranding } from '../branding/BrandingContext';
import { HeaderMark } from './headerMark.styled';

export function HeaderTitleLogo(): React.ReactElement {
  const { headerLogoSource, headerLogoKey, clearCustomLogo } = useBranding();

  const onError = useCallback(() => {
    void (async () => {
      await clearCustomLogo();
      Alert.alert(
        'Logo removed',
        'The custom header image could not be loaded and was cleared.'
      );
    })();
  }, [clearCustomLogo]);

  return (
    <HeaderMark
      key={headerLogoKey}
      accessibilityLabel="App logo"
      source={headerLogoSource}
      onError={onError}
    />
  );
}
