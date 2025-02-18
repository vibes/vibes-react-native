package com.vibes.push.rn.plugin.notifications;

import static com.vibes.push.rn.plugin.VibesModule.DEVICE_REGISTERED;
import static com.vibes.push.rn.plugin.VibesModule.TAG;
import static com.vibes.push.rn.plugin.VibesModule.TOKEN_KEY;
import static com.vibes.push.rn.plugin.VibesModule.VIBES_APIURL_KEY;
import static com.vibes.push.rn.plugin.VibesModule.VIBES_APPID_KEY;

import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.preference.PreferenceManager;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.vibes.push.rn.plugin.PushEvtEmitter;
import com.vibes.push.rn.plugin.VibesModule;
import com.vibes.vibes.PushPayloadParser;
import com.vibes.vibes.Vibes;
import com.vibes.vibes.VibesConfig;

import java.util.Map;

public class Fms extends FirebaseMessagingService {
	private PushPayloadParser pushModel;
	private RemoteMessage message;

	@Override
	public void onMessageReceived(RemoteMessage message) {
		Log.d(TAG, "Push message received. Processing");
		this.message = message;
		this.pushModel = createPushPayloadParser(message.getData());

		if (!initializeVibes()) {
			return;
		}
		handleNotification(pushModel, message);
	}

	@Override
	public void onNewToken(String pushToken) {
		super.onNewToken(pushToken);
		Log.d(TAG, "Firebase token obtained from Fms as " + pushToken);
		SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
		preferences.edit().putString(TOKEN_KEY, pushToken).apply();

		if (preferences.getBoolean(DEVICE_REGISTERED, false)) {
			VibesModule.registerPush(pushToken);
		}
	}

	private boolean initializeVibes() {
		try {
			Vibes.getInstance();
			return true;
		} catch (Exception e) {
			initializeVibesAsync();
			return false;
		}
	}

	private void initializeVibesAsync() {
		ApplicationInfo ai;
		try {
			ai = getPackageManager().getApplicationInfo(getPackageName(), PackageManager.GET_META_DATA);
		} catch (PackageManager.NameNotFoundException e) {
			Log.e(TAG, "Failed to get application info", e);
			return;
		}

		Bundle bundle = ai.metaData;
		new Handler(Looper.getMainLooper()).post(() -> {
			String appId = bundle.getString(VIBES_APPID_KEY);
			String apiUrl = bundle.getString(VIBES_APIURL_KEY);

			VibesConfig config = new VibesConfig.Builder()
					.setAppId(appId)
					.setApiUrl(apiUrl != null && !apiUrl.isEmpty() ? apiUrl : null)
					.build();
			Log.d(TAG, "Initializing Vibes with appId=[" + appId + "] and apiUrl=[" + apiUrl + "]");
			Vibes.initialize(this, config);
			handleNotification(pushModel, message);
		});
	}

	private void handleNotification(PushPayloadParser pushModel, RemoteMessage message) {
		new Thread(() -> {
			try {
				Vibes.getInstance().handleNotification(getApplicationContext(), message.getData());
				if (!pushModel.isSilentPush()) {
					emitPayload(pushModel);
				}
			} catch (Exception e) {
				Log.e(TAG, "Error handling notification", e);
			}
		}).start();
	}

	public PushPayloadParser createPushPayloadParser(Map<String, String> map) {
		return new PushPayloadParser(map);
	}

	private void emitPayload(PushPayloadParser pushModel) {
		new Handler(Looper.getMainLooper()).post(() -> {
			ReactInstanceManager mReactInstanceManager = ((ReactApplication) getApplication()).getReactNativeHost()
					.getReactInstanceManager();
			ReactContext context = mReactInstanceManager.getCurrentReactContext();
			if (context != null) {
				new PushEvtEmitter(context).notifyPushReceived(pushModel);
			} else {
				mReactInstanceManager
						.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
							@Override
							public void onReactContextInitialized(ReactContext context) {
								new PushEvtEmitter(context).notifyPushReceived(pushModel);
								mReactInstanceManager.removeReactInstanceEventListener(this);
							}
						});
				if (!mReactInstanceManager.hasStartedCreatingInitialContext()) {
					mReactInstanceManager.createReactContextInBackground();
				}
			}
		});
	}
}
