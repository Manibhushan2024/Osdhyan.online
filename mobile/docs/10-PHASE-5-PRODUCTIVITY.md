# Phase 5 — Productivity: Goals, Pomodoro, Analytics, Profile (Week 11–12)

---

## Step 5.1 — Study Goals Screen

```
Screen: StudyGoalsScreen
API: GET /study-goals
     GET /exams → for the add-goal modal

Layout:
- Stats row: Active goals count, avg completion %, total hours logged
- Goal cards (FlashList):
  - Subject/Chapter/Topic name
  - Circular progress ring (react-native-svg)
  - Spent hours vs Target hours
  - Remaining hours
  - Delete button (swipe or long press)
- FAB → Add Goal bottom sheet

Add Goal Bottom Sheet:
1. Exam picker
2. Subject picker (loads after exam selected)
3. Chapter picker (optional, loads after subject)
4. Topic picker (optional, loads after chapter)
5. Target Hours:
   - Preset chips: 10h, 20h, 30h, 50h, 75h, 100h
   - Custom input with +/- stepper
6. "Save Goal" button → POST /study-goals
```

### Circular Progress Ring (SVG)
```typescript
import Svg, { Circle } from 'react-native-svg';

const CircularProgress = ({ progress, size = 80, strokeWidth = 6, color = '#3b82f6' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <Svg width={size} height={size}>
      {/* Background track */}
      <Circle cx={size/2} cy={size/2} r={radius}
        fill="none" stroke="#1e1e2e" strokeWidth={strokeWidth} />
      {/* Progress */}
      <Circle cx={size/2} cy={size/2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
    </Svg>
  );
};
```

---

## Step 5.2 — Pomodoro Focus Timer

```
Screen: FocusTimerScreen

Layout:
- Top: Mode selector tabs (Focus | Short Break | Long Break)
         with actual configured times shown (e.g., "25:00", "5:00", "15:00")
- Center: Large circular timer ring (SVG, same as above)
         Time display: "24:59" in bold
         Mode label: "Deep Focus"
- Bottom: Pomodoro dots (4 dots, filled = completed in current cycle)
         Reset | Play/Pause | Cycle counter
- Settings gear icon → Timer Settings bottom sheet

Timer Settings Bottom Sheet:
- 4 preset cards: Classic (25/5/15), Short (15/3/10), Long (50/10/30), Ultra (90/20/30)
- Custom steppers: Focus session (1-120 min), Short break (1-60), Long break (1-60)
- Apply button → saves to AsyncStorage

Task Tree (collapsible side panel OR bottom sheet):
- Subjects → Chapters → Topics → Tasks (hierarchical)
- Each task: checkbox + title + allocated minutes + 🍅 count
- Select task → links timer session to task
- Add Subject / Chapter / Topic / Task buttons

Session Log (right panel or bottom sheet):
- List of completed sessions: task name + duration
- Today's total focus time
- Subject progress bars
```

### Timer Implementation
```typescript
// src/store/pomodoroStore.ts — use Zustand for timer state
// Use AppState to detect background/foreground:

import { AppState } from 'react-native';

// When app goes to background: save backgrounded timestamp
// When app comes back: calculate elapsed time and update timer
// This prevents timer freeze when app is backgrounded

AppState.addEventListener('change', (state) => {
  if (state === 'background') {
    backgroundedAt.current = Date.now();
  } else if (state === 'active' && backgroundedAt.current) {
    const elapsed = Math.floor((Date.now() - backgroundedAt.current) / 1000);
    setTimeLeft(prev => Math.max(0, prev - elapsed));
    backgroundedAt.current = null;
  }
});
```

---

## Step 5.3 — Analytics Screen

```
Screen: AnalyticsScreen
API: GET /analytics/overview
     GET /analytics/topics

Layout:
Section 1 — Overview stats (grid of 4):
- Overall Accuracy: {pct}%
- Tests Completed: {count}
- Total Study Time: {hours}h {min}m
- 🔥 Streak: {days} days

Section 2 — Accuracy Chart
- Horizontal bar chart (victory-native)
- Topic-wise accuracy (color coded: green ≥70%, orange 40-70%, red <40%)
- Scroll if many topics

Section 3 — Weak Areas
- Topics with accuracy < 50%
- "Practice Now" button per topic → filtered test list

Section 4 — Progress Over Time
- Line chart: accuracy trend over last 7/30 days
- (Use attempt history data)

Section 5 — Achievements
- API: GET /achievements
- Earned achievements (colored)
- Locked achievements (gray silhouette)
```

---

## Step 5.4 — Profile Screen

```
Screen: ProfileScreen
API: GET /user

Layout:
- Avatar (large, tappable to change via expo-image-picker)
- Name + email + phone
- Exam target badge (e.g., "SSC CGL 2026")
- Stats row: Coins | Rank | Tests Done | Streak
- Quick links:
  - Study Goals
  - Achievements
  - Test History
  - Notes
  - Support
  - Settings
- Edit Profile button
- Logout button (with confirmation)

EditProfileScreen:
- Name input
- Phone input
- Avatar picker (expo-image-picker → POST /profile multipart)
- Save button
```

---

## Step 5.5 — Settings Screen

```
Screen: SettingsScreen

Sections:
1. Preferences
   - Language: [English] [हिंदी]
   - Theme: [Dark] [Light] [System]
   - Default Exam picker

2. Notifications
   - Push notification toggle
   - Study reminder time picker (e.g., 8:00 PM daily)

3. Account
   - Change Password → ChangePasswordScreen
   - Delete Account (destructive, with double confirmation)

4. About
   - App version
   - Privacy Policy (opens WebView)
   - Terms of Service (opens WebView)
   - Rate the App (expo-store-review)
```

---

## Step 5.6 — Test History Screen

```
Screen: HistoryScreen
API: GET /analytics/overview (for summary)
     Use local attempt data stored in React Query cache

Layout:
- Summary: Total attempts, avg score, best score
- Grouped by date (Today, Yesterday, This Week, Earlier)
- HistoryCard: test name + score + time + date
- Tap → TestResultScreen (re-display)
```

---

## Phase 5 Checklist

- [ ] StudyGoalsScreen with circular progress rings
- [ ] Add Goal bottom sheet (exam → subject → chapter → topic → hours)
- [ ] FocusTimerScreen with configurable timer
- [ ] Timer persists through app background (AppState handling)
- [ ] Timer settings bottom sheet with presets
- [ ] Task tree (subjects → tasks) in Pomodoro screen
- [ ] Session log with today's focus stats
- [ ] AnalyticsScreen with charts
- [ ] Topic-wise accuracy chart (victory-native)
- [ ] ProfileScreen with editable fields
- [ ] Avatar image picker and upload
- [ ] SettingsScreen (language, theme, notifications)
- [ ] HistoryScreen with grouped attempts
- [ ] CoinBadge shown in profile header
