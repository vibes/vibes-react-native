//
//  EventEmitterLogger.swift
//  Vibes
//
//  Created by DHwty on 22/04/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import UIKit
import VibesPush

@objcMembers
class VibesPluginLogger: NSObject {
    static let Log = NSNotification.Name(rawValue: "Log")
    static var data = [NSString]()
    static let shared = VibesPluginLogger()
    public typealias JsonObject = [String: Any]
    let kBodyUrl = "url"
    let kBodyMethod = "method"
    let kBodyHeaders = "headers"
    let kBody = "body"
    let kBodyType = "type"
    let kHTTPStatusCode = "http_status"

    var deviceId: String! = "-"

    // Can't init is singleton
    override private init() { }

    fileprivate func sendLog(uuid: String,
                             timestamp: String,
                             body: [AnyHashable: Any],
                             request_type: String) {
        // get the saved device id from prefs, if not exist we will use "-"
        if let devId = UserDefaults.standard.vibesDeviceId {
            deviceId = devId
        }
        // get env from plist config file if set, else throw fatal error
        guard let env = Configuration.configValue(.vibesAppEnv) else {
            fatalError("`\(ConfigKey.vibesAppEnv.value())` must be set in plist file of current build configuration")
        }
        let jsonObj: [String: Any] = ["os_type": "iOS",
                                      "device_id": deviceId ?? " - ",
                                      "env": env,
                                      "uuid": uuid,
                                      "request type": request_type,
                                      "data": body,
        ]

        // we comment out in case of debugging in xcode
        // debugPrint(VibesPluginLogger.stringify(json: jsonObj, prettyPrinted: true))
    }

    static func stringify(json: Any, prettyPrinted: Bool = false) -> String {
        var options: JSONSerialization.WritingOptions = []
        if prettyPrinted {
            options = JSONSerialization.WritingOptions.prettyPrinted
        }

        do {
            let data = try JSONSerialization.data(withJSONObject: json, options: options)
            if let string = String(data: data, encoding: String.Encoding.utf8) {
                return string
            }
        } catch {
            debugPrint(error)
        }

        return ""
    }

    fileprivate func dispatch(_ body: [AnyHashable: Any], requestType: String) {
        do {
            let pretty = try JSONSerialization.data(withJSONObject: body, options: .prettyPrinted)
            let uuid = (UIDevice.current.identifierForVendor?.uuidString)!
            let timestamp = Date().description
            if let log = NSString(data: pretty, encoding: String.Encoding.utf8.rawValue) {
                VibesPluginLogger.data.insert(NSString(string: "\(timestamp) \(log)"), at: 0)
            }
            sendLog(uuid: uuid, timestamp: timestamp, body: body, request_type: requestType)
        } catch {
            debugPrint("[LOG] Error during deserialization")
        }
    }

    fileprivate func getLogMetaData() -> JsonObject {
        var meta: JsonObject = [:]

        if let buildNumber = Configuration.configValue(.appBuildNumber),
           let versionNumber = Configuration.configValue(.appVersionNumber) {
            meta["appBuildNumber"] = buildNumber
            meta["appVersionNumber"] = versionNumber
        }

        let os = ProcessInfo.processInfo.operatingSystemVersion
        meta["osRelease"] = "\(os.majorVersion).\(os.minorVersion).\(os.patchVersion)"
        meta["vendorIdentifier"] = UIDevice.current.identifierForVendor!.uuidString
        return meta
    }
}

extension String {
    func capitalizingFirstLetter() -> String {
        return prefix(1).capitalized + dropFirst()
    }

    mutating func capitalizeFirstLetter() {
        self = capitalizingFirstLetter()
    }
}

extension VibesPluginLogger: VibesLogger {
    func log(_ logObject: LogObject) {
        let body = [
            "type": "\(logObject.level.logPrefix.lowercased().capitalizingFirstLetter())",
            "description": logObject.message,
        ]
        dispatch(body, requestType: "[\(logObject.level.logPrefix)]")
    }

    func log(request: URLRequest) {
        let body = [
            "type": "Request",
            "method": request.methodDescription,
            "url": request.urlDescription,
            "headers": request.headerFieldsDescription,
            "body": request.bodyDescription,
        ]
        dispatch(body, requestType: "[REQUEST]")
    }

    func log(response: URLResponse, data: Data?) {
        var responseBody: NSString
        if let url = response.url {
            if let data = data {
                responseBody = NSString(data: data, encoding: String.Encoding.utf8.rawValue)!
            } else {
                responseBody = "[]"
            }

            let body = [
                kBodyType: "Response",
                kBodyMethod: "-",
                kBodyUrl: (response.url?.absoluteString)!,
                kBodyHeaders: (response as? HTTPURLResponse)?.headersDescription as Any,
                kBody: responseBody as String,
                kHTTPStatusCode: (response as? HTTPURLResponse)?.statusCode as Any,
            ] as [AnyHashable: Any]
            dispatch(body, requestType: "[RESPONSE]")
        }
    }

    func log(error: Error) {
        let body = [
            "type": "Error",
            "description": error.localizedDescription,
        ]
        dispatch(body, requestType: "[ERROR]")
    }
}
