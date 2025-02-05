//
//  NotificationService.swift
//  RichPush
//
//  Created by DHwty on 11/06/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import UserNotifications

@available(iOS 10.0, *)
class NotificationService: UNNotificationServiceExtension {
  let parse = RichPushNotificationParsing()
  
  override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
    parse.didReceive(request, withContentHandler: contentHandler)
  }
  
  override func serviceExtensionTimeWillExpire() {
    parse.serviceExtensionTimeWillExpire()
  }
}
