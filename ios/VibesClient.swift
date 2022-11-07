//
//  VibesClient.swift
//  Vibes
//
//  Created by DHwty on 22/04/2022.
//  Copyright © 2022 Facebook. All rights reserved.
//

import VibesPush

@objcMembers
class VibesClient: NSObject {
    static let standard = VibesClient()

    public let vibes: VibesPush.Vibes
    public var logger: VibesLogger? = VibesPluginLogger.shared

    override private init() {
        // ensure we have Vibes app url set in current build config's Info.plist
        guard let appUrl = Configuration.configValue(.vibesApiURL) else {
            fatalError("`\(ConfigKey.vibesApiURL.value())` must be set in plist file of current build configuration")
        }
        // ensure we have Vibes app id set in current build config's Info.plist
        guard let appId = Configuration.configValue(.vibesAppId) else {
            fatalError("`\(ConfigKey.vibesAppId.value())` must be set in plist file of current build configuration")
        }
        let config = VibesConfiguration(advertisingId: nil,
                                        apiUrl: appUrl,
                                        logger: logger,
                                        storageType: .USERDEFAULTS)

        VibesPush.Vibes.configure(appId: appId, configuration: config)
        vibes = VibesPush.Vibes.shared
    }
}
