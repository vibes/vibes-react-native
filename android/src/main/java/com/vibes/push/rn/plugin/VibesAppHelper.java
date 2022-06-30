package com.vibes.push.rn.plugin;

import android.app.Application;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import android.content.SharedPreferences;
import android.preference.PreferenceManager;

import static com.vibes.push.rn.plugin.VibesModule.TAG;

/**
 * Utility class for obtaining items from the ApplicationContext
 */
public class VibesAppHelper{
		private Context context;

		public  VibesAppHelper(Application context){
				this.context = context;
		}

		/**
		 * Returns the push token already stored in shared preferences after Firebase runtime was initialized.
		 * @return
		 */
		public String getPushToken(){
				return getSharedPreferences().getString(VibesModule.TOKEN_KEY, null);
		}

		/**
		 * Returns the Vibes device id already stored in shared preferences after Vibes SDK was initialized.
		 * @return
		 */
		public String getDeviceId(){
				return getSharedPreferences().getString(VibesModule.DEVICE_ID, null);
		}

		/**
		 * Returns a Map containing items for <code>device_id</code> and <code>push_token</code> keys to enable quick display.
		 *
		 * @return
		 */
		public WritableMap getDeviceInfo(){
				WritableMap map = Arguments.createMap();
				map.putString("device_id", getDeviceId());
				map.putString("push_token", getPushToken());
				return map;
		}

		public void saveString(String key, String value){
				SharedPreferences.Editor editor = getSharedPreferences().edit();
				editor.putString(key, value);
				editor.apply();
		}

		public void saveBoolean(String key, boolean value){
				SharedPreferences.Editor editor = getSharedPreferences().edit();
				editor.putBoolean(key, value);
				editor.apply();
		}

		public boolean getBoolean(String key, boolean alternative){
				return getSharedPreferences().getBoolean(key, alternative);
		}

		public String getString(String key, String alternative){
				return getSharedPreferences().getString(key, alternative);
		}

		private SharedPreferences getSharedPreferences(){
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
		} catch(Exception e) {
			Log.e(TAG, "Class not found", e);
			return;
		}
	}
}
