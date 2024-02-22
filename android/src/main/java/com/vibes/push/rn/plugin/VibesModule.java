package com.vibes.push.rn.plugin;

import android.app.Application;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.*;
import com.facebook.react.module.annotations.ReactModule;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;
import com.google.gson.Gson;
import com.vibes.vibes.*;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Collection;

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
  public static final String GET_PERSON_ERROR = "GET_PERSON_ERROR";
  public static final String FETCH_INBOX_MESSAGES_ERROR = "FETCH_INBOX_MESSAGES_ERROR";
  public static final String FETCH_SINGLE_INBOX_MESSAGE_ERROR = "FETCH_SINGLE_INBOX_MESSAGE_ERROR";
  public static final String PERSON_KEY = "PERSON_KEY";
  public static final String EXTERNAL_PERSON_ID_KEY = "EXTERNAL_PERSON_ID_KEY";
  public static final String MARK_INBOX_MESSAGE_AS_READ_ERROR = "MARK_INBOX_MESSAGE_AS_READ_ERROR";
  public static final String INBOX_MESSAGE_OPEN_ERROR = "INBOX_MESSAGE_OPEN_ERROR";
  public static final String EXPIRE_INBOX_MESSAGE_ERROR = "EXPIRE_INBOX_MESSAGE_ERROR";


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
  public void initialize() {
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
            })
        .addOnFailureListener(
            new OnFailureListener() {
              @Override
              public void onFailure(Exception e) {
                Log.d(TAG, "Failed to fetch token from FirebaseInstanceId: " + e.getLocalizedMessage());
              }
            });

    if (BuildConfig.DEBUG)
      Log.d(TAG, "Initializing Vibes SDK");

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
    } else {
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
    if (pushToken == null) {
      FirebaseInstanceId.getInstance().getInstanceId()
          .addOnSuccessListener(
              new OnSuccessListener<InstanceIdResult>() {
                @Override
                public void onSuccess(InstanceIdResult instanceIdResult) {
                  String instanceToken = instanceIdResult.getToken();
                  if (instanceToken == null) {
                    promise.reject(REGISTER_PUSH_ERROR_KEY, "No push token available for registration yet");
                  } else {
                    appHelper.saveString(VibesModule.TOKEN_KEY, instanceToken);
                    Log.d(TAG, "Push token obtianed from FirebaseInstanceId --> " + instanceToken);
                    VibesListener<Void> listener = getRegisterPushListener(promise);
                    registerPush(instanceToken, listener);
                  }
                }
              })
          .addOnFailureListener(
              new OnFailureListener() {
                @Override
                public void onFailure(Exception e) {
                  Log.d(TAG, "Failed to fetch token from FirebaseInstanceId: " + e.getLocalizedMessage());
                  promise.reject(REGISTER_DEVICE_ERROR_KEY, "No push token available for registration yet");
                }
              });
    } else {
      boolean tokenRegistered = appHelper.getBoolean(VibesModule.TOKEN_REGISTERED, false);
      if (tokenRegistered) {
        promise.resolve("Success");
      } else {
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
        if (promise != null) {
          promise.resolve("Success");
        }
      }

      public void onFailure(String errorText) {
        appHelper.saveBoolean(VibesModule.TOKEN_REGISTERED, false);
        Log.d(TAG, "Failure registering token with Vibes Push SDK: " + errorText);
        if (promise != null) {
          promise.reject(REGISTER_DEVICE_ERROR_KEY, errorText);
        }
      }
    };
  }

  /**
   * To be able to target each device, we need to send the push token generated by
   * the Firebase environment to the
   * server-side via the SDK. However, ensure that {@link Vibes#registerDevice()}
   * has been called before this is called.
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
        promise.resolve("Success");
        ;
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
   * Fetches details of a person associated with device
   */
  @ReactMethod
  public void getPerson(final Promise promise) {
    VibesListener<Person> listener = new VibesListener<Person>() {
      public void onSuccess(Person value) {
        Log.d(TAG, "Get Person Successful");
        appHelper.saveString(VibesModule.PERSON_KEY, value.getPersonKey());
        appHelper.saveString(VibesModule.EXTERNAL_PERSON_ID_KEY, value.getExternalPersonId());

        WritableMap map = Arguments.createMap();
        map.putString("person_key", value.getPersonKey());
        map.putString("external_person_id", value.getExternalPersonId());
        if (promise != null) {
          promise.resolve(map);
        }
      }

      public void onFailure(String errorText) {
        Log.d(TAG, "Get Person Failed failed");
        promise.reject(GET_PERSON_ERROR, errorText);
      }
    };
    Vibes.getInstance().getPerson(listener);
  }

  /**
   * React Native Plugin Method that updates client device information with Vibes.
   *
   * @param updateCredential a boolean indicating if it's a token update or device
   *                         info update. Specify false if not certain
   * @param latitude         client device latitude
   * @param longitude        client device longitude
   */
  @ReactMethod
  public void updateDevice(final boolean updateCredential, Double latitude, Double longitude, final Promise promise) {
    Log.d(TAG, "Plugin called to update");
    VibesListener<Credential> listener = getRegisterDeviceListener(promise);
    Vibes.getInstance().updateDevice(updateCredential, latitude, longitude, listener);
  }

  @ReactMethod
  public void fetchInboxMessages(final Promise promise) {
    VibesListener<Collection<InboxMessage>> listener = new VibesListener<Collection<InboxMessage>>() {
      public void onSuccess(Collection<InboxMessage> values) {
        Log.d(TAG, "Fetch inbox messages success");
        Gson gson = new Gson();
        WritableArray array = Arguments.createArray();
        for (InboxMessage message : values) {
          try {
            JSONObject jsonObject = new JSONObject(gson.toJson(message));
            WritableMap writableMap = appHelper.convertJsonToMap(jsonObject);
            array.pushMap(writableMap);
          } catch (JSONException e) {
            Log.e(TAG, e.getLocalizedMessage());
          }
        }
        if (promise != null) {
          promise.resolve(array);
        }
      }

      public void onFailure(String errorText) {
        Log.d(TAG, "Fetch inbox messages failed: " + errorText);
        promise.reject(FETCH_INBOX_MESSAGES_ERROR, errorText);
      }
    };
    Vibes.getInstance().fetchInboxMessages(listener);
  }

  @ReactMethod
  public void fetchInboxMessage(final String messageUid, final Promise promise) {
    VibesListener<InboxMessage> listener = new VibesListener<InboxMessage>() {
      public void onSuccess(InboxMessage message) {
        Log.d(TAG, "Fetch single inbox message success");
        Gson gson = new Gson();
        try {
          JSONObject jsonObject = new JSONObject(gson.toJson(message));
          WritableMap writableMap = appHelper.convertJsonToMap(jsonObject);
          if (promise != null) {
            promise.resolve(writableMap);
          }
        } catch (JSONException e) {
          Log.e(TAG, e.getLocalizedMessage());
          promise.reject(FETCH_SINGLE_INBOX_MESSAGE_ERROR, e.getLocalizedMessage());
        }
      }

      public void onFailure(String errorText) {
        Log.d(TAG, "Fetch single inbox message failed: " + errorText);
        promise.reject(FETCH_SINGLE_INBOX_MESSAGE_ERROR, errorText);
      }
    };
    Vibes.getInstance().fetchInboxMessage(messageUid, listener);
  }

  @ReactMethod
  public void markInboxMessageAsRead(final String messageUid, final Promise promise) {
    VibesListener<InboxMessage> listener = new VibesListener<InboxMessage>() {
      public void onSuccess(InboxMessage message) {
        Log.d(TAG, "Mark inbox message as read");
        Gson gson = new Gson();
        try {
          JSONObject jsonObject = new JSONObject(gson.toJson(message));
          WritableMap writableMap = appHelper.convertJsonToMap(jsonObject);
          if (promise != null) {
            promise.resolve(writableMap);
          }
        } catch (JSONException e) {
          Log.e(TAG, e.getLocalizedMessage());
          promise.reject(MARK_INBOX_MESSAGE_AS_READ_ERROR, e.getLocalizedMessage());
        }
      }

      public void onFailure(String errorText) {
        Log.d(TAG, "Marking inbox message as read failed: " + errorText);
        promise.reject(MARK_INBOX_MESSAGE_AS_READ_ERROR, errorText);
      }
    };
    Vibes.getInstance().markInboxMessageAsRead(messageUid, listener);
  }

  @ReactMethod
  public void expireInboxMessage(final String messageUid, final Promise promise) {
    VibesListener<InboxMessage> listener = new VibesListener<InboxMessage>() {
      public void onSuccess(InboxMessage message) {
        Log.d(TAG, "Expiring inbox message successful");
        Gson gson = new Gson();
        try {
          JSONObject jsonObject = new JSONObject(gson.toJson(message));
          WritableMap writableMap = appHelper.convertJsonToMap(jsonObject);
          if (promise != null) {
            promise.resolve(writableMap);
          }
        } catch (JSONException e) {
          Log.e(TAG, e.getLocalizedMessage());
          promise.reject(EXPIRE_INBOX_MESSAGE_ERROR, e.getLocalizedMessage());
        }
      }

      public void onFailure(String errorText) {
        Log.d(TAG, "Expiring inbox message failed: " + errorText);
        promise.reject(EXPIRE_INBOX_MESSAGE_ERROR, errorText);
      }
    };
    Vibes.getInstance().expireInboxMessage(messageUid, listener);
  }

  @ReactMethod
  public void onInboxMessageOpen(ReadableMap readableMap, final Promise promise) {
    Log.d(TAG, "Recording an inbox_open event");
    Gson gson = new Gson();
    try {
      JSONObject jsonObject = appHelper.convertMapToJson(readableMap);
      InboxMessage inboxMessage = gson.fromJson(jsonObject.toString(), InboxMessage.class);
      Vibes.getInstance().onInboxMessageOpen(inboxMessage);
      if (promise != null) {
        Log.d(TAG, "Success recording an inbox_open event");
        promise.resolve("");
      }
    } catch (Exception e) {
      Log.e(TAG, "Error recording inbox_open event: " + e.getLocalizedMessage());
      promise.reject(INBOX_MESSAGE_OPEN_ERROR, e.getLocalizedMessage());
    }

  }

  @ReactMethod
  public void onInboxMessagesFetched(final Promise promise) {
    Log.d(TAG, "Recording an inbox_fetch event");
    Vibes.getInstance().onInboxMessagesFetched();
    if (promise != null) {
      Log.d(TAG, "Success recording an inbox_fetch event");
      promise.resolve("");
    }
  }

}
