import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

export default function Main() {
  return (
    <NavigationContainer>{/* Rest of your app code */}</NavigationContainer>
  );
}

AppRegistry.registerComponent(appName, () => App);
