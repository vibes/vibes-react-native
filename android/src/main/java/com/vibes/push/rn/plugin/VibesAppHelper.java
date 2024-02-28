package com.vibes.push.rn.plugin;

import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import org.json.*;
import com.facebook.react.bridge.*;


import java.util.Iterator;

import static com.vibes.push.rn.plugin.VibesModule.TAG;

/**
 * Utility class for obtaining items from the ApplicationContext
 */
public class VibesAppHelper {
  private final Context context;

  public VibesAppHelper(Application context) {
    this.context = context;
  }

  public WritableMap convertJsonToMap(JSONObject jsonObject) throws JSONException {
    WritableMap map = new WritableNativeMap();

    Iterator<String> iterator = jsonObject.keys();
    while (iterator.hasNext()) {
      String key = iterator.next();
      Object value = jsonObject.get(key);
      if (value instanceof JSONObject) {
        map.putMap(key, convertJsonToMap((JSONObject) value));
      } else if (value instanceof Boolean) {
        map.putBoolean(key, (Boolean) value);
      } else if (value instanceof Integer) {
        map.putInt(key, (Integer) value);
      } else if (value instanceof Double) {
        map.putDouble(key, (Double) value);
      } else if (value instanceof String) {
        map.putString(key, (String) value);
      } else {
        map.putString(key, value.toString());
      }
    }
    return map;
  }

  public JSONObject convertMapToJson(ReadableMap readableMap) throws JSONException {
    JSONObject object = new JSONObject();
    ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
    while (iterator.hasNextKey()) {
        String key = iterator.nextKey();
        switch (readableMap.getType(key)) {
            case Null:
                object.put(key, JSONObject.NULL);
                break;
            case Boolean:
                object.put(key, readableMap.getBoolean(key));
                break;
            case Number:
                object.put(key, readableMap.getDouble(key));
                break;
            case String:
                object.put(key, readableMap.getString(key));
                break;
            case Map:
                object.put(key, convertMapToJson(readableMap.getMap(key)));
                break;
            case Array:
                object.put(key, convertArrayToJson(readableMap.getArray(key)));
                break;
        }
    }
    return object;
  }

  public JSONArray convertArrayToJson(ReadableArray readableArray) throws JSONException {
    JSONArray array = new JSONArray();
    for (int i = 0; i < readableArray.size(); i++) {
        switch (readableArray.getType(i)) {
            case Null:
                break;
            case Boolean:
                array.put(readableArray.getBoolean(i));
                break;
            case Number:
                array.put(readableArray.getDouble(i));
                break;
            case String:
                array.put(readableArray.getString(i));
                break;
            case Map:
                array.put(convertMapToJson(readableArray.getMap(i)));
                break;
            case Array:
                array.put(convertArrayToJson(readableArray.getArray(i)));
                break;
        }
    }
    return array;
  }

  /**
   * Returns the push token already stored in shared preferences after Firebase runtime was initialized.
   *
   * @return
   */
  public String getPushToken() {
    return getSharedPreferences().getString(VibesModule.TOKEN_KEY, null);
  }

  /**
   * Returns the Vibes device id already stored in shared preferences after Vibes SDK was initialized.
   *
   * @return
   */
  public String getDeviceId() {
    return getSharedPreferences().getString(VibesModule.DEVICE_ID, null);
  }

  /**
   * Returns a Map containing items for <code>device_id</code> and <code>push_token</code> keys to enable quick display.
   *
   * @return
   */
  public WritableMap getDeviceInfo() {
    WritableMap map = Arguments.createMap();
    map.putString("device_id", getDeviceId());
    map.putString("push_token", getPushToken());
    return map;
  }

  public void saveString(String key, String value) {
    SharedPreferences.Editor editor = getSharedPreferences().edit();
    editor.putString(key, value);
    editor.apply();
  }

  public void saveBoolean(String key, boolean value) {
    SharedPreferences.Editor editor = getSharedPreferences().edit();
    editor.putBoolean(key, value);
    editor.apply();
  }

  public boolean getBoolean(String key, boolean alternative) {
    return getSharedPreferences().getBoolean(key, alternative);
  }

  public String getString(String key, String alternative) {
    return getSharedPreferences().getString(key, alternative);
  }

  private SharedPreferences getSharedPreferences() {
    return PreferenceManager.getDefaultSharedPreferences(this.context);
  }

  private Class getMainActivityClass() {
    String packageName = context.getPackageName();
    Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
    String className = launchIntent.getComponent().getClassName();
    try {
      return Class.forName(className);
    } catch (ClassNotFoundException e) {
      e.printStackTrace();
      return null;
    }
  }

  public void invokeApp() {
    try {
      Class<?> activityClass = getMainActivityClass();
      Intent activityIntent = new Intent(context, activityClass);
      activityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      context.startActivity(activityIntent);
    } catch (Exception e) {
      Log.e(TAG, "Class not found", e);
      return;
    }
  }
}
