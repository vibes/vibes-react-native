import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from 'styled-components/native';
import { Settings } from '../components/Settings';
import type { AppTheme } from '../theme/brand';
import { HeaderTitleLogo } from './headerContent';
import { getBaseNativeStackOptions } from './nativeStackOptions';
import type { SettingsStackParamList } from './routes';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStackNavigator = () => {
  const theme = useTheme() as AppTheme;
  return (
    <Stack.Navigator screenOptions={getBaseNativeStackOptions(theme)}>
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          title: 'Settings',
          headerTitle: HeaderTitleLogo,
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
};

export default SettingsStackNavigator;
