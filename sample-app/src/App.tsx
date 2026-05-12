import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BrandingProvider, useBranding } from './branding/BrandingContext';
import MainNavigator from './navigation/MainNavigator';

const AppInner = () => {
  const { navigationTheme } = useBranding();
  return (
    <NavigationContainer theme={navigationTheme}>
      <MainNavigator />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BrandingProvider>
        <AppInner />
      </BrandingProvider>
    </GestureHandlerRootView>
  );
};

export default App;
