import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from 'styled-components/native';
import Home from '../components/Home';
import type { AppTheme } from '../theme/brand';
import { HeaderTitleLogo } from './headerContent';
import { getBaseNativeStackOptions } from './nativeStackOptions';
import type { HomeStackParamList } from './routes';

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => {
  const theme = useTheme() as AppTheme;
  return (
    <Stack.Navigator screenOptions={getBaseNativeStackOptions(theme)}>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Home',
          headerTitle: HeaderTitleLogo,
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
