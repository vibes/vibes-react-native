import * as fs from 'fs';
import * as path from 'path';

const packageRoot = path.resolve(__dirname, '../..');
const exampleRoot = path.resolve(packageRoot, 'sample-app');

function readPackage(relativePath: string): string {
  return fs.readFileSync(path.join(packageRoot, relativePath), 'utf8');
}

function readExample(relativePath: string): string {
  return fs.readFileSync(path.join(exampleRoot, relativePath), 'utf8');
}

const appDelegate = readExample('ios/VibesExample/AppDelegate.m');
const pushEventEmitter = readExample('ios/PushEventEmitter.swift');
const pushEvtEmitter = readPackage(
  'android/src/main/java/com/vibes/push/rn/plugin/PushEvtEmitter.java'
);
const vibesPushReceiver = readPackage(
  'android/src/main/java/com/vibes/push/rn/plugin/notifications/VibesPushReceiver.java'
);
const fms = readPackage(
  'android/src/main/java/com/vibes/push/rn/plugin/notifications/Fms.java'
);
const mainActivity = readExample(
  'android/app/src/main/java/com/vibes/push/test/rn/MainActivity.java'
);

describe('iOS sample AppDelegate push lifecycle', () => {
  it('wraps cold-start launch payload as @{payload: ...}', () => {
    expect(appDelegate).toContain(
      '[PushEventEmitter setInitialNotification: @{@"payload": payload}]'
    );
    expect(appDelegate).toContain(
      '[[UNUserNotificationCenter currentNotificationCenter] setDelegate: self]'
    );
  });

  it('wraps didReceiveRemoteNotification payload for pushReceived', () => {
    expect(appDelegate).toContain(
      'NSDictionary *payload = @{@"payload": userInfo}'
    );
    expect(appDelegate).toContain(
      '[PushEventEmitter sendPushReceivedEvent: payload]'
    );
  });

  it('emits pushOpened with wrapped payload and calls completionHandler on tap', () => {
    expect(appDelegate).toMatch(
      /didReceiveNotificationResponse:[\s\S]*sendPushOpenedEvent:\s*payload[\s\S]*completionHandler\(\)/
    );
  });

  it('handles foreground pushes via willPresentNotification', () => {
    expect(appDelegate).toContain('willPresentNotification:');
    expect(appDelegate).toMatch(
      /willPresentNotification:[\s\S]*@\{@"payload":\s*userInfo\}[\s\S]*sendPushReceivedEvent:\s*payload/
    );
    expect(appDelegate).toContain('UNNotificationPresentationOptionAlert');
    expect(appDelegate).toContain('UNNotificationPresentationOptionSound');
    expect(appDelegate).toContain('UNNotificationPresentationOptionBadge');
  });
});

describe('iOS PushEventEmitter cold-start queue', () => {
  it('supports pushReceived and pushOpened events', () => {
    expect(pushEventEmitter).toContain('["pushReceived", "pushOpened"]');
  });

  it('flushes initialNotification once when pushOpened listener is added', () => {
    expect(pushEventEmitter).toContain('setInitialNotification');
    expect(pushEventEmitter).toMatch(
      /if eventName == "pushOpened"[\s\S]*sendEvent\(withName: "pushOpened"[\s\S]*initialNotification = nil/
    );
  });
});

describe('Android PushEvtEmitter payload shape', () => {
  it('emits pushReceived as { payload: ... }', () => {
    expect(pushEvtEmitter).toContain('params.putMap("payload", payload)');
    expect(pushEvtEmitter).toContain('sendEvent("pushReceived", params)');
  });

  it('emits pushOpened as { payload: ... }', () => {
    expect(pushEvtEmitter).toContain('sendEvent("pushOpened", params)');
    expect(pushEvtEmitter).toMatch(
      /notifyPushOpened[\s\S]*putMap\("payload", payload\)[\s\S]*sendEvent\("pushOpened"/
    );
  });
});

describe('Android VibesPushReceiver handlePushOpened', () => {
  it('reads Vibes remote message data and emits via emitPayload', () => {
    expect(vibesPushReceiver).toContain('public static void handlePushOpened');
    expect(vibesPushReceiver).toContain('Vibes.VIBES_REMOTE_MESSAGE_DATA');
    expect(vibesPushReceiver).toContain('emitPayload(context, pushModel)');
    expect(vibesPushReceiver).toContain('onPushMessageOpened');
  });

  it('defers emit until React context is ready', () => {
    expect(vibesPushReceiver).toContain('addReactInstanceEventListener');
    expect(vibesPushReceiver).toContain('createReactContextInBackground');
    expect(vibesPushReceiver).toContain('notifyPushOpened');
  });
});

describe('Android Fms pushReceived path', () => {
  it('notifies JS via PushEvtEmitter.notifyPushReceived for non-silent pushes', () => {
    expect(fms).toContain('notifyPushReceived');
    expect(fms).toContain('isSilentPush');
  });
});

describe('Android sample MainActivity cold/background tap', () => {
  it('emits opened pushes through VibesPushReceiver.emitPayload', () => {
    expect(mainActivity).toContain('Vibes.VIBES_REMOTE_MESSAGE_DATA');
    expect(mainActivity).toContain('VibesPushReceiver.emitPayload');
  });
});
