package com.vibes.push.rn.plugin;

import android.app.Application;
import androidx.annotation.NonNull;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;

import java.util.Map;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;

import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;

import com.vibes.vibes.Credential;
import com.vibes.vibes.Vibes;
import com.vibes.vibes.VibesConfig;
import com.vibes.vibes.VibesListener;

@ReactModule(name = VibesModule.NAME)
public class VibesModule extends ReactContextBaseJavaModule {
	public static final String NAME = "Vibes";
	public static final String DEVICE_REGISTERED = "DEVICE_REGISTERED";
	public static final String TOKEN_REGISTERED = "TOKEN_REGISTERED";
	public static final String TAG = "VibesRN";
	public static final String TOKEN_KEY = "VibesRN.PushToken";
	public static final String DEVICE_ID = "VibesRN.Device_Id";
	public static final String VIBES_APPID_KEY = "com.vibes.push.rn.plugin.appId";
	public static final String VIBES_APIURL_KEY = "com.vibes.push.rn.plugin.apiUrl";
	public static final String REGISTER_DEVICE_ERROR_KEY = "REGISTER_DEVICE_ERROR";
	public static final String UNREGISTER_DEVICE_ERROR_KEY = "UNREGISTER_DEVICE_ERROR";
	public static final String PLUGIN_ERROR_KEY = "PLUGIN_ERROR";
	public static final String REGISTER_PUSH_ERROR_KEY = "REGISTER_PUSH_ERROR";


	private VibesAppHelper appHelper;

	public VibesModule(ReactApplicationContext reactContext) {
		super(reactContext);
		appHelper = new VibesAppHelper((Application) reactContext.getApplicationContext());
	}

	@Override
	@NonNull
	public String getName() {
		return NAME;
	}

	@Override
	public void initialize()  {
		FirebaseInstanceId.getInstance().getInstanceId()
				.addOnSuccessListener(
						new OnSuccessListener<InstanceIdResult>() {
							@Override
							public void onSuccess(InstanceIdResult instanceIdResult) {
								String instanceToken = instanceIdResult.getToken();
								if (instanceToken != null) {
									appHelper.saveString(VibesModule.TOKEN_KEY, instanceToken);
									Log.d(TAG, "Push token obtained from FirebaseInstanceId --> " + instanceToken);
								}
							}
						}
				)
				.addOnFailureListener(
						new OnFailureListener() {
							@Override
							public void onFailure(Exception e) {
								Log.d(TAG, "Failed to fetch token from FirebaseInstanceId: " + e.getLocalizedMessage());
							}
						}
				);

		if (BuildConfig.DEBUG) Log.d(TAG, "Initializing Vibes SDK");

		String env = null;
		String appId = null;
		String apiUrl = null;
		try {
			ApplicationInfo ai = getReactApplicationContext().getPackageManager()
					.getApplicationInfo(getReactApplicationContext().getPackageName(), PackageManager.GET_META_DATA);
			Bundle bundle = ai.metaData;
			appId = bundle.getString(VIBES_APPID_KEY);
			apiUrl = bundle.getString(VIBES_APIURL_KEY);

		} catch (PackageManager.NameNotFoundException ex) {

		}
		if (appId == null || appId.isEmpty()) {
			throw new IllegalStateException("No appId provided in manifest under name [" + VIBES_APPID_KEY + "]");
		}
	   
		VibesConfig config = null;
		if (apiUrl == null || apiUrl.isEmpty()) {
			config = new VibesConfig.Builder().setAppId(appId).build();
			Log.d(TAG, "Initializing the plugin with appId=[" + appId + "]. Will use default apiUrl");
		}else{
			config = new VibesConfig.Builder().setApiUrl(apiUrl).setAppId(appId).build();
			Log.d(TAG, "Initializing the plugin with appId=[" + appId + "] and apiUrl=[" + apiUrl + "]");
		}

		Vibes.initialize(getReactApplicationContext(), config);
		this.registerDeviceAtStartup();

	}
	
	@ReactMethod
	public void registerDevice(final Promise promise) {
		Log.d(TAG, "Plugin called to register device");
		VibesListener<Credential> listener = getRegisterDeviceListener(promise);
		Vibes.getInstance().registerDevice(listener);
	}

	@ReactMethod
	public void getVibesDeviceInfo(final Promise promise) {
		Log.d(TAG, "Plugin called to return device info");
		WritableMap map = appHelper.getDeviceInfo();
		promise.resolve(map);   
	}

	@ReactMethod
	public void registerPush(final Promise promise) {
		Log.d(TAG, "Plugin called to register push token with platform");
		VibesListener<Void> listener = getRegisterPushListener(promise);
		String pushToken = appHelper.getPushToken();
		if(pushToken == null){
			FirebaseInstanceId.getInstance().getInstanceId()
					.addOnSuccessListener(
						new OnSuccessListener<InstanceIdResult>() {
							@Override
							public void onSuccess(InstanceIdResult instanceIdResult) {
								String instanceToken = instanceIdResult.getToken();
								if (instanceToken == null) {
									promise.reject(REGISTER_PUSH_ERROR_KEY,"No push token available for registration yet");
								} else {
									appHelper.saveString(VibesModule.TOKEN_KEY, instanceToken);
									Log.d(TAG, "Push token obtianed from FirebaseInstanceId --> " + instanceToken);
									VibesListener<Void> listener = getRegisterPushListener(promise);
									registerPush(instanceToken, listener);
								}
							}
						}
					)
					.addOnFailureListener(
						new OnFailureListener() {
							@Override
							public void onFailure(Exception e) {
								Log.d(TAG, "Failed to fetch token from FirebaseInstanceId: "+ e.getLocalizedMessage());
								promise.reject(REGISTER_DEVICE_ERROR_KEY, "No push token available for registration yet");
							}
						}
					);
		}else{
			boolean tokenRegistered = appHelper.getBoolean(VibesModule.TOKEN_REGISTERED, false);
			if(tokenRegistered){
				promise.resolve("Success");
			}else{
				registerPush(pushToken, listener);
			}
		}
	}

	@ReactMethod
	public void unregisterDevice(final Promise promise) {
		VibesListener<Void> listener = new VibesListener<Void>() {
			public void onSuccess(Void credential) {
				Log.d(TAG, "Unregister device successful");
				appHelper.saveString(VibesModule.DEVICE_ID, null);
				appHelper.saveBoolean(VibesModule.DEVICE_REGISTERED, false);
				promise.resolve("Success");
			}

			public void onFailure(String errorText) {
				Log.d(TAG, "Unregister device failed");
				promise.reject(UNREGISTER_DEVICE_ERROR_KEY, errorText);
			}
		};
		Vibes.getInstance().unregisterDevice(listener);
	}

	private void registerDeviceAtStartup() {
		VibesListener<Credential> listener = getRegisterDeviceListener(null);
		Vibes.getInstance().registerDevice(listener);
	}


	private VibesListener<Credential> getRegisterDeviceListener(final Promise promise) {
		return new VibesListener<Credential>() {
			public void onSuccess(Credential credential) {
				appHelper.saveBoolean(VibesModule.DEVICE_REGISTERED, true);
				String deviceId = credential.getDeviceID();
				appHelper.saveString(VibesModule.DEVICE_ID, deviceId);
				Log.d(TAG, "Device id obtained is --> " + deviceId);
				String pushToken = appHelper.getPushToken();
				if (pushToken == null) {
					Log.d(TAG, "Token not yet available. Skipping registerPush");
				} else {
					Log.d(TAG, "Token found after registering device. Attempting to register push token");
					registerPush(pushToken);
				}
				WritableMap map = Arguments.createMap();
				map.putString("device_id", credential.getDeviceID());
				if (promise != null) {
					promise.resolve(map);
				}
			}

			public void onFailure(String errorText) {
				Log.e(TAG, "Failure registering device with Vibes Push SDK: " + errorText);
				if (promise != null) {
					promise.reject(REGISTER_DEVICE_ERROR_KEY, errorText);
				}
			}
		};
	}

	private VibesListener<Void> getRegisterPushListener(final Promise promise) {
		return new VibesListener<Void>() {
			public void onSuccess(Void credential) {
				appHelper.saveBoolean(VibesModule.TOKEN_REGISTERED, true);
				Log.d(TAG, "Push token registration successful");
				if(promise !=null){
					promise.resolve("Success");
				}
			}

			public void onFailure(String errorText) {
				appHelper.saveBoolean(VibesModule.TOKEN_REGISTERED, false);
				Log.d(TAG, "Failure registering token with Vibes Push SDK: " + errorText);
				if(promise !=null){
					promise.reject(REGISTER_DEVICE_ERROR_KEY, errorText);
				}
			}
		};
	}

	/**
	 * To be able to target each device, we need to send the push token generated by the Firebase environment to the
	 * server-side via the SDK. However, ensure that {@link Vibes#registerDevice()} has been called before this is called.
	 *
	 * @param pushToken
	 */
	public static void registerPush(String pushToken) {
		Log.d(TAG, "Registering push token with vibes");
		VibesListener<Void> listener = new VibesListener<Void>() {
			public void onSuccess(Void credential) {
				Log.d(TAG, "Push token registration successful");
			}

			public void onFailure(String errorText) {
				Log.d(TAG, "Failure registering token with Vibes Push SDK: " + errorText);
			}
		};      
		registerPush(pushToken, listener);
	}

	public static void registerPush(String pushToken, VibesListener<Void> listener) {
		Vibes.getInstance().registerPush(pushToken, listener);
	}

	/**
	 * Unregisters a device from receiving further push notifications
	 */
	@ReactMethod
	public void unregisterPush(final Promise promise) {
		VibesListener<Void> listener = new VibesListener<Void>() {
			public void onSuccess(Void credential) {
				Log.d(TAG, "Unregister push successful");
				appHelper.saveString(VibesModule.TOKEN_KEY, null);
				appHelper.saveBoolean(VibesModule.TOKEN_REGISTERED, false);
				promise.resolve("Success");
			}
			public void onFailure(String errorText) {
				Log.d(TAG, "Unregister push failed");
				promise.reject("REGISTER_PUSH_ERROR", errorText);
			}
		};
		Vibes.getInstance().unregisterPush(listener);
	}

	/**
    * @param externalPersonId The id to associate with the logged-in person.
    */
    @ReactMethod
    public void associatePerson(final String externalPersonId, final Promise promise) {
            Log.d(TAG, "Associating Person --> " + externalPersonId);
            VibesListener<Void> listener = new VibesListener<Void>() {
                public void onSuccess(Void value) {
                    promise.resolve("Success");;
                }

                public void onFailure(String errorText) {
                    promise.reject("ASSOCIATE_PERSON_ERROR", errorText);
                }
            };
            this.associatePerson(externalPersonId, listener);
    }

    private void associatePerson(String externalPersonId, VibesListener<Void> listener) {
        Vibes.getInstance().associatePerson(externalPersonId, listener);
    }

		/**
     * React Native Plugin Method that updates client device information with Vibes.
     *
     * @param updateCredential a boolean indicating if it's a token update or device info update. Specify false if not certain
     * @param latitude         client device latitude
     * @param longitude        client device longitude
     */
		@ReactMethod
		public void updateDevice(final boolean updateCredential, Double latitude, Double longitude, final Promise promise) {
			Log.d(TAG, "Plugin called to update");
			VibesListener<Credential> listener = getRegisterDeviceListener(promise);
			Vibes.getInstance().updateDevice(updateCredential, latitude, longitude, listener);
		}	
}
