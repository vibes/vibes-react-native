package com.vibes.push.test.rn;

import com.facebook.react.ReactActivity;
import com.vibes.vibes.Vibes;
import com.vibes.vibes.PushPayloadParser;
import com.vibes.push.rn.plugin.notifications.VibesPushReceiver;
import android.util.Log;
import android.os.Bundle;
import java.util.HashMap;
import android.os.Build;

public class MainActivity extends ReactActivity {

  public static final String TAG = "VibesRN";

  /**
   * Returns the name of the main component registered from JavaScript. This is
   * used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "VibesExample";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      Log.d(TAG, "Checking if Vibes push message exists in intent");
      HashMap<String, String> pushMap = (HashMap<String, String>) getIntent()
          .getSerializableExtra(Vibes.VIBES_REMOTE_MESSAGE_DATA);
      if (pushMap != null) {
        Log.d(TAG, "Vibes push payload found. Attempting to emit to Javascript");
        // this is for tracking which push messages have been opened by the user
        Vibes.getInstance().onPushMessageOpened(pushMap, this.getApplicationContext());
        PushPayloadParser payload = new PushPayloadParser(pushMap);
        VibesPushReceiver.emitPayload(this.getApplicationContext(), payload);
      } else {
        Log.d(TAG, "No push received");
      }
    }
  }
}
