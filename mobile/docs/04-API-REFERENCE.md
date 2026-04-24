# Complete API Reference

**Base URL:** `{EXPO_PUBLIC_API_URL}` (e.g., `http://192.168.1.100:8000/api`)

**Auth Header:** `Authorization: Bearer {token}` — required on all protected routes.

**Content-Type:** `application/json` (use `multipart/form-data` for file uploads)

---

## Authentication

### Register
```
POST /auth/register
Body: { name, email, password, password_confirmation, phone? }
Response: { token, user }
```

### Login
```
POST /auth/login
Body: { email, password }
Response: { token, user }
```

### Logout
```
POST /auth/logout  [AUTH REQUIRED]
Response: { message: 'Logged out' }
```

### Send OTP
```
POST /auth/send-otp
Body: { phone }
Response: { message }
```

### Verify OTP
```
POST /auth/verify-otp
Body: { phone, otp }
Response: { token, user }
```

### Forgot Password
```
POST /auth/forgot-password
Body: { email }
Response: { message }
```

### Reset Password
```
POST /auth/reset-password
Body: { token, email, password, password_confirmation }
Response: { message }
```

### Get Current User
```
GET /user  [AUTH REQUIRED]
Response: { id, name, email, role, coins, avatar, ... }
```

---

## Profile

### Update Profile
```
POST /profile  [AUTH REQUIRED]
Body (multipart): { name?, phone?, avatar? (file) }
Response: { user }
```

### Change Password
```
PUT /profile/password  [AUTH REQUIRED]
Body: { current_password, password, password_confirmation }
Response: { message }
```

---

## Exams & Syllabus

### List Exams (public)
```
GET /exams
Response: [{ id, code, name_en, name_hi, is_published }]
```

### Get Exam Subjects (public)
```
GET /exams/{examId}/subjects
Response: [{ id, code, name_en, name_hi, category }]
```

### Get Full Exam Hierarchy (public)
```
GET /exams/{examId}/full
Response: { exam, subjects: [{ ...subject, chapters: [{ ...chapter, topics: [] }] }] }
```

### Get Subject Chapters (public)
```
GET /subjects/{subjectId}/chapters
Response: [{ id, code, name_en, name_hi, sort_order }]
```

### Get Chapter Topics (public)
```
GET /chapters/{chapterId}/topics
Response: [{ id, code, name_en, name_hi, sort_order }]
```

---

## Tests

### List Tests (public, paginated)
```
GET /tests
Query: { exam_id?, subject_id?, chapter_id?, topic_id?, mode?, page? }
Response: { data: [Test], links, meta }
```

### Get Test Detail (public)
```
GET /tests/{testId}
Response: { id, name_en, name_hi, duration_sec, total_marks, questions_count, subject, chapter, topic, ... }
```

### Start Test Attempt  [AUTH REQUIRED]
```
POST /tests/{testId}/attempts
Response: { attempt_id, questions: [{ id, question_en, question_hi, options: [{ id, option_en, option_hi }] }] }
```
> **Note:** `is_correct` is NOT returned in questions until attempt is completed.

### Get Attempt [AUTH REQUIRED]
```
GET /attempts/{attemptId}
Response: { attempt, questions, responses }
```

### Save Response (auto-save)  [AUTH REQUIRED]
```
POST /attempts/{attemptId}/responses
Body: { question_id, option_id, time_spent_sec? }
Response: { saved: true }
```

### Sync All Responses (batch save)  [AUTH REQUIRED]
```
POST /attempts/{attemptId}/sync
Body: { responses: [{ question_id, option_id }] }
Response: { synced: true }
```

### Complete Attempt  [AUTH REQUIRED]
```
POST /attempts/{attemptId}/complete
Body: { time_spent_sec }
Response: {
  score, max_score, percentage,
  correct_count, incorrect_count, skipped_count,
  questions: [{ id, question_en, options: [{ ..., is_correct }], user_response_id }]
}
```

### Get Test Attempts (history)  [AUTH REQUIRED]
```
GET /tests/{testId}/attempts
Response: [{ attempt_id, score, completed_at, percentage }]
```

### Get Latest Attempt  [AUTH REQUIRED]
```
GET /tests/{testId}/latest-attempt
Response: attempt | null
```

---

## Test Series

### List Test Series (public)
```
GET /test-series
Query: { exam_id?, page? }
Response: { data: [TestSeries] }
```

### Get Test Series Detail (public)
```
GET /test-series/{seriesId}
Response: { ...series, tests: [Test] }
```

### Enroll in Test Series  [AUTH REQUIRED]
```
POST /test-series/{seriesId}/enroll
Response: { enrolled: true }
```

### Unenroll  [AUTH REQUIRED]
```
POST /test-series/{seriesId}/unenroll
Response: { message }
```

### My Enrolled Series  [AUTH REQUIRED]
```
GET /test-series/enrolled
Response: [TestSeries]
```

---

## Courses & Content

### Get Categories (public)
```
GET /courses/categories
Response: [{ code, label, count }]
```

### Get Subjects by Category (public)
```
GET /courses/subjects
Query: { category }
Response: [Subject]
```

### Get Subject Hierarchy (public)
```
GET /courses/subjects/{subjectId}/hierarchy
Response: { subject, chapters: [{ chapter, topics: [] }] }
```

### Get NCERT Classes (public)
```
GET /courses/ncert/classes
Response: [{ class_level, subjects_count }]
```

### Get NCERT Subjects by Class (public)
```
GET /courses/ncert/classes/{class}/subjects
Response: [Subject]
```

### Get Topic Materials (public)
```
GET /courses/topics/{topicId}/materials
Response: [{ id, title, type, url, duration_min, thumbnail }]
```

---

## Study Materials

### List Materials (public)
```
GET /study-materials
Query: { subject_id?, chapter_id?, topic_id?, type? }
Response: [Material]
```

### Get Material Detail (public)
```
GET /study-materials/{id}
Response: { id, title, type, url, description, ... }
```

### Update Material Progress  [AUTH REQUIRED]
```
POST /study-materials/{id}/progress
Body: { progress_percent, completed? }
Response: { saved: true }
```

---

## Blogs

### List Blogs (public)
```
GET /blogs
Query: { page? }
Response: { data: [{ id, title, slug, excerpt, published_at }] }
```

### Get Blog by Slug (public)
```
GET /blogs/{slug}
Response: { id, title, content, author, published_at, tags }
```

---

## Live Classes

### List Live Classes (public)
```
GET /live-classes
Query: { status? (scheduled|live|ended) }
Response: [LiveClass]
```

### Get Live Class Detail (public)
```
GET /live-classes/{id}
Response: { ...LiveClass, recording_url? }
```

### Get Live Class State (public, polls every 2.5s)
```
GET /live-classes/{id}/state
Query: { since: ISO_timestamp }
Response: {
  status, server_time,
  participant_count,
  messages: [Message],
  polls: [Poll],
  hands_raised: [{ user }],
  user_coins: number  (for authenticated user)
}
```

### Join Live Class  [AUTH REQUIRED]
```
POST /live-classes/{id}/join
Response: { teacher_id, message }
```

### Leave Live Class  [AUTH REQUIRED]
```
POST /live-classes/{id}/leave
Response: { message }
```

### Send Message (chat)  [AUTH REQUIRED]
```
POST /live-classes/{id}/messages
Body: { message, type: 'chat'|'question' }
Response: { id, message, type, user, created_at }
```

### Raise / Lower Hand  [AUTH REQUIRED]
```
POST /live-classes/{id}/raise-hand
Response: { hand_raised: boolean }
```

### Vote on Poll  [AUTH REQUIRED]
```
POST /live-classes/{id}/polls/{pollId}/vote
Body: { option_index }
Response: { poll, coins_earned }
```

### WebRTC: Push Signal  [AUTH REQUIRED]
```
POST /live-classes/{id}/signals
Body: { type: 'offer'|'answer'|'ice-candidate'|'screen-share-offer'|'screen-share-end'|'ready', payload, to_user_id? }
Response: { id }
```

### WebRTC: Pull Signals  [AUTH REQUIRED]
```
GET /live-classes/{id}/signals
Query: { since_id: last_signal_id }
Response: { signals: [Signal], last_id }
```

---

## Study Goals  [AUTH REQUIRED]

### List Goals
```
GET /study-goals
Response: [{ id, goalable_type, goalable_id, target_hours, spent_hours, goalable }]
```

### Create / Update Goal (upsert)
```
POST /study-goals
Body: { goalable_type: 'Subject'|'Chapter'|'Topic', goalable_id, target_hours }
Response: StudyGoal
```

### Delete Goal
```
DELETE /study-goals/{id}
Response: { deleted: true }
```

---

## Analytics  [AUTH REQUIRED]

### Overview
```
GET /analytics/overview
Response: {
  overall_accuracy, tests_completed, total_study_time_sec,
  rank, streak_days, coins
}
```

### Topic-wise Performance
```
GET /analytics/topics
Response: [{ topic, accuracy_pct, attempts_count, avg_time_sec }]
```

### AI Question Explanation
```
GET /analytics/explanation/{questionId}
Response: { explanation_en, explanation_hi }
```

---

## Study Sessions  [AUTH REQUIRED]

### Start Session
```
POST /study-sessions/start
Body: { material_id?, study_goal_id?, node_id? }
Response: { session_id }
```

### Pause / Resume / Stop
```
POST /study-sessions/{id}/pause
POST /study-sessions/{id}/resume
POST /study-sessions/{id}/stop
Body (stop): { focus_duration_sec, break_duration_sec }
```

### Get Active Session
```
GET /study-sessions/active
Response: session | null
```

---

## Notes  [AUTH REQUIRED]

### List Notes
```
GET /notes
Response: [{ id, title, content, subject?, created_at }]
```

### Create Note
```
POST /notes
Body: { title, content, subject_id? }
Response: Note
```

### Delete Note
```
DELETE /notes/{id}
Response: { deleted: true }
```

---

## Achievements  [AUTH REQUIRED]

### List Achievements
```
GET /achievements
Response: [{ id, title, description, earned_at?, badge_url }]
```

---

## Support  [AUTH REQUIRED]

### Submit Support Ticket
```
POST /support/tickets
Body: { subject, message, category? }
Response: { ticket_id }
```

### My Tickets
```
GET /support/tickets
Response: [Ticket]
```

---

## Study Planner  [AUTH REQUIRED]

### Get Dashboard Data
```
GET /study-planner/dashboard
Response: {
  monthly_plan, weekly_plan, today_log, today_tasks, weekly_tasks,
  targets: { daily_base_target_minutes, today_remaining_minutes, ... },
  report, weekly_timeline, plan_nodes, active_section_session
}
```

### Set Goal (monthly/weekly plan)
```
POST /study-planner/goal
Body: { type: 'monthly'|'weekly', target_hours, start_date, end_date, daily_template? }
Response: StudyPlan
```

### Log Activity
```
POST /study-planner/log
Body: { minutes }
Response: { today_total }
```
