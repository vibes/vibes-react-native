const { NativeModules } = require('react-native');
const {
  mockVibesNativeModule,
} = require('./src/__tests__/mocks/vibesNativeModule');

NativeModules.Vibes = mockVibesNativeModule;
