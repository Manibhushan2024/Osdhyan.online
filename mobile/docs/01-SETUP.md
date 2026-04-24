# Phase 0 — Development Environment Setup

## Prerequisites

### Machine Requirements
| Tool | Version | Install |
|---|---|---|
| Node.js | 20 LTS | https://nodejs.org |
| npm | 10+ | bundled with Node |
| Git | 2.x | https://git-scm.com |
| Expo CLI | latest | `npm install -g expo-cli` |
| EAS CLI | latest | `npm install -g eas-cli` |
| Android Studio | Hedgehog+ | https://developer.android.com/studio |
| Xcode | 15+ (Mac only) | Mac App Store |
| Java JDK | 17 | https://adoptium.net |

### Android Studio Setup
1. Install Android Studio
2. SDK Manager → Install **Android 14 (API 34)** and **Android 13 (API 33)**
3. AVD Manager → Create emulator: **Pixel 7, API 34**
4. Add to `~/.bashrc` or `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### iOS Setup (Mac only)
1. Install Xcode from Mac App Store
2. Install Command Line Tools: `xcode-select --install`
3. Install CocoaPods: `sudo gem install cocoapods`
4. Open Xcode once to accept the license agreement

---

## Project Initialization

```bash
# Create the Expo project
npx create-expo-app@latest osdhyan-mobile --template expo-template-blank-typescript

cd osdhyan-mobile

# Install all dependencies
npm install \
  @react-navigation/native \
  @react-navigation/bottom-tabs \
  @react-navigation/stack \
  @tanstack/react-query \
  axios \
  zustand \
  @react-native-async-storage/async-storage \
  react-native-safe-area-context \
  react-native-screens \
  react-native-gesture-handler \
  react-native-reanimated \
  react-native-svg \
  @shopify/flash-list \
  react-native-toast-message \
  expo-secure-store \
  expo-linear-gradient \
  expo-haptics \
  expo-notifications \
  expo-av \
  expo-document-picker \
  expo-image-picker \
  expo-linking \
  expo-constants \
  expo-status-bar \
  victory-native

# Install WebRTC (requires custom dev client)
npm install react-native-webrtc

# Install dev dependencies
npm install -D @types/react @types/react-native typescript
```

---

## Environment Configuration

Create `.env` in the project root:

```bash
# API
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api

# App
EXPO_PUBLIC_APP_NAME=OSDHYAN
EXPO_PUBLIC_APP_VERSION=1.0.0

# Features
EXPO_PUBLIC_ENABLE_WEBRTC=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
```

> **Important:** Replace `192.168.1.100` with your dev machine's **LAN IP address**.  
> Find it with: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)  
> `localhost` will NOT work on physical devices or emulators.

---

## Project Structure

```
osdhyan-mobile/
├── app/                          # Expo Router pages (if using Expo Router)
│   OR
├── src/
│   ├── api/
│   │   ├── client.ts             # Axios instance + interceptors
│   │   ├── auth.ts               # Auth API calls
│   │   ├── tests.ts              # Test API calls
│   │   ├── liveClasses.ts        # Live class API calls
│   │   └── ...
│   ├── components/
│   │   ├── ui/                   # Base components (Button, Input, Card, etc.)
│   │   ├── auth/                 # Auth-specific components
│   │   ├── test/                 # Test/quiz components
│   │   ├── live/                 # Live class components
│   │   └── ...
│   ├── navigation/
│   │   ├── index.tsx             # Root navigator
│   │   ├── AuthNavigator.tsx     # Unauthenticated stack
│   │   ├── MainNavigator.tsx     # Authenticated tab + stack
│   │   └── types.ts              # Navigation param types
│   ├── screens/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── tests/
│   │   ├── testSeries/
│   │   ├── courses/
│   │   ├── live/
│   │   ├── productivity/
│   │   ├── analytics/
│   │   └── profile/
│   ├── store/
│   │   ├── authStore.ts          # Zustand: user, token, isLoading
│   │   ├── settingsStore.ts      # Zustand: language, theme
│   │   └── pomodoroStore.ts      # Zustand: timer state
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTests.ts
│   │   └── ...
│   ├── utils/
│   │   ├── colors.ts             # Design tokens
│   │   ├── typography.ts         # Font styles
│   │   ├── helpers.ts            # Formatting utilities
│   │   └── constants.ts
│   └── types/
│       ├── api.ts                # API response types
│       └── navigation.ts         # Navigation types
├── assets/
│   ├── fonts/
│   ├── images/
│   └── icons/
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
├── .env
└── package.json
```

---

## Axios Client Setup

```typescript
// src/api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Auto-attach auth token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — clear token and navigate to login
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      // Trigger navigation to auth — use a navigation ref
    }
    return Promise.reject(error);
  }
);
```

---

## Custom Dev Client (Required for WebRTC)

Expo Go does NOT support `react-native-webrtc`. A custom dev client is required.

```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Build custom dev client for Android
eas build --profile development --platform android

# Build custom dev client for iOS
eas build --profile development --platform ios

# Run with custom dev client
npx expo start --dev-client
```

For development without live classes, you can use Expo Go for all other features.

---

## Running the App

```bash
# Start Metro bundler
npx expo start

# Options:
# Press 'a' → Open on Android emulator
# Press 'i' → Open on iOS simulator  
# Scan QR code → Open on physical device (Expo Go)
# Press 's' → Switch to custom dev client
```
