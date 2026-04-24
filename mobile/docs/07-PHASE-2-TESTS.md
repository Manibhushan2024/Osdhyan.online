# Phase 2 — Tests & Test Series (Week 3–5)

**Goal:** Full test-taking engine — browse, start, attempt, submit, review results.

---

## Step 2.1 — Tests List Screen

```
Screen: TestsHomeScreen
API: GET /tests?page=1&exam_id={selectedExam}

Layout:
- Filter bar: Exam, Subject, Mode (chapter/subject/full_mock), Difficulty
- FlashList of TestCard components
- Each card: test name, subject, questions count, duration, difficulty badge, start button

TestCard:
- Name (bilingual)
- Subject chip + Mode chip
- Duration | Questions count | Marks per question
- Negative marking warning (if > 0)
- "Start Test" CTA button
```

---

## Step 2.2 — Test Detail Screen

```
Screen: TestDetailScreen
Route params: { testId }
API: GET /tests/{testId}
     GET /tests/{testId}/latest-attempt

Layout:
- Test name + subject + chapter breadcrumb
- Stats grid: Questions, Duration, Marks, Negative Marking
- Instructions (bullet list):
  • Each correct answer = +{question_mark} marks
  • Each wrong answer = -{negative_marking} marks (if applicable)
  • You can navigate between questions freely
  • Timer runs in background — don't leave the app
- Previous attempt results (if any)
- "Start Test" button → starts attempt OR shows "Resume" if in_progress
```

---

## Step 2.3 — Test Attempt Engine (Critical)

This is the most complex screen. Implement carefully.

```typescript
// src/screens/tests/TestAttemptScreen.tsx

// Route params: { attemptId, testId }
// API on mount: GET /attempts/{attemptId} → load questions + existing responses

// State:
interface AttemptState {
  questions: Question[];
  responses: Record<number, number>;  // questionId → optionId
  currentIndex: number;
  timeLeft: number;  // seconds
  isSubmitting: boolean;
  markedForReview: Set<number>;  // question indices marked for review
}

// Timer: countdown from test.duration_sec
// - Use setInterval (1 second tick)
// - Auto-submit when timeLeft reaches 0
// - Show warning toast at 5 minutes remaining
// - Persist responses locally in case of crash

// Auto-save: every 30 seconds
// POST /attempts/{id}/sync with all responses

// Navigation:
// - Question pager (swipe or button tap to go prev/next)
// - Question palette (grid of numbered boxes showing status)
//   - White: not visited
//   - Blue: answered
//   - Orange: marked for review
//   - Gray: visited but unanswered

// Question rendering:
// - Question text (bilingual based on language setting)
// - 4 option buttons (A/B/C/D)
// - Selected option highlighted in blue
// - Mark for review toggle button

// Header:
// - Back (with confirm dialog)
// - Question X/N
// - Timer (red when < 5 minutes)
// - Menu (question palette, submit)

// Submit flow:
// 1. Confirm dialog ("Are you sure? X questions unanswered")
// 2. POST /attempts/{id}/sync (final sync)
// 3. POST /attempts/{id}/complete
// 4. Navigate to TestResultScreen

// IMPORTANT: Hide bottom tab bar on this screen
// Use: navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })
// Restore on unmount
```

### Question Palette Component
```typescript
// Grid of square buttons (40x40 each)
// Colors:
// - Not visited: borderColor #1e1e2e, text white/30
// - Visited, no answer: bg #1e1e2e, text white/60
// - Answered: bg #3b82f6, text white
// - Marked for review: bg #f97316, text white

// Bottom summary:
// - Total | Answered | Unanswered | Marked
// - "Submit Test" button
```

---

## Step 2.4 — Test Result Screen

```
Screen: TestResultScreen
Route params: { attemptId }
API: POST /attempts/{id}/complete (already done) → result data
     OR: GET /attempts/{id} if navigating from history

Layout:
Section 1 — Score Card
- Score: X / Max (large display)
- Percentage with color coding (green ≥ 60%, orange 40-60%, red < 40%)
- Rank badge (if available)
- Time taken

Section 2 — Stats Grid (2x2)
- ✅ Correct: {count}
- ❌ Incorrect: {count}
- ⏭ Skipped: {count}
- ⏱ Avg time per Q: {sec}s

Section 3 — Topic-wise Breakdown
- Bar chart: accuracy per chapter/topic
- Use victory-native BarChart

Section 4 — Action buttons
- "Review Solutions" → TestSolutionsScreen
- "Retake Test" → start new attempt
- "Share Result" → expo-sharing

Section 5 — Top Performers (leaderboard)
- Top 3 rank cards (if API returns)
```

---

## Step 2.5 — Solutions / Review Screen

```
Screen: TestSolutionsScreen
Route params: { attemptId }

Shows all questions with:
- Question text
- All options
- User's selected option (highlighted)
- Correct option (green highlight)
- Explanation_en / explanation_hi
- Per-question marks earned/lost

Filter bar:
- All | Correct | Incorrect | Skipped | Marked for review

Performance indicator per question:
- ✅ +{marks} (correct)
- ❌ -{marks} (incorrect)
- ⏭ 0 (skipped)
```

---

## Step 2.6 — Test Series

### TestSeriesListScreen
```
API: GET /test-series
     GET /test-series/enrolled

Layout:
- "Enrolled" horizontal scroll (if any)
- All series list with:
  - Series name, exam, tests count, price (Free/₹XXX)
  - Enrolled badge or "Enroll" button
  - Progress bar (tests completed)
```

### TestSeriesDetailScreen
```
Route params: { seriesId }
API: GET /test-series/{id}

Layout:
- Series header: name, exam, description
- Enroll/Unenrolled CTA
- Tests list (locked or available based on enrollment)
- Each test row: name, duration, attempts count, best score
```

---

## Step 2.7 — Previous Year Questions (PYQ)

```
Screen: PYQScreen
Reuses TestsListScreen filtered by mode='full_mock' and a specific exam tag
Shows year-wise grouping
```

---

## Phase 2 Checklist

- [ ] TestsListScreen with filters (exam, subject, mode)
- [ ] TestCard component
- [ ] TestDetailScreen with instructions
- [ ] TestAttemptScreen (full attempt engine)
  - [ ] Timer with auto-submit
  - [ ] Question navigation (pager + palette)
  - [ ] Auto-save every 30 seconds
  - [ ] Mark for review
  - [ ] Submit confirmation dialog
  - [ ] Tab bar hidden during attempt
- [ ] TestResultScreen with charts
- [ ] TestSolutionsScreen with filtering
- [ ] TestSeriesListScreen
- [ ] TestSeriesDetailScreen with enroll/unenroll
- [ ] History screen (past attempts)

---

## Important Implementation Notes

### Offline Attempt Resilience
```typescript
// Save responses to AsyncStorage as backup
// Key: `attempt_${attemptId}_responses`
// On mount: merge saved responses with server responses
// On unmount: clear backup

import AsyncStorage from '@react-native-async-storage/async-storage';

const backupKey = `attempt_${attemptId}`;
await AsyncStorage.setItem(backupKey, JSON.stringify(responses));
```

### Timer Implementation
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        handleAutoSubmit();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

### Prevent Back Navigation During Test
```typescript
useEffect(() => {
  const unsubscribe = navigation.addListener('beforeRemove', (e) => {
    e.preventDefault();
    Alert.alert(
      'Leave Test?',
      'Your progress is saved. You can resume later.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Leave', onPress: () => navigation.dispatch(e.data.action) }
      ]
    );
  });
  return unsubscribe;
}, [navigation]);
```
