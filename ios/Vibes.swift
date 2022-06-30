import Foundation
import UserNotifications
import VibesPush

@objc(Vibes)
class Vibes: NSObject, RCTBridgeModule, VibesPush.VibesAPIDelegate {
    static func moduleName() -> String! {
        return "Vibes"
    }

    let userDefaults = UserDefaults.standard

    var vibes: VibesPush.Vibes
    var registerDeviceResolver: RCTPromiseResolveBlock?
    var registerDeviceRejecter: RCTPromiseRejectBlock?
    var unregisterDeviceResolver: RCTPromiseResolveBlock?
    var unregisterDeviceRejecter: RCTPromiseRejectBlock?

    var registerPushResolver: RCTPromiseResolveBlock?
    var registerPushRejecter: RCTPromiseRejectBlock?
    var unregisterPushResolver: RCTPromiseResolveBlock?
    var unregisterPushRejecter: RCTPromiseRejectBlock?
    var associatePersonResolver: RCTPromiseResolveBlock?
    var associatePersonRejecter: RCTPromiseRejectBlock?
    var updateDeviceResolver: RCTPromiseResolveBlock?
    var updateDeviceRejecter: RCTPromiseRejectBlock?

    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override init() {
        vibes = VibesClient.standard.vibes
        super.init()

        vibes.delegate = self
        vibes.registerDevice()
    }

    // MARK: - Register device

    @objc
    /// Register Device
    /// - Parameters:
    ///   - resolve: promise resolver
    ///   - reject: promise rejecter
    func registerDevice(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
        registerDeviceResolver = resolve
        registerDeviceRejecter = reject
        if vibes.isDeviceRegistered(),
           let registerDeviceResolver = registerDeviceResolver,
           let deviceId = userDefaults.object(forKey: "vibesDeviceId") {
            registerDeviceResolver(["device_id": deviceId])
            return
        }
        vibes.registerDevice()
    }

    @objc
    /// Un-register Device
    /// - Parameters:
    ///   - resolve: promise resolver
    ///   - reject: promise rejecter
    func unregisterDevice(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
        unregisterDeviceResolver = resolve
        unregisterDeviceRejecter = reject
        vibes.unregisterDevice()
    }

    @objc
    /// Register Push
    /// - Parameters:
    ///   - resolve: promise resolver
    ///   - reject: promise rejecter
    func registerPush(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
        registerPushResolver = resolve
        registerPushRejecter = reject
        if vibes.isDeviceRegistered() {
            vibes.registerPush()
        } else {
            if let registerPushRejecter = registerPushRejecter {
                registerPushRejecter("REGISTER_PUSH_ERROR", "Device Not Registered: \(VibesError.noCredentials)", VibesError.noCredentials)
            }
        }
    }

    @objc
    /// Un-register Push
    /// - Parameters:
    ///   - resolve: promise resolver
    ///   - reject: promise rejecter
    func unregisterPush(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
        unregisterPushResolver = resolve
        unregisterPushRejecter = reject
        if vibes.isDevicePushRegistered() {
            vibes.unregisterPush()
        } else {
            if let unregisterPushRejecter = unregisterPushRejecter {
                unregisterPushRejecter("UNREGISTER_PUSH_ERROR", "Push Not Registered: \(VibesError.noPushToken)", VibesError.noPushToken)
            }
        }
    }

    @objc
    /// Associate device to person
    /// - Parameters:
    ///   - externalPersonId: External person ID
    ///   - resolve: promise resolver
    ///   - reject: promise rejecter
    func associatePerson(_ externalPersonId: String, resolver resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
        associatePersonResolver = resolve
        associatePersonRejecter = reject
        vibes.associatePerson(externalPersonId: externalPersonId)
    }

    @objc
    /// Update device
    /// - Parameters:
    ///   - updateCredentials: a boolean indicating if it's a token update or device info update. Specify false if not certain
    ///   - lat: Latitude
    ///   - lon: Longitude
    ///   - resolve: promise resolver
    ///   - reject: promise rejecter
    func updateDevice(_ updateCredentials: Bool, lat: NSNumber, lon: NSNumber, resolver resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
        updateDeviceResolver = resolve
        updateDeviceRejecter = reject
        vibes.updateDevice(lat: lat, long: lon, updateCredentials: updateCredentials)
    }

    @objc
    /// Get Vibes Device Info
    /// - Parameters:
    ///   - resolve: promose resolver
    ///   - reject: promise rejector
    func getVibesDeviceInfo(_ resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
        if let deviceId = userDefaults.object(forKey: "vibesDeviceId") {
            if let pushToken = vibes.pushToken {
                resolve(["device_id": deviceId, "push_token": pushToken])
                return
            }
            resolve(["device_id": deviceId])
        }
    }

    func didRegisterDevice(deviceId: String?, error: Error?) {
        if let error = error {
            if let registerDeviceRejecter = registerDeviceRejecter {
                registerDeviceRejecter("REGISTER_DEVICE_ERROR", error.localizedDescription, error)
            }
        } else {
            if let registerDeviceResolver = registerDeviceResolver {
                userDefaults.set(deviceId, forKey: "vibesDeviceId")
                registerDeviceResolver(["device_id": deviceId])
            }
            NotificationCenter.default.post(name: Notification.Name.vibesDeviceRegistered, object: deviceId)
        }
        registerDeviceRejecter = nil
        registerDeviceResolver = nil
    }

    func didUnregisterDevice(error: Error?) {
        if let error = error {
            if let unregisterDeviceRejecter = unregisterDeviceRejecter {
                unregisterDeviceRejecter("UNREGISTER_DEVICE_ERROR", error.localizedDescription, error)
            }
        } else {
            if let unregisterDeviceResolver = unregisterDeviceResolver {
                userDefaults.removeObject(forKey: "vibesDeviceId")
                unregisterDeviceResolver(["success"])
            }
            NotificationCenter.default.post(name: Notification.Name.vibesDeviceUnregistered, object: nil)
        }
        unregisterDeviceRejecter = nil
        unregisterDeviceResolver = nil
    }

    func didRegisterPush(error: Error?) {
        if let error = error {
            if let registerPushRejecter = registerPushRejecter {
                registerPushRejecter("REGISTER_PUSH_ERROR", error.localizedDescription, error)
            }
        } else {
            if let registerPushResolver = registerPushResolver {
                registerPushResolver("Successs")
            }
            NotificationCenter.default.post(name: Notification.Name.vibesPushRegistered, object: vibes.pushToken)
        }
        registerPushRejecter = nil
        registerPushResolver = nil
    }

    func didUnregisterPush(error: Error?) {
        if let error = error {
            if let unregisterPushRejecter = unregisterPushRejecter {
                unregisterPushRejecter("UNREGISTER_PUSH_ERROR", error.localizedDescription, error)
            }
        } else {
            if let unregisterPushResolver = unregisterPushResolver {
                unregisterPushResolver("Successs")
            }
            NotificationCenter.default.post(name: Notification.Name.vibesPushUnregistered, object: nil)
        }
        unregisterPushRejecter = nil
        unregisterPushResolver = nil
    }

    func didAssociatePerson(error: Error?) {
        if let error = error {
            if let associatePersonRejecter = associatePersonRejecter {
                associatePersonRejecter("ASSOCIATE_PERSON_ERROR", error.localizedDescription, error)
            }
        } else {
            if let associatePersonResolver = associatePersonResolver {
                associatePersonResolver("Successs")
            }
            NotificationCenter.default.post(name: Notification.Name.vibesPushDidAssociatePerson, object: nil)
        }
        associatePersonRejecter = nil
        associatePersonResolver = nil
    }
}

extension Notification.Name {
    static let vibesDeviceRegistered = Notification.Name("vibesDeviceRegistered")
    static let vibesDeviceUnregistered = Notification.Name("vibesDeviceUnregistered")
    static let vibesPushRegistered = Notification.Name("vibesPushRegistered")
    static let vibesPushUnregistered = Notification.Name("vibesPushUnregistered")
    static let vibesPushDidAssociatePerson = Notification.Name("vibesPushDidAssociatePerson")
}
