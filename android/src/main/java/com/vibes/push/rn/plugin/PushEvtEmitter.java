package com.vibes.push.rn.plugin;

import android.app.Application;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.vibes.vibes.PushPayloadParser;
import com.vibes.vibes.Vibes;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;
import java.util.Set;

/**
 * Component for emitting events to the Javascript layer.
 */
public class PushEvtEmitter {
	private ReactContext mReactContext;
	private VibesAppHelper appHelper;

	public PushEvtEmitter(ReactContext reactContext) {
		mReactContext = reactContext;
		appHelper = new VibesAppHelper((Application) reactContext.getApplicationContext());
	}

	void sendEvent(String eventName, Object params) {
		if (mReactContext.hasActiveCatalystInstance()) {
			mReactContext
					.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
					.emit(eventName, params);
		}
	}

	public void notifyPushReceived(PushPayloadParser bundle) {
		WritableMap payload = convertMap(bundle.getMap());
		WritableMap params = Arguments.createMap();
		params.putMap("payload", payload);
		sendEvent("pushReceived", params);
	}

	public void notifyPushOpened(PushPayloadParser bundle) {
		appHelper.invokeApp();
		WritableMap payload = convertMap(bundle.getMap());
		WritableMap params = Arguments.createMap();
		params.putMap("payload", payload);
		sendEvent("pushOpened", params);
	}

	public static WritableMap convertMap(Map<String, String> data) {
		String jsonString = null;
		WritableMap map = new WritableNativeMap();
		for (Map.Entry<String, String> entry : data.entrySet()) {
			map.putString(entry.getKey(), entry.getValue());
		}
		return map;
	}
}
