# Sahayya

A React Native application for household staff management — manage staff, salaries, attendance, leave, and more.

## Download APK

> **Want to test the app?** Download the latest production APK directly:

[![Download Latest APK](https://img.shields.io/github/v/release/Aftab-web-dev/sahayyamain?label=Download%20APK&logo=android&color=3DDC84)](https://github.com/Aftab-web-dev/sahayyamain/releases/latest)

**[>> Download Latest Production APK <<](https://github.com/Aftab-web-dev/sahayyamain/releases/latest)**

### How to install
1. Download the `.apk` file from the latest release above
2. On your Android device, go to **Settings > Security > Install unknown apps** and allow your browser
3. Open the downloaded APK and tap **Install**
4. Open the app and get started

---

## Getting Started (Development)

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Prerequisites
- Node.js >= 18
- React Native CLI
- Android Studio / Xcode

### Step 1: Install dependencies

```sh
npm install
```

### Step 2: Start Metro

```sh
npm start
```

### Step 3: Build and run

#### Android

```sh
npm run android
```

#### iOS

```sh
bundle install
bundle exec pod install
npm run ios
```

## Build Production APK

To generate a production release APK:

```sh
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

To create a new GitHub release with the APK:

```sh
gh release create v1.0.0 android/app/build/outputs/apk/release/app-release.apk --title "v1.0.0" --notes "Release notes here"
```

## Tech Stack

- React Native
- React Navigation v7
- Redux + Redux Persist
- Axios
- Firebase Cloud Messaging
- Razorpay Payment Gateway

## Troubleshooting

If you're having issues, see the [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.
