//
//  PushEventEmitter.swift
//  VibesExample
//
//  Created by Clement  Wekesa on 24/05/2022.
//

import Foundation

@objc(PushEventEmitter)
class PushEventEmitter: RCTEventEmitter {

  private static var shared: PushEventEmitter?
  private static var initialNotification: [AnyHashable: Any]?

  override init() {
    super.init()
    PushEventEmitter.shared = self
  }

  override func supportedEvents() -> [String]! {
    ["pushReceived", "pushOpened"]
  }

  @objc
  static func setInitialNotification(_ userInfo: [AnyHashable: Any]) {
    initialNotification = userInfo
  }

  override func addListener(_ eventName: String!) {
    super.addListener(eventName)
    if eventName == "pushOpened", let pending = PushEventEmitter.initialNotification {
      sendEvent(withName: "pushOpened", body: pending)
      PushEventEmitter.initialNotification = nil
    }
  }

  @objc
  static func sendPushOpenedEvent(_ userInfo: [AnyHashable: Any]) {
    shared?.sendEvent(withName: "pushOpened", body: userInfo)
  }

  @objc
  static func sendPushReceivedEvent(_ userInfo: [AnyHashable: Any]) {
    shared?.sendEvent(withName: "pushReceived", body: userInfo)
  }
}
