import type { NavigatorScreenParams } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type HomeStackParamList = {
  Home: undefined;
};

export type InboxStackParamList = {
  Inbox: undefined;
  AppInboxDetail: { messageUid: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList> | undefined;
  InboxTab: NavigatorScreenParams<InboxStackParamList> | undefined;
  SettingsTab: NavigatorScreenParams<SettingsStackParamList> | undefined;
};

export type HomeTabScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>
>;

export type AppInboxTabScreenProps = CompositeScreenProps<
  NativeStackScreenProps<InboxStackParamList, 'Inbox'>,
  BottomTabScreenProps<MainTabParamList, 'InboxTab'>
>;

export type AppInboxDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<InboxStackParamList, 'AppInboxDetail'>,
  BottomTabScreenProps<MainTabParamList, 'InboxTab'>
>;

export type SettingsTabScreenProps = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, 'Settings'>,
  BottomTabScreenProps<MainTabParamList, 'SettingsTab'>
>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends MainTabParamList {}
  }
}

export {};
