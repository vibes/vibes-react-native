//
//  Notifications.swift
//  Vibes
//
//  Created by DHwty on 22/04/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation
import UserNotifications

@objc(Notifications)
@available(iOS 10.0, *)
class Notifications: NSObject {
  let current = UNUserNotificationCenter.current()
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc(isPushEnabled:reject:)
  func isPushEnabled(resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) -> Void{
    current.getNotificationSettings { (settings) in
        if settings.authorizationStatus == .notDetermined {
          resolve("Notifications not determined")
        } else if settings.authorizationStatus == .denied {
          resolve("Notifications denied")
        } else if settings.authorizationStatus == .authorized {
          resolve(true)
        }
    }
  }

  @objc(getDeviceId:reject:)
  func getDeviceId(resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) -> Void{
    let deviceID = getDeviceId()
    resolve(deviceID)
  }
  
  private func getDeviceId (_ tries: Int = 0) -> String? {
    if let deviceID = UserDefaults.standard.vibesDeviceId {
      return deviceID
    } else {
      if tries == 5 {
        print("Error: Unable to get a string after 25secs delay")
        return nil
      }
      sleep(5)
      return getDeviceId(tries + 1)
    }
  }

  @objc(getEnvironment:reject:)
  func getEnvironment(resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) -> Void{
    let env = Configuration.configValue(.vibesAppEnv)
    resolve(env)
  }
}

// MARK: - UserDefaults helpers
extension UserDefaults {
  
  /// The vibes device id, if stored in this UserDefaults, else nil
  public var vibesDeviceId: String? {
    return self.string(forKey: "vibesDeviceId")
  }
  
}
