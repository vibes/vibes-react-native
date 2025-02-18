//
//  PushEventEmitter.m
//  VibesExample
//
//  Created by Clement  Wekesa on 24/05/2022.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(PushEventEmitter, RCTEventEmitter)
  RCT_EXTERN_METHOD(supportedEvents)
@end
