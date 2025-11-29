---
description: How to build an installable APK for Android
---

# Building an APK

To generate an installable APK for your Android device, we will use EAS Build (Expo Application Services).

## Prerequisites

1.  **EAS CLI**: You need the EAS CLI installed globally.
    ```bash
    npm install -g eas-cli
    ```

2.  **Expo Account**: You need an Expo account. If you don't have one, sign up at [expo.dev](https://expo.dev).
    ```bash
    eas login
    ```

## Configuration

1.  **Configure EAS**: Run the following command to create an `eas.json` config file.
    ```bash
    eas build:configure
    ```
    *   Select `Android` when prompted.

2.  **Update `eas.json`**: Modify `eas.json` to support APK generation (instead of just App Bundle for Play Store). Add a `preview` profile.

    ```json
    {
      "build": {
        "preview": {
          "android": {
            "buildType": "apk"
          }
        },
        "production": {}
      }
    }
    ```

## Building

1.  **Run the Build**: Execute the build command using the `preview` profile.
    ```bash
    eas build -p android --profile preview
    ```

2.  **Wait**: The build will run in the cloud. This can take 10-20 minutes.

3.  **Download**: Once finished, EAS will provide a link to download the `.apk` file. You can install this directly on your Android device.

## Alternative: Local Build (Advanced)

If you have Android Studio and the Android SDK configured on your machine:

1.  **Prebuild**: Generate the native Android project.
    ```bash
    npx expo prebuild
    ```

2.  **Build**: Run the Android build command.
    ```bash
    npx expo run:android --variant release
    ```
    *   The APK will be located in `android/app/build/outputs/apk/release/app-release.apk`.
