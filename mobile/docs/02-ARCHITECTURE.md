# App Architecture

## Navigation Structure

```
RootNavigator
├── AuthNavigator (Stack) — shown when NOT logged in
│   ├── SplashScreen
│   ├── OnboardingScreen
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── OtpVerifyScreen
│   └── ForgotPasswordScreen
│
└── MainNavigator (Bottom Tabs) — shown when logged in
    ├── Tab: Home
    │   └── HomeScreen
    │       └── (Stack) ExamDetailScreen
    │
    ├── Tab: Tests
    │   ├── TestsHomeScreen
    │   │   ├── TestDetailScreen
    │   │   ├── TestAttemptScreen  ← Full-screen, hides tabs
    │   │   └── TestResultScreen
    │   ├── TestSeriesListScreen
    │   │   ├── TestSeriesDetailScreen
    │   │   └── → TestAttemptScreen (shared)
    │   └── PYQScreen (Previous Year Questions)
    │
    ├── Tab: Learn
    │   ├── CoursesScreen
    │   │   ├── SubjectScreen
    │   │   │   └── ChapterScreen
    │   │   │       └── TopicScreen
    │   │   │           └── MaterialDetailScreen
    │   ├── SyllabusScreen
    │   ├── MaterialsScreen
    │   └── BlogsScreen
    │       └── BlogDetailScreen
    │
    ├── Tab: Live
    │   ├── LiveClassListScreen
    │   │   ├── LiveClassDetailScreen (pre-join)
    │   │   └── LiveClassRoomScreen  ← Full-screen, hides tabs
    │   └── PastRecordingsScreen
    │
    └── Tab: Profile
        ├── ProfileScreen
        ├── AnalyticsScreen
        ├── StudyGoalsScreen
        ├── FocusTimerScreen
        ├── NotesScreen
        ├── HistoryScreen (test history)
        ├── AchievementsScreen
        └── SettingsScreen
```

---

## State Management

### Zustand Stores

#### authStore
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;   // Load token from SecureStore on app start
  updateUser: (user: Partial<User>) => void;
}
```

#### settingsStore
```typescript
interface SettingsStore {
  language: 'en' | 'hi';
  theme: 'dark' | 'light' | 'system';
  selectedExamId: number | null;

  setLanguage: (lang: 'en' | 'hi') => void;
  setTheme: (theme: string) => void;
  setSelectedExam: (id: number) => void;
}
```

#### pomodoroStore
```typescript
interface PomodoroStore {
  mode: 'focus' | 'short_break' | 'long_break';
  timeLeft: number;
  isRunning: boolean;
  pomodoroCount: number;
  durations: { focus: number; short_break: number; long_break: number };

  start: () => void;
  pause: () => void;
  reset: () => void;
  switchMode: (mode: PomodoroMode) => void;
  tick: () => void;
}
```

---

## React Query Setup

```typescript
// src/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 minutes
      gcTime: 1000 * 60 * 30,      // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,  // Mobile: no window focus
    },
  },
});
```

### Query Key Conventions
```typescript
// Use arrays for query keys
['tests']                          // all tests
['tests', testId]                  // single test
['tests', testId, 'attempts']      // test attempts
['live-classes', { status: 'live' }]
['study-goals']
['profile']
```

---

## Type Definitions

```typescript
// src/types/api.ts

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
  coins: number;
  total_study_time_prod_sec: number;
}

export interface Exam {
  id: number;
  code: string;
  name_en: string;
  name_hi: string;
  is_published: boolean;
}

export interface Subject {
  id: number;
  exam_id: number;
  code: string;
  name_en: string;
  name_hi: string;
  category: string;
}

export interface Chapter {
  id: number;
  subject_id: number;
  code: string;
  name_en: string;
  name_hi: string;
}

export interface Topic {
  id: number;
  chapter_id: number;
  code: string;
  name_en: string;
  name_hi: string;
}

export interface Test {
  id: number;
  exam_id: number;
  subject_id: number;
  chapter_id: number;
  topic_id: number;
  name_en: string;
  name_hi: string;
  duration_sec: number;
  total_marks: number;
  question_mark: number;
  negative_marking: number;
  mode: 'chapter' | 'subject' | 'full_mock';
  status: 'draft' | 'published';
  questions_count: number;
}

export interface TestAttempt {
  id: number;
  test_id: number;
  user_id: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at?: string;
  score?: number;
  max_score?: number;
  time_spent_sec?: number;
  correct_count?: number;
  incorrect_count?: number;
  skipped_count?: number;
}

export interface Question {
  id: number;
  question_en: string;
  question_hi: string;
  explanation_en?: string;
  explanation_hi?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: QuestionOption[];
}

export interface QuestionOption {
  id: number;
  option_en: string;
  option_hi: string;
  is_correct?: boolean;  // only shown after completion
}

export interface TestSeries {
  id: number;
  name_en: string;
  name_hi: string;
  description_en: string;
  price: number;
  tests_count: number;
  enrolled: boolean;
}

export interface LiveClass {
  id: number;
  title: string;
  description: string;
  subject: string;
  status: 'scheduled' | 'live' | 'ended';
  teacher: { id: number; name: string; avatar?: string };
  chat_enabled: boolean;
  polls_enabled: boolean;
  raise_hand_enabled: boolean;
  active_participants_count: number;
  recording_url?: string;
  scheduled_at?: string;
}

export interface StudyGoal {
  id: number;
  goalable_type: 'Subject' | 'Chapter' | 'Topic';
  goalable_id: number;
  target_hours: number;
  spent_hours: number;
  goalable?: Subject | Chapter | Topic;
}
```

---

## Language Utility

```typescript
// src/utils/lang.ts
import { useSettingsStore } from '../store/settingsStore';

export function useLang() {
  const language = useSettingsStore(s => s.language);
  return {
    t: <T extends { [key: string]: string }>(obj: T, enKey: keyof T, hiKey: keyof T) =>
      language === 'hi' ? (obj[hiKey] || obj[enKey]) : (obj[enKey] || obj[hiKey]),
    lang: language,
  };
}

// Usage:
// const { t } = useLang();
// <Text>{t(subject, 'name_en', 'name_hi')}</Text>
```
