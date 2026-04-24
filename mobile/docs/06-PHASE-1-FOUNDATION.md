# Phase 1 — Foundation (Week 1–2)

**Goal:** Running app with auth, navigation shell, home screen, and design system established.

---

## Step 1.1 — Initialize Project

```bash
npx create-expo-app@latest osdhyan-mobile --template expo-template-blank-typescript
cd osdhyan-mobile
npm install [all dependencies from 01-SETUP.md]
```

Create folder structure as defined in `02-ARCHITECTURE.md`.

---

## Step 1.2 — Design System

Create these files:
- `src/utils/colors.ts` — color palette (from `03-DESIGN-SYSTEM.md`)
- `src/utils/typography.ts` — font styles
- `src/utils/spacing.ts` — spacing scale
- `src/utils/helpers.ts` — formatTime, formatDate, truncate

Create base components in `src/components/ui/`:

| Component | File | Description |
|---|---|---|
| Button | `Button.tsx` | Primary, secondary, danger, ghost variants |
| Card | `Card.tsx` | Touchable/static dark card container |
| Badge | `Badge.tsx` | Status/category pill |
| ProgressBar | `ProgressBar.tsx` | Horizontal progress |
| Avatar | `Avatar.tsx` | Image + initials fallback |
| EmptyState | `EmptyState.tsx` | Icon + text for empty lists |
| LoadingSpinner | `LoadingSpinner.tsx` | Centered spinner |
| Skeleton | `Skeleton.tsx` | Shimmer placeholder |
| CoinBadge | `CoinBadge.tsx` | Amber coin count |
| Input | `Input.tsx` | Styled text input |
| ScreenHeader | `ScreenHeader.tsx` | Title + back button + right action |

---

## Step 1.3 — Zustand Stores

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../api/client';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,

  hydrate: async () => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      try {
        const res = await apiClient.get('/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        set({ user: res.data, token, isHydrated: true });
      } catch {
        await SecureStore.deleteItemAsync('auth_token');
        set({ isHydrated: true });
      }
    } else {
      set({ isHydrated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    const res = await apiClient.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('auth_token', res.data.token);
    set({ user: res.data.user, token: res.data.token, isLoading: false });
  },

  logout: async () => {
    await apiClient.post('/auth/logout').catch(() => {});
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: null, token: null });
  },

  register: async (data) => {
    set({ isLoading: true });
    const res = await apiClient.post('/auth/register', data);
    await SecureStore.setItemAsync('auth_token', res.data.token);
    set({ user: res.data.user, token: res.data.token, isLoading: false });
  },
}));
```

---

## Step 1.4 — Navigation Setup

```typescript
// src/navigation/index.tsx
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/SplashScreen';

export default function RootNavigator() {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) return <SplashScreen />;

  return (
    <NavigationContainer theme={DarkTheme}>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
```

```typescript
// src/navigation/AuthNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OtpVerify" component={OtpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}
```

```typescript
// src/navigation/MainNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeNavigator from './HomeNavigator';
import TestsNavigator from './TestsNavigator';
import LearnNavigator from './LearnNavigator';
import LiveNavigator from './LiveNavigator';
import ProfileNavigator from './ProfileNavigator';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111118',
          borderTopColor: '#1e1e2e',
          height: 64,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'rgba(248,250,252,0.3)',
        tabBarLabelStyle: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="TestsTab" component={TestsNavigator} options={{ title: 'Tests' }} />
      <Tab.Screen name="LearnTab" component={LearnNavigator} options={{ title: 'Learn' }} />
      <Tab.Screen name="LiveTab" component={LiveNavigator} options={{ title: 'Live' }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
```

---

## Step 1.5 — Splash Screen

```typescript
// src/screens/SplashScreen.tsx
// Show app logo centered on dark background while auth hydrates
// Animate with Reanimated: fade in logo, pulse, then fade out

import Animated, { useSharedValue, withTiming, withRepeat } from 'react-native-reanimated';

export default function SplashScreen() {
  // Render: centered logo + "OSDHYAN" text + loading indicator
  // Auto-dismisses when isHydrated becomes true
}
```

---

## Step 1.6 — Auth Screens

### LoginScreen
- Email input + Password input
- "Login" button → calls `authStore.login()`
- Error toast on failure
- Link to Register
- Link to Forgot Password

### RegisterScreen
- Name, Email, Phone, Password, Confirm Password
- "Create Account" button → calls `authStore.register()`
- Link back to Login

### OtpVerifyScreen
- Phone number input → "Send OTP"
- 6-digit OTP input → "Verify"
- Resend countdown timer (60 seconds)
- API: `POST /auth/send-otp` then `POST /auth/verify-otp`

### ForgotPasswordScreen
- Email input → "Send Reset Link"
- API: `POST /auth/forgot-password`

---

## Step 1.7 — Home Screen

```typescript
// src/screens/home/HomeScreen.tsx

// API calls:
// GET /exams → exam selector
// GET /analytics/overview → stats
// GET /test-series → featured series
// GET /live-classes?status=live → active live classes

// Layout:
// - Header: OSDHYAN logo + coin balance + notification bell
// - Exam selector (horizontal scroll of exam cards)
// - Stats row: accuracy%, tests done, study streak
// - Featured test series (horizontal scroll)
// - Live NOW section (if any classes are live)
// - Quick actions: Start Practice, Browse Courses
```

---

## Phase 1 Checklist

- [ ] Project initialized with all dependencies
- [ ] `.env` configured with API URL
- [ ] Design system files created (colors, typography, spacing)
- [ ] All base UI components built
- [ ] Axios client with token interceptor
- [ ] Zustand auth store with hydration
- [ ] Root navigator switching between Auth/Main
- [ ] Bottom tab navigator with 5 tabs
- [ ] Splash screen with animation
- [ ] Login screen (functional)
- [ ] Register screen (functional)
- [ ] OTP screen (functional)
- [ ] Forgot password screen (functional)
- [ ] Home screen with exam selector, stats, featured content
- [ ] Toast notifications working
- [ ] Language toggle (EN/HI) wired up
