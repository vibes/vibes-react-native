import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import type { AppTheme } from '../theme/brand';

export function getBaseNativeStackOptions(
  t: AppTheme
): NativeStackNavigationOptions {
  return {
    headerStyle: { backgroundColor: t.navBackground },
    headerShadowVisible: false,
    headerTintColor: t.primary,
    headerTitleStyle: {
      color: t.primary,
      fontWeight: '600',
      fontSize: 17,
    },
  };
}
