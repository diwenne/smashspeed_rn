// android/app/src/main/java/com/smashspeed/VideoTrimmerPackage.kt

package com.smashspeed // <-- IMPORTANT: Change "smashspeed" to your actual package name

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import java.util.Collections

class VideoTrimmerPackage : ReactPackage {
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return Collections.emptyList()
    }

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        // Add your module to the list of native modules
        return listOf(VideoTrimmerModule(reactContext))
    }
}