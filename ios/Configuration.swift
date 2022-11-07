//
//  Configuration.swift
//  Vibes
//
//  Created by DHwty on 22/04/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation

/// Keys found in <Configuration>.plist file i.e in UAT.plist and Production.plist
///
/// - appBuildNumber: The app build number
/// - appVersionNumber: The app version number
/// - vibesAppURL: Vibes app url
/// - vibesAppId: Vibes app id
/// - vibesAppEnv: Vibes app env: UAT or PROD
/// - logseneToken: Logsene token
public enum ConfigKey {
  case appBuildNumber
  case appVersionNumber
  case vibesApiURL
  case vibesAppId
  case vibesAppEnv
  case logseneToken

  /// Actual string vakue for this enum as used in plist file
  ///
  /// - Returns: The string value
  func value() -> String {
      switch self {
        case .appBuildNumber:
          return "CFBundleShortVersionString"
        case .appVersionNumber:
          return "CFBundleVersion"
        case .vibesApiURL:
          return "VibesApiURL"
        case .vibesAppEnv:
        return "VibesAppEnv"
        case .vibesAppId:
          return "VibesAppId"
        case .logseneToken:
          return "LogseneToken"
      }
  }
}

/// This struct will load the plist file for current build
public struct Configuration {
    
  fileprivate static var infoDict: [String: Any]  {
    get {
      if let dict = Bundle.main.infoDictionary {
        return dict
      } else {
        fatalError("Plist file not found")
      }
    }
  }
  
  /// Get the config value of a certain config key from current configuration
  ///
  /// - Parameter key: The key to get value for
  /// - Returns: The value or nil if not found
  public static func configValue(_ key: ConfigKey) -> String? {
    return infoDict[key.value()] as? String
  }
}
