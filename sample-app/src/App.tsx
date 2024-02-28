import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AppInbox from './components/AppInbox/AppInbox';
import AppInboxDetail from './components/AppInboxDetail/AppInboxDetail';
import Main from './components/Main/Main';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={Main}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="AppInbox" component={AppInbox} />
        <Stack.Screen name="AppInboxDetail" component={AppInboxDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
