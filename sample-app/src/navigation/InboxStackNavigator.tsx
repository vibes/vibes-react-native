import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useTheme } from 'styled-components/native';
import AppInbox from '../components/AppInbox';
import AppInboxDetail from '../components/AppInboxDetail';
import type { AppTheme } from '../theme/brand';
import { HeaderTitleLogo } from './headerContent';
import { getBaseNativeStackOptions } from './nativeStackOptions';
import type { InboxStackParamList } from './routes';

const Stack = createNativeStackNavigator<InboxStackParamList>();

const InboxStackNavigator = () => {
  const theme = useTheme() as AppTheme;
  return (
    <Stack.Navigator screenOptions={getBaseNativeStackOptions(theme)}>
      <Stack.Screen
        name="Inbox"
        component={AppInbox}
        options={{
          title: 'Inbox',
          headerTitle: HeaderTitleLogo,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="AppInboxDetail"
        component={AppInboxDetail}
        options={{ title: 'Message' }}
      />
    </Stack.Navigator>
  );
};

export default InboxStackNavigator;
