#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTPushNotificationManager.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import <VibesExample-Swift.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"VibesExample";
  self.dependencyProvider = [RCTAppDependencyProvider new];
  self.initialProps = @{};

  // Values come from Info.plist (VibesApiURL / VibesAppId); see .env.example
  NSString *apiUrl = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"VibesApiURL"];
  NSString *appId = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"VibesAppId"];
  VibesConfiguration *vibesConfig = [[VibesConfiguration alloc] initWithAdvertisingId:NULL
                                                                                apiUrl:apiUrl
                                                                       trackingApiUrl:apiUrl
                                                                                logger:NULL
                                                                           storageType:VibesStorageEnumUSERDEFAULTS
                                                                     trackedEventTypes:[@[] mutableCopy]];
  [Vibes configureWithAppId:appId
              configuration:vibesConfig];

  [[UNUserNotificationCenter currentNotificationCenter] setDelegate: self];
  [[NSNotificationCenter defaultCenter] addObserver:self
         selector:@selector(didRegisterVibesDevice:)
         name: @"vibesDeviceRegistered"
         object:nil];

  BOOL result = [super application:application didFinishLaunchingWithOptions:launchOptions];

  if ([launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey]) {
    NSDictionary * payload = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
    NSLog(@"UIApplicationLaunchOptionsRemoteNotificationKey %@", @{@"payload": payload});
    [PushEventEmitter setInitialNotification: @{@"payload": payload}];
  }

  return result;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

#pragma mark - Push Notifications

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
            completionHandler(UIBackgroundFetchResultNewData);
        } else if (application.applicationState == UIApplicationStateBackground) {
            NSLog(@"Background");
            completionHandler(UIBackgroundFetchResultNewData);
        } else {
            NSLog(@"Active");
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
  completionHandler();
}

-(void)userNotificationCenter:(UNUserNotificationCenter *)center
      willPresentNotification:(UNNotification *)notification
        withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  NSDictionary *userInfo = [[[notification request] content] userInfo];
  NSDictionary *payload = @{@"payload": userInfo};
  [PushEventEmitter sendPushReceivedEvent: payload];

  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

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

- (void)didRegisterVibesDevice:(NSNotification *)notification
{
  NSString * token = [[NSUserDefaults standardUserDefaults] stringForKey:@"VIBES_PUSH_TOKEN"];
  if (token != nil) {
    NSData* deviceToken = [token dataUsingEncoding:NSUTF8StringEncoding];
    Vibes const *vibes = [Vibes shared];
    [vibes setPushTokenFromData: deviceToken];
  }
  NSLog(@"didRegisterVibesDevice Device ID=%@", notification.object);
}

- (void) dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end
