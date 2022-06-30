package com.vibes.push.rn.plugin.notifications;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.os.Handler;
import android.os.Looper;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.vibes.vibes.BuildConfig;
import com.vibes.vibes.PushPayloadParser;
import com.vibes.vibes.Vibes;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;

import java.util.Map;
import com.vibes.push.rn.plugin.VibesModule;
import com.vibes.push.rn.plugin.PushEvtEmitter;
import static com.vibes.push.rn.plugin.VibesModule.TAG;
import static com.vibes.push.rn.plugin.VibesModule.TOKEN_KEY;
import static com.vibes.push.rn.plugin.VibesModule.DEVICE_REGISTERED;

public class Fms extends FirebaseMessagingService {

		@Override
		public void onMessageReceived(RemoteMessage message){

			Log.d(TAG, "Push message received. Processing");
			PushPayloadParser pushModel = this.createPushPayloadParser(message.getData());
			if (BuildConfig.DEBUG) {
				PayloadWrapper wrapper = new PayloadWrapper(pushModel);
				Log.d(TAG, wrapper.toString());
			}
			// pass the received payload to the handleNotification SDK method. It takes care
			// of displaying the message
			try {
				Vibes.getInstance().handleNotification(getApplicationContext(), message.getData());
				if (!pushModel.isSilentPush()) {
					emitPayload(pushModel);
				}
			} catch(IllegalStateException e) {
					Handler handler = new Handler(Looper.getMainLooper());
					handler.post(new Runnable() {
						public void run() {
							Vibes.getInstance().handleNotification(getApplicationContext(), message.getData());
							if (!pushModel.isSilentPush()) {
								emitPayload(pushModel);
							}
						}
					});
			}
		}
		/**
		 * This is invoked everytime the application generates a new Firebase push
		 * token, which is then sent to the Vibes server to be able to target this
		 * device with push messages.
		 *
		 * @param pushToken
		 */
		@Override
		public void onNewToken(String pushToken) {
				super.onNewToken(pushToken);
				Log.d(TAG, "Firebase token obtained from Fms as " + pushToken);
				SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
				SharedPreferences.Editor editor = preferences.edit();
				editor.putString(TOKEN_KEY, pushToken);
				editor.apply();

				boolean registered = preferences.getBoolean(DEVICE_REGISTERED, false);
				if (registered) {
						VibesModule.registerPush(pushToken);
				}
		}

	public PushPayloadParser createPushPayloadParser(Map<String, String> map) {
		return new PushPayloadParser(map);
	}

	private void emitPayload(PushPayloadParser pushModel) {
		final FirebaseMessagingService serviceRef = this;
		// We need to run this on the main thread, as the React code assumes that is true.
		// Namely, DevServerHelper constructs a Handler() without a Looper, which triggers:
		// "Can't create handler inside thread that has not called Looper.prepare()"
		Handler handler = new Handler(Looper.getMainLooper());
		handler.post(new Runnable() {
			public void run() {
				// Construct and load our normal React JS code bundle
				final ReactInstanceManager mReactInstanceManager = ((ReactApplication) serviceRef.getApplication()).getReactNativeHost().getReactInstanceManager();
				ReactContext context = mReactInstanceManager.getCurrentReactContext();
				// If it's constructed, send a notification
				if (context != null) {
					PushEvtEmitter pushEmitter = new PushEvtEmitter(context);
					pushEmitter.notifyPushReceived(pushModel);
				} else {
					// Otherwise wait for construction, then send the notification
					mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
						public void onReactContextInitialized(ReactContext context) {
							PushEvtEmitter pushEmitter = new PushEvtEmitter(context);
							pushEmitter.notifyPushReceived(pushModel);
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
