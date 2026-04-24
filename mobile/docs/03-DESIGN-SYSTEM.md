# Design System

The mobile app follows the same visual identity as the web app: **high-contrast, bold typography, dark-first design** with a blue accent palette.

---

## Color Palette

```typescript
// src/utils/colors.ts

export const Colors = {
  // Backgrounds
  background: '#0a0a0f',        // App background (near-black)
  cardBg: '#111118',            // Card surfaces
  inputBg: '#15151e',           // Input fields
  borderColor: '#1e1e2e',       // Borders

  // Primary accent
  blue: '#3b82f6',              // Primary blue (Tailwind blue-500)
  blueLight: '#60a5fa',         // Lighter blue
  blueDark: '#1d4ed8',          // Darker blue
  blueMuted: 'rgba(59,130,246,0.1)', // Transparent blue

  // Semantic colors
  red: '#ef4444',               // Error, LIVE badge
  green: '#22c55e',             // Success, correct answer
  orange: '#f97316',            // Warning, pending
  purple: '#a855f7',            // Long break (pomodoro)
  amber: '#f59e0b',             // Coins, highlights

  // Text
  textPrimary: '#f8fafc',       // Main text
  textSecondary: 'rgba(248,250,252,0.6)', // Subdued text
  textMuted: 'rgba(248,250,252,0.3)',     // Very faint text

  // Gradients
  gradientBlue: ['#3b82f6', '#1d4ed8'],
  gradientDark: ['#111118', '#0a0a0f'],

  // Special
  correct: '#22c55e',
  incorrect: '#ef4444',
  coinGold: '#f59e0b',
};

// Dark theme (primary)
export const DarkTheme = {
  dark: true,
  colors: {
    primary: Colors.blue,
    background: Colors.background,
    card: Colors.cardBg,
    text: Colors.textPrimary,
    border: Colors.borderColor,
    notification: Colors.blue,
  },
};
```

---

## Typography

```typescript
// src/utils/typography.ts

// Fonts: Use 'Inter' from expo-font, or system font
// The web app uses system-ui; use SF Pro (iOS) / Roboto (Android) as fallbacks

export const Typography = {
  // Display — page titles
  display: {
    fontSize: 28,
    fontWeight: '900' as const,
    letterSpacing: -0.5,
    textTransform: 'uppercase' as const,
    fontStyle: 'italic' as const,
  },
  // Heading — section titles
  heading: {
    fontSize: 20,
    fontWeight: '900' as const,
    letterSpacing: -0.3,
  },
  // Subheading
  subheading: {
    fontSize: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  // Body
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  // Small label
  label: {
    fontSize: 10,
    fontWeight: '900' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  // Badge text
  badge: {
    fontSize: 9,
    fontWeight: '900' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  // Code / monospace
  mono: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
};
```

---

## Spacing Scale

```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};
```

---

## Border Radius

```typescript
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
};
```

---

## Base Components

### Button
```typescript
// Primary: Blue filled
// Secondary: Ghost with border
// Danger: Red filled
// Props: title, onPress, variant, loading, disabled, size

<Button
  title="Start Test"
  variant="primary"   // 'primary' | 'secondary' | 'danger' | 'ghost'
  size="lg"           // 'sm' | 'md' | 'lg'
  loading={false}
  onPress={() => {}}
/>
```

### Card
```typescript
// Rounded container with dark background and subtle border
// Props: children, style, onPress (makes it touchable)

<Card style={{ padding: 16 }}>
  <Text>Content</Text>
</Card>
```

### Badge
```typescript
// Small tag for status labels
// Colors: blue, green, red, orange, amber, purple

<Badge label="LIVE" color="red" pulse />
<Badge label="Easy" color="green" />
<Badge label="50 coins" color="amber" icon="coin" />
```

### ProgressBar
```typescript
// Horizontal progress indicator
// Props: progress (0-100), color, height, animated

<ProgressBar progress={72} color={Colors.blue} height={4} animated />
```

### Avatar
```typescript
// User avatar with fallback initials
// Props: uri, name, size

<Avatar uri={user.avatar} name={user.name} size={40} />
```

### CoinBadge
```typescript
// Amber coin indicator shown in headers
// Props: count

<CoinBadge count={user.coins} />
```

---

## Screen Layout Pattern

Every screen should follow this structure:

```typescript
import { SafeAreaView, ScrollView, View, Text } from 'react-native';
import { Colors, Spacing } from '../utils';

export default function ExampleScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={{ paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg }}>
        <Text style={[Typography.display, { color: Colors.textPrimary }]}>
          PAGE TITLE
        </Text>
        <Text style={[Typography.label, { color: Colors.textMuted }]}>
          Subtitle
        </Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: Spacing.xl, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* content */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## Loading States

```typescript
// Full-screen loader
<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
  <ActivityIndicator size="large" color={Colors.blue} />
</View>

// Skeleton loader (use react-native-skeleton-content)
// Show for lists while data loads

// Empty state
<View style={{ alignItems: 'center', paddingVertical: 48 }}>
  <Icon name="inbox" size={40} color={Colors.textMuted} />
  <Text style={{ color: Colors.textMuted, marginTop: 8 }}>No items yet</Text>
</View>
```

---

## Tab Bar Design

```typescript
// Bottom tab bar: dark background, blue active indicator
// Icons: use react-native-vector-icons (Feather set) or expo/vector-icons

const tabBarStyle = {
  backgroundColor: Colors.cardBg,
  borderTopColor: Colors.borderColor,
  borderTopWidth: 1,
  height: 64,
  paddingBottom: 8,
};
```

Tabs (5):
1. **Home** — LayoutDashboard icon
2. **Tests** — ClipboardCheck icon  
3. **Learn** — BookOpen icon
4. **Live** — Video icon (red LIVE badge when class active)
5. **Profile** — User icon

---

## Difficulty Color Coding

```typescript
export const DifficultyColors = {
  easy: Colors.green,
  medium: Colors.amber,
  hard: Colors.red,
};

export const DifficultyLabels = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};
```
