# Phase 6 — Build, Polish & Deployment (Week 13–14)

---

## Step 6.1 — Push Notifications

### Setup
```bash
npm install expo-notifications expo-device

# Register for Expo Push Notifications:
# OR use Firebase Cloud Messaging (FCM) for more control
```

### Implementation
```typescript
// src/utils/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save token to backend (add endpoint: POST /profile/push-token)
  await apiClient.post('/profile/push-token', { token });

  return token;
}

// Call on app start (after login):
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

### Notification Types to Implement
| Event | Trigger | Message |
|---|---|---|
| Live class starting | Teacher goes live | "Class is now LIVE! Join now 🔴" |
| Study reminder | Daily at user's set time | "Time to study! Your goal: X hours/day" |
| Test result | Attempt completed | "Your score: 75% — See detailed results" |
| Poll coin reward | Correct answer | "You earned 10 coins! Keep going 🪙" |

---

## Step 6.2 — Deep Linking

```typescript
// app.json
{
  "expo": {
    "scheme": "osdhyan",
    "android": { "intentFilters": [{ "action": "VIEW", "data": [{ "scheme": "https", "host": "osdhyan.com" }] }] },
    "ios": { "associatedDomains": ["applinks:osdhyan.com"] }
  }
}

// Supported deep links:
// osdhyan://tests/{id} → TestDetailScreen
// osdhyan://live/{id} → LiveClassDetailScreen
// osdhyan://test-series/{id} → TestSeriesDetailScreen
// https://osdhyan.com/tests/{id} → (universal link)
```

---

## Step 6.3 — EAS Build Configuration

```json
// eas.json
{
  "cli": { "version": ">= 7.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "aab" },
      "ios": {}
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-services.json",
        "track": "production"
      },
      "ios": {
        "appleId": "your@apple.id",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
      }
    }
  }
}
```

---

## Step 6.4 — app.json Configuration

```json
{
  "expo": {
    "name": "OSDHYAN",
    "slug": "osdhyan",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0a0a0f"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.osdhyan.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Camera access for live classes",
        "NSMicrophoneUsageDescription": "Microphone for live class audio",
        "NSPhotoLibraryUsageDescription": "Upload profile photo"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0a0a0f"
      },
      "package": "com.osdhyan.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA", "RECORD_AUDIO", "MODIFY_AUDIO_SETTINGS",
        "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      "expo-secure-store",
      "expo-notifications",
      ["expo-image-picker", { "photosPermission": "Upload profile photo" }],
      "react-native-webrtc"
    ]
  }
}
```

---

## Step 6.5 — Android Build & Play Store

### Build APK (for testing)
```bash
eas build --platform android --profile preview
# Downloads a .apk — install directly on device
```

### Build AAB (for Play Store)
```bash
eas build --platform android --profile production
# Downloads .aab — upload to Play Store
```

### Play Store Requirements
1. Create Google Play Developer Account ($25 one-time fee)
2. Create new app in Play Console
3. Complete store listing:
   - App name: OSDHYAN
   - Short description: "India's best exam preparation app"
   - Full description (4000 chars)
   - Screenshots: Phone (8 required), Tablet (optional)
   - Feature graphic: 1024×500px
   - App icon: 512×512px
4. Content rating questionnaire (Education → no sensitive content)
5. Privacy policy URL (required)
6. Upload AAB to Production track
7. Submit for review (2–7 days)

### Submit via EAS
```bash
eas submit --platform android --profile production
```

---

## Step 6.6 — iOS Build & App Store

### Build for Simulator (dev only)
```bash
eas build --platform ios --profile development
```

### Build for App Store
```bash
eas build --platform ios --profile production
```

### App Store Requirements
1. Apple Developer Account ($99/year)
2. Create App ID in Apple Developer portal
3. Create app in App Store Connect
4. Store listing:
   - App name: OSDHYAN
   - Subtitle: "Exam Prep | SSC, UPSC & More"
   - Description (4000 chars)
   - Keywords (100 chars)
   - Screenshots: 6.5" (required), 5.5" (optional), iPad (optional)
   - App icon: 1024×1024px
5. Age rating (4+)
6. Privacy policy URL (required)
7. Upload IPA via EAS Submit or Transporter

### Submit via EAS
```bash
eas submit --platform ios --profile production
```

---

## Step 6.7 — Performance Checklist

### List Performance
- [ ] Use `@shopify/flash-list` instead of `FlatList` for all long lists
- [ ] Implement pagination (cursor or page-based) on all lists
- [ ] Use `React.memo()` on list item components
- [ ] Image caching with `expo-image` (instead of `Image`)

### Network
- [ ] React Query caching (staleTime: 5 minutes for most queries)
- [ ] Optimistic updates for votes, hand raises
- [ ] Offline graceful degradation (show cached data, disable write actions)

### App Size
- [ ] Enable Hermes JavaScript engine (default in Expo SDK 50+)
- [ ] Strip unused icons from vector icon fonts
- [ ] Enable tree shaking for production builds

### Animations
- [ ] All animations on UI thread (useSharedValue + useAnimatedStyle)
- [ ] No `setNativeProps` — use Reanimated v3

---

## Step 6.8 — Required Assets (Provide to Team)

| Asset | Size | Format |
|---|---|---|
| App Icon | 1024×1024 | PNG (no alpha) |
| Adaptive Icon Foreground | 1024×1024 | PNG (with alpha) |
| Splash Screen | 1242×2436 | PNG |
| Feature Graphic (Play Store) | 1024×500 | JPG/PNG |
| Screenshots (Android Phone) | 1080×1920 | PNG/JPG × 8 |
| Screenshots (iPhone 6.5") | 1284×2778 | PNG/JPG × 8 |
| Privacy Policy URL | — | Live web page |

---

## Final Delivery Checklist

### Before Submission
- [ ] All API endpoints tested on real device
- [ ] Offline behavior tested (airplane mode)
- [ ] Both English and Hindi content displays correctly
- [ ] App tested on Android 10+ and iOS 14+
- [ ] App tested on small screens (5") and large screens (6.7")
- [ ] Push notifications tested on real device
- [ ] Deep links tested
- [ ] No console errors or warnings in production build
- [ ] Privacy policy live at a public URL
- [ ] App icon and splash screen assets provided
- [ ] Store screenshots captured on required device sizes
- [ ] Signed APK/AAB + IPA built with production credentials

### Version 1.0 Feature Scope Confirmed
- [ ] Phase 1: Auth + Home
- [ ] Phase 2: Tests + Test Series
- [ ] Phase 3: Courses + Materials + Notes
- [ ] Phase 4: Live Classes (view-only) + Recordings
- [ ] Phase 5: Goals + Pomodoro + Analytics + Profile
- [ ] Phase 6: Push Notifications + Store Submission
