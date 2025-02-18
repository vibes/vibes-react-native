package com.vibes.push.test.rn;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import com.facebook.react.ReactActivity;
import com.vibes.vibes.Vibes;
import com.vibes.vibes.VibesConfig;
import com.vibes.vibes.PushPayloadParser;
import com.vibes.push.rn.plugin.notifications.VibesPushReceiver;

import java.util.HashMap;

import static com.vibes.push.rn.plugin.VibesModule.TAG;
import static com.vibes.push.rn.plugin.VibesModule.VIBES_APIURL_KEY;
import static com.vibes.push.rn.plugin.VibesModule.VIBES_APPID_KEY;

public class MainActivity extends ReactActivity {

  @Override
  protected String getMainComponentName() {
    return "VibesExample";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      handleVibesPushMessage();
    }
  }

  private void handleVibesPushMessage() {
    Log.d(TAG, "Checking if Vibes push message exists in intent");
    HashMap<String, String> pushMap = getPushMessageData();
    if (pushMap != null) {
      try {
        Vibes.getInstance();
      } catch (IllegalStateException e) {
        initializeVibes();
      }
      processPushMessage(pushMap);
    } else {
      Log.d(TAG, "No push received");
    }
  }

  @SuppressWarnings("unchecked")
  private HashMap<String, String> getPushMessageData() {
    return (HashMap<String, String>) getIntent().getSerializableExtra(Vibes.VIBES_REMOTE_MESSAGE_DATA);
  }

  private void initializeVibes() {
    ApplicationInfo ai = getApplicationInfoSafe();
    if (ai != null) {
      Bundle bundle = ai.metaData;
      String appId = bundle.getString(VIBES_APPID_KEY);
      String apiUrl = bundle.getString(VIBES_APIURL_KEY);

      VibesConfig config = new VibesConfig.Builder()
          .setAppId(appId)
          .setApiUrl(apiUrl != null && !apiUrl.isEmpty() ? apiUrl : null)
          .build();

      Log.d(TAG, "Initializing Vibes with appId=[" + appId + "] and apiUrl=[" + apiUrl + "]");
      Vibes.initialize(this, config);
    }
  }

  private ApplicationInfo getApplicationInfoSafe() {
    try {
      return getPackageManager().getApplicationInfo(getPackageName(), PackageManager.GET_META_DATA);
    } catch (PackageManager.NameNotFoundException e) {
      Log.e(TAG, "Failed to get application info", e);
      return null;
    }
  }

  private void processPushMessage(HashMap<String, String> pushMap) {
    Log.d(TAG, "Vibes push payload found. Attempting to emit to Javascript");
    Vibes.getInstance().onPushMessageOpened(pushMap, getApplicationContext());
    PushPayloadParser payload = new PushPayloadParser(pushMap);
    VibesPushReceiver.emitPayload(getApplicationContext(), payload);
  }
}
