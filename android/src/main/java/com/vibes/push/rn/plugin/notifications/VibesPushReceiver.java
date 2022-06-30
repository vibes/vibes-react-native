package com.vibes.push.rn.plugin.notifications;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.vibes.push.rn.plugin.VibesModule;
import com.vibes.push.rn.plugin.PushEvtEmitter;
import com.vibes.vibes.PushPayloadParser;
import com.vibes.vibes.Vibes;
import com.vibes.vibes.VibesReceiver;

import static com.vibes.push.rn.plugin.VibesModule.TAG;

public class VibesPushReceiver extends VibesReceiver{
  
  @Override
  protected void onPushOpened(Context context, PushPayloadParser pushModel) {
    super.onPushOpened(context, pushModel);
    Log.d(TAG, "Push message tapped. Emitting event");
    emitPayload(context, pushModel);
  }

  private void emitPayload(Context context, PushPayloadParser pushModel) {
    final VibesPushReceiver serviceRef = this;
    // We need to run this on the main thread, as the React code assumes that is true.
    // Namely, DevServerHelper constructs a Handler() without a Looper, which triggers:
    // "Can't create handler inside thread that has not called Looper.prepare()"
    Handler handler = new Handler(Looper.getMainLooper());
    handler.post(new Runnable() {
      public void run() {
        // Construct and load our normal React JS code bundle
        final ReactInstanceManager mReactInstanceManager = ((ReactApplication) context.getApplicationContext()).getReactNativeHost().getReactInstanceManager();
        ReactContext context = mReactInstanceManager.getCurrentReactContext();
        // If it's constructed, send a notification
        if (context != null) {
          PushEvtEmitter pushEmitter = new PushEvtEmitter(context);
          pushEmitter.notifyPushOpened(pushModel);
        } else {
          // Otherwise wait for construction, then send the notification
          mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
            public void onReactContextInitialized(ReactContext context) {
              PushEvtEmitter pushEmitter = new PushEvtEmitter(context);
              pushEmitter.notifyPushOpened(pushModel);
              mReactInstanceManager.removeReactInstanceEventListener(this);
            }
          });
          if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
            // Construct it in the background
            mReactInstanceManager.createReactContextInBackground();
          }
        }
      }
    });
  }
}
