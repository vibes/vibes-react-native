#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Vibes, NSObject)

RCT_EXTERN_METHOD(registerDevice: (RCTPromiseResolveBlock *)resolve
                                    rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(unregisterDevice: (RCTPromiseResolveBlock *)resolve
                                    rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(registerPush: (RCTPromiseResolveBlock *)resolve
                                    rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(unregisterPush: (RCTPromiseResolveBlock *)resolve
                                    rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(getVibesDeviceInfo: (RCTPromiseResolveBlock *)resolve
                                    rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(associatePerson: (NSString *) externalPersonId
                                    resolver:(RCTPromiseResolveBlock *)resolve
                                    rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(updateDevice: (BOOL ) updateCredentials
                                    lat:(nonnull NSNumber *)lat
                                    lon:(nonnull NSNumber *)lon
                                    resolver:(RCTPromiseResolveBlock *)resolve
                                    rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(getPerson: (RCTPromiseResolveBlock *)resolve
                                    rejecter:(RCTPromiseRejectBlock *)reject)


RCT_EXTERN_METHOD(fetchInboxMessages: (RCTPromiseResolveBlock *)resolve
                                        rejecter:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(fetchInboxMessage: (NSString *) messageUID
                                    resolve:(RCTPromiseResolveBlock *)resolve
                                    reject:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(markInboxMessageAsRead: (NSString *) messageUID
                                    resolve:(RCTPromiseResolveBlock *)resolve
                                    reject:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(expireInboxMessage: (NSString *) messageUID
                                    resolve:(RCTPromiseResolveBlock *)resolve
                                    reject:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(onInboxMessageOpen: (NSDictionary *) message
                                    resolve:(RCTPromiseResolveBlock *)resolve
                                    reject:(RCTPromiseRejectBlock *)reject)

RCT_EXTERN_METHOD(onInboxMessagesFetched: (RCTPromiseResolveBlock *)resolve
                                    reject:(RCTPromiseRejectBlock *)reject)
@end

