//
//  RichPushNotificationParsing.swift
//  RichPush
//
//  Created by DHwty on 15/06/2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import UIKit
import UserNotifications

class RichPushNotificationParsing: NSObject {
    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?
    fileprivate let kClientDataKey = "client_app_data"
    fileprivate let kMediaUrlKey = "media_url"
    fileprivate let kRichContentIdentifier = "richContent"
    
    func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
        
        if let bestAttemptContent = bestAttemptContent {
            if let clientData = bestAttemptContent.userInfo[kClientDataKey] as? [String: Any] {
                
                guard let attachmentString = clientData[kMediaUrlKey] as? String else {
                    return
                }

                if let attachmentUrl = URL(string: attachmentString) {
                    let session = URLSession(configuration: URLSessionConfiguration.default)
                    let attachmentDownloadTask = session.downloadTask(with: attachmentUrl, completionHandler: { (location, response, error) in
                        if let location = location {
                            let tmpDirectory = NSTemporaryDirectory()
                            let tmpFile = "file://".appending(tmpDirectory).appending(attachmentUrl.lastPathComponent)
                            let tmpUrl = URL(string: tmpFile)!
                            do {
                                try FileManager.default.moveItem(at: location, to: tmpUrl)
                                if let attachment = try? UNNotificationAttachment(identifier: self.kRichContentIdentifier, url: tmpUrl) {
                                    self.bestAttemptContent?.attachments = [attachment]
                                }
                            } catch {
                                print("An exception was caught while downloading the rich content!")
                            }
                        }
                        // Serve the notification content
                        self.contentHandler!(self.bestAttemptContent!)
                    })
                    attachmentDownloadTask.resume()
                }
            }
        }
    }
    
    func serviceExtensionTimeWillExpire() {
        // Called just before the extension will be terminated by the system.
        // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
        if let contentHandler = contentHandler, let bestAttemptContent =  bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }
}
