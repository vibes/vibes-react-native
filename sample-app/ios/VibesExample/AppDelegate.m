/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTPushNotificationManager.h>
#import <VibesExample-Swift.h>

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>
static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  #ifdef FB_SONARKIT_ENABLED
    InitializeFlipper(application);
  #endif
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"VibesExample"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  [[UNUserNotificationCenter currentNotificationCenter] setDelegate: self];
  [[NSNotificationCenter defaultCenter] addObserver:self
         selector:@selector(didRegisterVibesDevice:)
         name: @"vibesDeviceRegistered"
         object:nil];
  
  if ([launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey]) {
    // When the app launch after user tap on notification (originally was not running / not in background)
    NSDictionary * payload = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
    NSLog(@"UIApplicationLaunchOptionsRemoteNotificationKey %@", @{@"payload": payload});
    [PushEventEmitter sendPushOpenedEvent: @{@"payload": payload}];
  }

  return YES;

}

-(void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  NSLog(@"Receive remote push notif");
  
  Vibes const *vibes = [Vibes shared];
  [vibes receivedPushWith:userInfo at:[NSDate new]];
  NSDictionary *payload = @{@"payload": userInfo};
  [PushEventEmitter sendPushReceivedEvent: payload];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
    NSLog(@"didReceiveRemoteNotification:fetchCompletionHandler %@", userInfo);
  
    if(application.applicationState == UIApplicationStateInactive) {

            NSLog(@"Inactive");

            //Show the view with the content of the push

            completionHandler(UIBackgroundFetchResultNewData);

        } else if (application.applicationState == UIApplicationStateBackground) {

            NSLog(@"Background");

            NSString *info = [[userInfo valueForKey:@"aps"]valueForKey:@"alert"];

            completionHandler(UIBackgroundFetchResultNewData);

        } else {

            NSLog(@"Active");

            //Show an in-app banner

            completionHandler(UIBackgroundFetchResultNewData);

        }
    
    Vibes const *vibes = [Vibes shared];
  [vibes receivedPushWith:userInfo at:[NSDate new]];
  
}

-(void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
  NSDictionary *userInfo = [[[[response notification] request] content] userInfo];
  NSDictionary *payload = @{@"payload": userInfo};
  Vibes const *vibes = [Vibes shared];
  [vibes receivedPushWith:userInfo at:[NSDate new]];
  [PushEventEmitter sendPushOpenedEvent: payload];
  
}

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings: (UIUserNotificationSettings *)notificationSettings
{
  
  NSLog(@"------------------>>>>didRegisterUserNotificationSettings %@", notificationSettings);
  [RCTPushNotificationManager didRegisterUserNotificationSettings: notificationSettings];
}

// Called when a notification is delivered to a foreground app.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center
      willPresentNotification:(UNNotification *)notification
        withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  
  NSDictionary *userInfo = [[[notification request] content] userInfo];
  NSDictionary *payload = @{@"payload": userInfo};
  [PushEventEmitter sendPushReceivedEvent: payload];

  // allow showing foreground notifications
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
  // or if you wish to hide all notification while in foreground replace it with
  // completionHandler(UNNotificationPresentationOptionNone);
}

// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken: (NSData *)deviceToken
{
  NSString * tokenString = [self stringWithDeviceToken: deviceToken];
  NSLog(@"------------------>>>>Push Token String: %@", tokenString);
  [[NSUserDefaults standardUserDefaults] setObject:tokenString forKey:@"VIBES_PUSH_TOKEN"];
  [[NSUserDefaults standardUserDefaults] synchronize];
  Vibes const *vibes = [Vibes shared];
  [vibes setPushTokenFromData: deviceToken];
  [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken: deviceToken];
}

- (NSString *)stringWithDeviceToken:(NSData*) deviceToken {
  const char *data = [deviceToken bytes];
  NSMutableString *token = [NSMutableString string];
  
  for (NSUInteger i = 0; i < [deviceToken length]; i++) {
    [token appendFormat:@"%02.2hhX", data[i]];
  }
  
  return [token copy];
}

- (void)requestAuthorizationForNotifications {
#if __IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_10_0

  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:(UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationTypeBadge) categories:nil]];
    [[UIApplication sharedApplication] registerForRemoteNotifications];
  });
#else
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge) completionHandler:^(BOOL granted, NSError * _Nullable error) {
    if (error) {
      NSLog(@"ERROR registering for push: %@ - %@", error.localizedFailureReason, error.localizedDescription );
    } else if (granted) {
       NSLog(@"authorization granted for push");
      dispatch_async(dispatch_get_main_queue(), ^{
        [[UIApplication sharedApplication] registerForRemoteNotifications];
      });
    } else {
      NSLog(@"authorization denied for push");
    }
  }];
#endif
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (void)didRegisterVibesDevice:(NSNotification *)notification
{
  NSString * token = [[NSUserDefaults standardUserDefaults] stringForKey:@"VIBES_PUSH_TOKEN"];
  if (token != nil) {
    NSData* deviceToken = [token dataUsingEncoding:NSUTF8StringEncoding];
    Vibes const *vibes = [Vibes shared];
    [vibes setPushTokenFromData: deviceToken];
  }
  NSLog(@"didRegisterVibesDevice Device ID=%@", notification.object);
  if ([[Vibes shared] isDeviceRegistered]) {
    [self requestAuthorizationForNotifications];
  }
}

- (void) dealloc
{
    // If you don't remove yourself as an observer, the Notification Center
    // will continue to try and send notification objects to the deallocated
    // object.
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end
