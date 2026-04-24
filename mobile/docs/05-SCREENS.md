# Complete Screen Inventory

> Every screen in the OSDHYAN mobile app — component name, file path, route params, API calls, UI description, and navigation targets.

---

## Navigation Flow Map

```
RootNavigator
│
├── [No token] AuthNavigator (Stack)
│   ├── Login
│   ├── Register
│   ├── OtpVerify
│   └── ForgotPassword
│
└── [Has token] MainNavigator (Bottom Tabs)
    │
    ├── Tab 1: HOME
    │   └── HomeScreen
    │       └── ExamDetailScreen
    │
    ├── Tab 2: TESTS
    │   ├── TestsHomeScreen
    │   │   ├── TestDetailScreen
    │   │   │   ├── TestAttemptScreen  ← hides tab bar
    │   │   │   │   └── TestResultScreen
    │   │   │   │       └── TestSolutionsScreen
    │   │   │   └── (resume) TestAttemptScreen
    │   ├── TestSeriesListScreen
    │   │   └── TestSeriesDetailScreen
    │   │       └── → TestDetailScreen (shared)
    │   └── PYQScreen
    │       └── → TestDetailScreen (shared)
    │
    ├── Tab 3: LEARN
    │   ├── CoursesScreen
    │   │   └── SubjectDetailScreen
    │   │       └── TopicDetailScreen
    │   │           └── MaterialDetailScreen
    │   ├── SyllabusScreen
    │   ├── MaterialsScreen
    │   │   └── MaterialDetailScreen
    │   ├── BlogsScreen
    │   │   └── BlogDetailScreen
    │   └── NotesScreen
    │       └── NoteEditorScreen (create/edit)
    │
    ├── Tab 4: LIVE
    │   ├── LiveClassListScreen
    │   │   ├── LiveClassDetailScreen  ← pre-join
    │   │   │   └── LiveClassRoomScreen  ← hides tab bar, full-screen
    │   │   └── RecordingPlayerScreen
    │
    └── Tab 5: PROFILE
        ├── ProfileScreen
        │   ├── EditProfileScreen
        │   ├── AnalyticsScreen
        │   ├── StudyGoalsScreen
        │   ├── FocusTimerScreen
        │   ├── NotesScreen (shared)
        │   ├── HistoryScreen
        │   ├── AchievementsScreen
        │   └── SettingsScreen
        │       └── ChangePasswordScreen
```

---

## Deep Link Scheme

```
osdhyan://tests/{id}           → TestDetailScreen
osdhyan://live/{id}            → LiveClassDetailScreen
osdhyan://test-series/{id}     → TestSeriesDetailScreen
https://osdhyan.com/tests/{id} → TestDetailScreen (universal link)
```

---

## Auth Screens

---

### SplashScreen
- **File:** `src/screens/SplashScreen.tsx`
- **Route:** Shown automatically by RootNavigator while `isHydrated = false`
- **Params:** none
- **APIs:** none (shown during `authStore.hydrate()`)
- **UI:** Centered OSDHYAN logo + app name on dark background. Animated fade-in/pulse. Auto-dismisses when hydration completes.
- **Navigates to:** LoginScreen or HomeScreen (automatic, based on token)

---

### LoginScreen
- **File:** `src/screens/auth/LoginScreen.tsx`
- **Route:** `Login`
- **Params:** none
- **APIs:**
  - `POST /auth/login` → `{ email, password }` → `{ token, user }`
- **UI:**
  - OSDHYAN logo at top
  - Email input field
  - Password input field (with show/hide toggle)
  - "Login" primary button → calls `authStore.login()`
  - "Forgot Password?" link → ForgotPasswordScreen
  - "Don't have an account? Register" link → RegisterScreen
  - Error toast on failure
- **Navigates to:** HomeScreen (auto, on success) | RegisterScreen | ForgotPasswordScreen

---

### RegisterScreen
- **File:** `src/screens/auth/RegisterScreen.tsx`
- **Route:** `Register`
- **Params:** none
- **APIs:**
  - `POST /auth/register` → `{ name, email, phone, password, password_confirmation }` → `{ token, user }`
- **UI:**
  - Full name input
  - Email input
  - Phone number input (10-digit Indian format)
  - Password input
  - Confirm Password input
  - "Create Account" primary button → calls `authStore.register()`
  - "Already have an account? Login" link → LoginScreen
- **Navigates to:** HomeScreen (auto, on success) | LoginScreen

---

### OtpVerifyScreen
- **File:** `src/screens/auth/OtpScreen.tsx`
- **Route:** `OtpVerify`
- **Params:** `{ phone?: string }` (optional pre-fill)
- **APIs:**
  - `POST /auth/send-otp` → `{ phone }`
  - `POST /auth/verify-otp` → `{ phone, otp }` → `{ token, user }`
- **UI:**
  - Phone number input
  - "Send OTP" button
  - 6-digit OTP input boxes (auto-advance on each digit)
  - "Verify" button
  - Resend countdown (60 seconds, then "Resend OTP" link activates)
- **Navigates to:** HomeScreen (auto, on verify success)

---

### ForgotPasswordScreen
- **File:** `src/screens/auth/ForgotPasswordScreen.tsx`
- **Route:** `ForgotPassword`
- **Params:** none
- **APIs:**
  - `POST /auth/forgot-password` → `{ email }`
- **UI:**
  - Email input
  - "Send Reset Link" button
  - Success message: "Check your email for reset instructions"
  - Back to Login link
- **Navigates to:** LoginScreen

---

## Home Tab

---

### HomeScreen
- **File:** `src/screens/home/HomeScreen.tsx`
- **Route:** `Home` (tab root)
- **Params:** none
- **APIs:**
  - `GET /exams` → exam list for selector
  - `GET /analytics/overview` → `{ accuracy, tests_completed, streak_days }`
  - `GET /test-series?limit=5` → featured series
  - `GET /live-classes?status=live&limit=3` → active live classes banner
- **UI:**
  - Header: OSDHYAN logo (left) + CoinBadge + notification bell (right)
  - Exam selector: horizontal scroll of exam pill buttons (SSC, UPSC, etc.)
  - Stats row: Overall Accuracy % | Tests Done | 🔥 Streak Days
  - "Live NOW" banner (if any live classes) → taps to LiveClassDetailScreen
  - Featured Test Series: horizontal scroll of TestSeriesCards
  - Quick action buttons: "Start Practice" | "Browse Courses"
- **Navigates to:** ExamDetailScreen | LiveClassDetailScreen | TestSeriesDetailScreen

---

### ExamDetailScreen
- **File:** `src/screens/home/ExamDetailScreen.tsx`
- **Route:** `ExamDetail`
- **Params:** `{ examId: number }`
- **APIs:**
  - `GET /exams/{id}/full` → full syllabus hierarchy for this exam
  - `GET /tests?exam_id={id}&limit=10` → recent tests for this exam
  - `GET /test-series?exam_id={id}` → test series for this exam
- **UI:**
  - Exam name + code badge
  - Subjects count + chapters count summary
  - Recent tests list (3–5 items)
  - Related test series list
  - "View Full Syllabus" → SyllabusScreen filtered to this exam
- **Navigates to:** TestDetailScreen | TestSeriesDetailScreen | SyllabusScreen

---

## Tests Tab

---

### TestsHomeScreen
- **File:** `src/screens/tests/TestsHomeScreen.tsx`
- **Route:** `TestsHome` (tab root)
- **Params:** none
- **APIs:**
  - `GET /tests?page=1&exam_id={selectedExam}` (paginated)
  - `GET /exams` (for filter dropdown)
- **UI:**
  - Filter bar: Exam picker | Subject picker | Mode chips (Chapter / Subject / Full Mock) | Difficulty chips
  - FlashList of TestCard components
  - Each TestCard: test name (bilingual), subject chip, mode chip, duration, questions count, marks, negative marking warning, "Start Test" button
  - Pull-to-refresh
  - Load more on scroll end
- **Navigates to:** TestDetailScreen

---

### TestDetailScreen
- **File:** `src/screens/tests/TestDetailScreen.tsx`
- **Route:** `TestDetail`
- **Params:** `{ testId: number }`
- **Deep link:** `osdhyan://tests/{testId}`
- **APIs:**
  - `GET /tests/{id}` → test metadata
  - `GET /tests/{id}/latest-attempt` → previous attempt (if any)
  - `POST /tests/{id}/start` → creates new attempt, returns `{ attempt_id }`
- **UI:**
  - Test name (bilingual toggle)
  - Subject + Chapter breadcrumb
  - Stats grid: Questions | Duration | Total Marks | Negative Marking
  - Instructions list (bullet points): marks per correct, deduction per wrong, navigation rules
  - Previous attempt card (if exists): score, date, "Review Solutions" link
  - "Start Test" primary button (or "Resume" if `latest_attempt.status === 'in_progress'`)
- **Navigates to:** TestAttemptScreen (new or resumed) | TestSolutionsScreen (from prev attempt)

---

### TestAttemptScreen ⚠️ Full-screen, hides tab bar
- **File:** `src/screens/tests/TestAttemptScreen.tsx`
- **Route:** `TestAttempt`
- **Params:** `{ attemptId: number, testId: number }`
- **APIs:**
  - `GET /attempts/{id}` → attempt + all questions + existing responses
  - `POST /attempts/{id}/sync` → `{ responses: { [questionId]: optionId } }` (auto-save every 30s + on submit)
  - `POST /attempts/{id}/complete` → final submit → result data
- **State:**
  - `questions[]` — all questions for the test
  - `responses: Record<questionId, optionId>` — user selections
  - `currentIndex: number` — current question
  - `timeLeft: number` — seconds remaining
  - `markedForReview: Set<number>` — question indices
- **UI:**
  - Header: Back (with confirm dialog) | "Q X of N" | Countdown timer (red < 5min) | Palette icon
  - Question text (language toggle EN/HI)
  - 4 option buttons (A/B/C/D), selected = blue highlight
  - "Mark for Review" toggle button
  - Prev / Next navigation buttons
  - Floating Palette icon → opens QuestionPalette bottom sheet:
    - Grid of numbered boxes: white=unvisited, gray=visited/unanswered, blue=answered, orange=marked
    - Summary: Total | Answered | Unanswered | Marked
    - "Submit Test" button
  - Timer auto-submits at 0 with toast warning at 5 minutes
  - Back navigation intercepted: shows "Leave Test?" dialog
  - Responses auto-backed-up to AsyncStorage key `attempt_{id}`
- **Navigates to:** TestResultScreen (on submit) | TestDetailScreen (on back confirm)

---

### TestResultScreen
- **File:** `src/screens/tests/TestResultScreen.tsx`
- **Route:** `TestResult`
- **Params:** `{ attemptId: number }`
- **APIs:**
  - `GET /attempts/{id}` → full result data (if navigating from history)
  - Data usually passed from `POST /attempts/{id}/complete` response
- **UI:**
  - Score card: large "X / MaxScore", percentage with color (green ≥60%, orange 40–60%, red <40%), time taken, rank badge
  - Stats grid 2×2: ✅ Correct | ❌ Incorrect | ⏭ Skipped | ⏱ Avg time/question
  - Topic-wise breakdown: bar chart (victory-native) showing accuracy per topic
  - Action buttons: "Review Solutions" | "Retake Test" | "Share Result" (expo-sharing)
  - Top Performers: top 3 rank cards (if API returns leaderboard)
- **Navigates to:** TestSolutionsScreen | TestAttemptScreen (retake = new attempt) | HomeScreen

---

### TestSolutionsScreen
- **File:** `src/screens/tests/TestSolutionsScreen.tsx`
- **Route:** `TestSolutions`
- **Params:** `{ attemptId: number }`
- **APIs:**
  - `GET /attempts/{id}` → attempt with questions + user responses + correct answers + explanations
- **UI:**
  - Filter bar: All | Correct | Incorrect | Skipped | Marked for Review
  - Per question:
    - Question text (bilingual)
    - All 4 options with: user's selection (highlighted), correct option (green), wrong selection (red)
    - Explanation (EN/HI based on language setting)
    - Score indicator: ✅ +{marks} | ❌ -{marks} | ⏭ 0
  - Sticky filter bar at top on scroll
- **Navigates to:** ← back to TestResultScreen

---

### TestSeriesListScreen
- **File:** `src/screens/tests/TestSeriesListScreen.tsx`
- **Route:** `TestSeriesList`
- **Params:** none
- **APIs:**
  - `GET /test-series` → all series
  - `GET /test-series/enrolled` → user's enrolled series
- **UI:**
  - "Enrolled" horizontal scroll section (if any enrolled series)
  - Full list of test series:
    - Series name, exam badge, tests count, price (Free / ₹XXX)
    - "Enrolled" green badge OR "Enroll" button
    - Progress bar (tests completed / total)
- **Navigates to:** TestSeriesDetailScreen

---

### TestSeriesDetailScreen
- **File:** `src/screens/tests/TestSeriesDetailScreen.tsx`
- **Route:** `TestSeriesDetail`
- **Params:** `{ seriesId: number }`
- **Deep link:** `osdhyan://test-series/{seriesId}`
- **APIs:**
  - `GET /test-series/{id}` → series + tests list
  - `POST /test-series/{id}/enroll` → enroll user
  - `DELETE /test-series/{id}/enroll` → unenroll
- **UI:**
  - Series name, exam, description
  - Enroll / Unenroll CTA button (with price if paid)
  - Tests list:
    - Each row: test name, duration, attempt count, best score
    - Locked icon if not enrolled
    - "Start" button if enrolled
- **Navigates to:** TestDetailScreen (for each test)

---

### PYQScreen
- **File:** `src/screens/tests/PYQScreen.tsx`
- **Route:** `PYQ`
- **Params:** none
- **APIs:**
  - `GET /tests?mode=full_mock&exam_id={selectedExam}` (reuses tests endpoint)
- **UI:**
  - Exam picker
  - Year-wise grouped list of past papers
  - Same TestCard component as TestsHomeScreen
- **Navigates to:** TestDetailScreen

---

## Learn Tab

---

### CoursesScreen
- **File:** `src/screens/learn/CoursesScreen.tsx`
- **Route:** `Courses` (tab root)
- **Params:** none
- **APIs:**
  - `GET /courses/categories` → category list
  - `GET /courses/subjects?category={cat}` → subjects for selected category
  - `GET /courses/ncert/classes` → NCERT class numbers (6–12)
- **UI:**
  - Category tabs (horizontal scroll): All | SSC | UPSC | Railways | Banking | NCERT | etc.
  - NCERT tab: class selector grid → `GET /courses/ncert/classes/{class}/subjects`
  - Subject grid (2 columns): icon, name, chapter count
- **Navigates to:** SubjectDetailScreen

---

### SubjectDetailScreen
- **File:** `src/screens/learn/SubjectDetailScreen.tsx`
- **Route:** `SubjectDetail`
- **Params:** `{ subjectId: number }`
- **APIs:**
  - `GET /courses/subjects/{id}/hierarchy` → subject + chapters + topics tree
- **UI:**
  - Subject header with category badge
  - Chapters accordion list (expandable):
    - Chapter name + topic count
    - Expand → shows topic list
    - Each topic: name, materials count
- **Navigates to:** TopicDetailScreen

---

### TopicDetailScreen
- **File:** `src/screens/learn/TopicDetailScreen.tsx`
- **Route:** `TopicDetail`
- **Params:** `{ topicId: number }`
- **APIs:**
  - `GET /courses/topics/{id}/materials` → materials list for topic
- **UI:**
  - Topic name + "Chapter > Subject" breadcrumb
  - Materials list:
    - PDF badge → open with expo-web-browser
    - Video badge → navigate to VideoPlayerScreen (within MaterialDetailScreen)
    - Article badge → inline WebView
  - Progress bar per material (if partially viewed)
- **Navigates to:** MaterialDetailScreen

---

### MaterialDetailScreen
- **File:** `src/screens/learn/MaterialDetailScreen.tsx`
- **Route:** `MaterialDetail`
- **Params:** `{ materialId: number }`
- **APIs:**
  - `GET /study-materials/{id}` → material data
  - `POST /study-materials/{id}/progress` → `{ progress_percent }` (video only)
- **UI (PDF):**
  - Open via `expo-linking` to external URL or `react-native-pdf` for in-app viewer
  - Title + breadcrumb header
- **UI (Video):**
  - `expo-av` Video component
  - Custom controls: play/pause, seek bar, current/total time, fullscreen toggle
  - Speed selector (0.75x, 1x, 1.25x, 1.5x, 2x)
  - Progress tracked via POST on pause/complete
- **UI (Article):**
  - `react-native-render-html` for full HTML rendering
  - Scrollable, respects bilingual content
- **Navigates to:** ← back

---

### SyllabusScreen
- **File:** `src/screens/learn/SyllabusScreen.tsx`
- **Route:** `Syllabus`
- **Params:** `{ examId?: number }` (optional pre-selection)
- **APIs:**
  - `GET /exams` → exam selector list
  - `GET /exams/{id}/full` → full Subject → Chapter → Topic hierarchy
- **UI:**
  - Exam picker (dropdown or bottom sheet)
  - Search bar: real-time filter across all subjects/chapters/topics
  - Accordion tree: Subject → Chapter → Topic
    - Each level: name + child count
    - Leaf (topic): tap → quick materials bottom sheet
  - Matching text highlighted during search
- **Navigates to:** MaterialDetailScreen (from topic tap)

---

### MaterialsScreen
- **File:** `src/screens/learn/MaterialsScreen.tsx`
- **Route:** `Materials`
- **Params:** none
- **APIs:**
  - `GET /study-materials?subject={id}&chapter={id}&type={type}` (filterable)
- **UI:**
  - Filter row: Subject picker | Chapter picker | Type chips (PDF / Video / Article)
  - FlashList of MaterialCard:
    - Thumbnail, title, type badge, duration (video) or pages (PDF)
    - Progress ring (if partially viewed)
- **Navigates to:** MaterialDetailScreen

---

### BlogsScreen
- **File:** `src/screens/learn/BlogsScreen.tsx`
- **Route:** `Blogs`
- **Params:** none
- **APIs:**
  - `GET /blogs` → paginated blog list
- **UI:**
  - Category filter tabs (horizontal scroll)
  - FlashList of BlogCard:
    - Thumbnail image
    - Category badge + title + excerpt
    - Date + read time estimate
- **Navigates to:** BlogDetailScreen

---

### BlogDetailScreen
- **File:** `src/screens/learn/BlogDetailScreen.tsx`
- **Route:** `BlogDetail`
- **Params:** `{ slug: string }`
- **APIs:**
  - `GET /blogs/{slug}` → full blog content
- **UI:**
  - Hero image
  - Title + author + date
  - Full article rendered via `react-native-render-html`
  - Share button (expo-sharing)
  - Related articles at bottom
- **Navigates to:** BlogDetailScreen (related articles) | ← back

---

### NotesScreen
- **File:** `src/screens/learn/NotesScreen.tsx`
- **Route:** `Notes`
- **Params:** none
- **APIs:**
  - `GET /notes` → user's notes list
  - `DELETE /notes/{id}` → delete note (swipe action)
- **UI:**
  - Search bar (real-time filter by title/content)
  - Subject filter chips
  - FlashList of NoteCard:
    - Title + excerpt + subject tag + date
    - Swipe left → delete (with confirmation alert)
    - Tap → NoteDetailScreen (read-only view in bottom sheet or stack)
    - Long press → NoteEditorScreen (edit mode)
  - FAB button → NoteEditorScreen (create)
- **Navigates to:** NoteEditorScreen (create/edit)

---

### NoteEditorScreen
- **File:** `src/screens/learn/NoteEditorScreen.tsx`
- **Route:** `NoteEditor`
- **Params:** `{ noteId?: number }` (omit for create, provide for edit)
- **APIs:**
  - `GET /notes/{id}` → load existing note (if editing)
  - `POST /notes` → `{ title, content, subject_id? }` (create)
  - `PATCH /notes/{id}` → `{ title, content, subject_id? }` (update)
- **UI:**
  - Title input (single-line)
  - Subject selector (optional, bottom sheet picker)
  - Multi-line content text area (large)
  - Save button → POST/PATCH → navigate back
  - Back button with unsaved changes warning
- **Navigates to:** ← back to NotesScreen

---

## Live Tab

---

### LiveClassListScreen
- **File:** `src/screens/live/LiveClassListScreen.tsx`
- **Route:** `LiveClassList` (tab root)
- **Params:** none
- **APIs:**
  - `GET /live-classes?status=live` — polls every 10 seconds
  - `GET /live-classes?status=scheduled`
  - `GET /live-classes?status=ended`
- **UI:**
  - Tabs: LIVE NOW 🔴 | Upcoming | Past / Recordings
  - LIVE NOW tab: red pulsing dot indicator; refetches every 10s
  - LiveClassCard per item:
    - Status badge (LIVE / SCHEDULED / ENDED)
    - Title + subject + teacher name + avatar
    - Participant count (if live)
    - Scheduled time (if upcoming)
    - "Join" button (if live) → LiveClassRoomScreen
    - "Watch Recording" button (if ended + recording exists)
- **Navigates to:** LiveClassDetailScreen | RecordingPlayerScreen

---

### LiveClassDetailScreen
- **File:** `src/screens/live/LiveClassDetailScreen.tsx`
- **Route:** `LiveClassDetail`
- **Params:** `{ classId: number }`
- **Deep link:** `osdhyan://live/{classId}`
- **APIs:**
  - `GET /live-classes/{id}` → class details
- **UI:**
  - Teacher avatar + name
  - Class title + status badge
  - Subject + description
  - Feature icons: Chat ✓ | Q&A ✓ | Polls ✓ | Raise Hand ✓
  - Coin incentive tip: "Answer polls correctly to earn coins! 🪙"
  - "Join Class" button (if status=live) → LiveClassRoomScreen
  - "Watch Recording" button (if status=ended and recording_url set)
- **Navigates to:** LiveClassRoomScreen | RecordingPlayerScreen

---

### LiveClassRoomScreen ⚠️ Full-screen, hides tab bar
- **File:** `src/screens/live/LiveClassRoomScreen.tsx`
- **Route:** `LiveClassRoom`
- **Params:** `{ classId: number }`
- **APIs:**
  - `POST /live-classes/{id}/join` → `{ teacher_id }`
  - `POST /live-classes/{id}/signals` → send WebRTC signals (answer, ICE candidates, ready)
  - `GET /live-classes/{id}/signals?since_id={n}` → poll every 800ms
  - `GET /live-classes/{id}/state?since={timestamp}` → poll for chat/polls/participants every 2.5s
  - `POST /live-classes/{id}/messages` → send chat message or question
  - `POST /live-classes/{id}/raise-hand` → raise/lower hand
  - `POST /live-classes/{id}/polls/{pollId}/vote` → `{ option_index }` → `{ poll, coins_earned }`
- **UI Structure:** Split screen
  - **Top 55% — VideoPanel:**
    - `RTCView` displaying remote stream (teacher's camera/screen)
    - Waiting overlay: icon + "Waiting for teacher's stream..." (shown until stream arrives)
    - Participant count badge (top-right)
    - Leave button (top-left)
  - **Bottom 45% — Panel Tabs + Content:**
    - Tab bar: Chat | Q&A | Polls | Participants
    - **Chat tab:** FlatList of messages (auto-scroll to bottom), input + Send button, type toggle Chat/Question
    - **Q&A tab:** Filtered to `type=question` messages only
    - **Polls tab:** Active poll with option vote buttons; after vote: percentage bars (animated); correct answer revealed in green/red; coin toast if earned
    - **Participants tab:** List of joined students + raise-hand indicators
  - Raise Hand floating button (amber when raised)
  - CoinEarnedAnimation overlay (coins fly up on poll win)
- **WebRTC Flow:**
  1. `POST /join` → get teacher_id
  2. Send `ready` signal to teacher
  3. Poll signals every 800ms
  4. On `offer` signal: create RTCPeerConnection, setRemoteDescription, createAnswer, POST answer signal
  5. Exchange ICE candidates
  6. `pc.ontrack` → `setRemoteStream` → RTCView shows video
- **Navigates to:** ← back to LiveClassDetailScreen (confirms leave)

---

### RecordingPlayerScreen
- **File:** `src/screens/live/RecordingPlayerScreen.tsx`
- **Route:** `RecordingPlayer`
- **Params:** `{ classId: number, recordingUrl: string }`
- **APIs:** none (URL passed as param)
- **UI:**
  - Full-screen `expo-av` Video player
  - Native controls: play/pause, seek bar, fullscreen toggle
  - Playback speed selector
  - Class title in header
- **Navigates to:** ← back

---

## Profile Tab

---

### ProfileScreen
- **File:** `src/screens/profile/ProfileScreen.tsx`
- **Route:** `Profile` (tab root)
- **Params:** none
- **APIs:**
  - `GET /user` → user profile data
- **UI:**
  - Large avatar (tappable → image picker → upload)
  - Name + email + phone
  - Exam target badge (e.g. "SSC CGL 2026")
  - Stats row: Coins (amber) | Rank | Tests Done | Streak
  - Menu list:
    - Study Goals → StudyGoalsScreen
    - Achievements → AchievementsScreen
    - Test History → HistoryScreen
    - Notes → NotesScreen
    - Focus Timer → FocusTimerScreen
    - Analytics → AnalyticsScreen
    - Settings → SettingsScreen
    - Support → (in-app WebView or mailto)
  - "Edit Profile" button → EditProfileScreen
  - "Logout" button (with confirmation alert) → calls `authStore.logout()`
- **Navigates to:** All profile sub-screens + LoginScreen (on logout)

---

### EditProfileScreen
- **File:** `src/screens/profile/EditProfileScreen.tsx`
- **Route:** `EditProfile`
- **Params:** none
- **APIs:**
  - `PATCH /profile` → multipart form with `{ name, phone, avatar? }` → updated user
  - `expo-image-picker` → select photo → upload as multipart
- **UI:**
  - Avatar with "Change Photo" overlay
  - Name input (pre-filled)
  - Phone input (pre-filled)
  - "Save Changes" button
- **Navigates to:** ← back to ProfileScreen

---

### AnalyticsScreen
- **File:** `src/screens/profile/AnalyticsScreen.tsx`
- **Route:** `Analytics`
- **Params:** none
- **APIs:**
  - `GET /analytics/overview` → `{ accuracy, tests_completed, study_time_sec, streak_days }`
  - `GET /analytics/topics` → `{ topic_name, accuracy_percent }[]`
  - `GET /achievements` → list of achievements
- **UI:**
  - Section 1 — Overview grid (4 cells): Overall Accuracy % | Tests Completed | Total Study Time | 🔥 Streak
  - Section 2 — Accuracy Chart: horizontal bar chart (victory-native), color coded (green ≥70%, orange 40–70%, red <40%)
  - Section 3 — Weak Areas: topics with accuracy < 50%, each with "Practice Now" → filtered tests list
  - Section 4 — Progress Over Time: line chart showing accuracy trend (7/30 day toggle)
  - Section 5 — Achievements: colored earned badges + gray locked badges
- **Navigates to:** TestsHomeScreen (filtered) from weak areas

---

### StudyGoalsScreen
- **File:** `src/screens/profile/StudyGoalsScreen.tsx`
- **Route:** `StudyGoals`
- **Params:** none
- **APIs:**
  - `GET /study-goals` → user's goals with spent/target hours
  - `GET /exams` → for Add Goal modal
  - `GET /syllabus/subjects?exam_id={id}` → subject options
  - `GET /syllabus/chapters?subject_id={id}` → chapter options
  - `GET /syllabus/topics?chapter_id={id}` → topic options
  - `POST /study-goals` → `{ goalable_type, goalable_id, target_hours }`
  - `DELETE /study-goals/{id}` → delete goal
- **UI:**
  - Stats row: Active goals count | Avg completion % | Total hours logged
  - FlashList of GoalCards:
    - Subject/Chapter/Topic name (with level label)
    - Circular progress ring (SVG) showing spent/target hours
    - Remaining hours
    - Swipe-to-delete or long-press delete
  - FAB → Add Goal bottom sheet:
    1. Exam picker
    2. Subject picker (loads after exam selected)
    3. Chapter picker (optional, loads after subject)
    4. Topic picker (optional, loads after chapter)
    5. Target hours: preset chips (10h, 20h, 30h, 50h, 75h, 100h, 150h, 200h) + custom input with +/- stepper
    6. "Save Goal" button
- **Navigates to:** ← back to ProfileScreen

---

### FocusTimerScreen
- **File:** `src/screens/profile/FocusTimerScreen.tsx`
- **Route:** `FocusTimer`
- **Params:** none
- **APIs:** none (local state + AsyncStorage for settings and session log)
- **State:** pomodoroStore (Zustand)
- **UI:**
  - Mode selector tabs: Focus ({min}:00) | Short Break ({min}:00) | Long Break ({min}:00)
  - Center: Large circular SVG timer ring, time display (MM:SS), mode label ("Deep Focus")
  - Pomodoro dots: 4 circles, filled = completed in current cycle
  - Controls: Reset | Play/Pause | Cycle counter
  - Settings gear → Timer Settings bottom sheet:
    - Preset cards: Classic (25/5/15) | Short (15/3/10) | Long (50/10/30) | Ultra (90/20/30)
    - Custom steppers: Focus (1–120 min) | Short Break (1–60) | Long Break (1–60)
    - "Apply" button → saves to AsyncStorage + updates timer
  - Task Tree (collapsible panel): Subjects → Chapters → Topics → Tasks
    - Each task: checkbox, title, allocated minutes, 🍅 count
    - Select task → links session to task
  - Session Log: today's completed sessions with task name + duration + total focus time
  - AppState handling: on background → save timestamp; on return → subtract elapsed time
- **Navigates to:** ← back to ProfileScreen

---

### HistoryScreen
- **File:** `src/screens/profile/HistoryScreen.tsx`
- **Route:** `History`
- **Params:** none
- **APIs:**
  - `GET /analytics/overview` → summary stats
  - `GET /attempts?status=completed&page=1` → paginated attempt history
- **UI:**
  - Summary row: Total Attempts | Avg Score | Best Score
  - Grouped by date (Today | Yesterday | This Week | Earlier)
  - HistoryCard per attempt: test name, score, time taken, date
  - Tap → TestResultScreen (re-display results)
- **Navigates to:** TestResultScreen

---

### AchievementsScreen
- **File:** `src/screens/profile/AchievementsScreen.tsx`
- **Route:** `Achievements`
- **Params:** none
- **APIs:**
  - `GET /achievements` → all achievements with earned status
- **UI:**
  - Total earned count
  - Grid of achievement badges:
    - Earned: full color with name + description
    - Locked: gray silhouette with "???" until earned
  - Achievement detail modal on tap: name, description, how to earn, earned date
- **Navigates to:** ← back

---

### SettingsScreen
- **File:** `src/screens/profile/SettingsScreen.tsx`
- **Route:** `Settings`
- **Params:** none
- **APIs:**
  - `POST /profile/notification-settings` → `{ study_reminder_time, notifications_enabled }`
  - `PATCH /user` → update default exam preference
- **UI Sections:**
  1. **Preferences:** Language toggle (English / हिंदी) | Theme selector (Dark / Light / System) | Default Exam picker
  2. **Notifications:** Push notifications master toggle | Study reminder time picker (time wheel)
  3. **Account:** Change Password → ChangePasswordScreen | Delete Account (double confirmation)
  4. **About:** App version | Privacy Policy (opens WebView) | Terms of Service (opens WebView) | Rate the App (expo-store-review)
- **Navigates to:** ChangePasswordScreen | WebView screens

---

### ChangePasswordScreen
- **File:** `src/screens/profile/ChangePasswordScreen.tsx`
- **Route:** `ChangePassword`
- **Params:** none
- **APIs:**
  - `POST /auth/change-password` → `{ current_password, password, password_confirmation }`
- **UI:**
  - Current password input
  - New password input
  - Confirm new password input
  - "Update Password" button
  - Success toast → navigate back
- **Navigates to:** ← back to SettingsScreen

---

## Screen Count Summary

| Navigator | Screen Count |
|---|---|
| Auth (pre-login) | 4 screens |
| Home tab | 2 screens |
| Tests tab | 7 screens |
| Learn tab | 8 screens |
| Live tab | 3 screens |
| Profile tab | 8 screens |
| **Total** | **32 screens** |

---

## Shared Component Patterns

### Screens that hide the tab bar
These screens use `navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })` on mount and restore on unmount:
- `TestAttemptScreen` (full concentration mode)
- `LiveClassRoomScreen` (full-screen video)

### Screens with full-screen video
Both use `expo-av` Video component with `ResizeMode.CONTAIN`:
- `MaterialDetailScreen` (video type)
- `RecordingPlayerScreen`

### Screens with WebRTC
Only one screen — `LiveClassRoomScreen`:
- Requires custom dev client (not Expo Go)
- Package: `react-native-webrtc`
- Student role: viewer only (no camera/mic)

### Screens with file upload
- `EditProfileScreen` — avatar photo via `expo-image-picker`

### Screens with pagination (FlashList + load more)
- `TestsHomeScreen`
- `LiveClassListScreen`
- `MaterialsScreen`
- `BlogsScreen`
- `NotesScreen`
- `HistoryScreen`
