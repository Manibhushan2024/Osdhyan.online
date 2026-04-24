# Phase 3 — Content: Courses, Syllabus, Materials, Blogs (Week 6–7)

---

## Step 3.1 — Courses Screen

```
Screen: CoursesScreen
API: GET /courses/categories
     GET /courses/subjects?category={cat}

Layout:
- Category tabs (horizontal scroll): All, SSC, UPSC, Railways, Banking, NCERT, etc.
- Subject grid (2 columns):
  - Subject card: icon, name_en/hi, chapter count
  - Tap → SubjectDetailScreen

NCERT section:
- "By Class" button → NCERT class selector
- GET /courses/ncert/classes → show class buttons (6, 7, 8... 12)
- Select class → GET /courses/ncert/classes/{class}/subjects
```

### SubjectDetailScreen
```
Route params: { subjectId }
API: GET /courses/subjects/{id}/hierarchy

Shows:
- Subject header with category badge
- Chapters list (expandable accordion)
  - Each chapter: name, topic count
  - Expand → show topics
  - Each topic: name, materials count
  - Tap topic → TopicDetailScreen
```

### TopicDetailScreen
```
Route params: { topicId }
API: GET /courses/topics/{id}/materials

Shows:
- Topic name + chapter breadcrumb
- Materials list:
  - PDF: open with expo-web-browser or PDF viewer
  - Video: open VideoPlayerScreen
  - Article: open inline WebView
- Progress bar per material
```

---

## Step 3.2 — Syllabus Browser

```
Screen: SyllabusScreen
API: GET /exams → exam selector
     GET /exams/{id}/full → complete hierarchy

Layout:
- Exam picker (dropdown or bottom sheet)
- Accordion tree: Subject → Chapter → Topic
  - Each level shows name + count of children
  - Fully expandable/collapsible
  - Leaf (topic) tap → quick material list

Search bar:
- Filter subjects/chapters/topics by keyword in real time
- Highlight matching text
```

---

## Step 3.3 — Study Materials

```
Screen: MaterialsScreen
API: GET /study-materials

Layout:
- Filter: Subject, Chapter, Type (PDF, Video, Article)
- FlashList of MaterialCard:
  - Thumbnail + title + type badge + duration/pages
  - Progress indicator (if partially viewed)
- Tap → MaterialDetailScreen

MaterialDetailScreen:
Route params: { materialId }
API: GET /study-materials/{id}

- For PDF: use expo-linking to open URL, or react-native-pdf
- For Video: use expo-av Video component
  - Controls: play/pause, seek bar, fullscreen
  - Track progress via POST /study-materials/{id}/progress
- For Article: render HTML with react-native-render-html
```

---

## Step 3.4 — Blogs

```
Screen: BlogsScreen
API: GET /blogs

Layout:
- Category filter tabs
- FlashList of BlogCard:
  - Thumbnail + category badge + title + excerpt + date + read time

BlogDetailScreen:
Route params: { slug }
API: GET /blogs/{slug}

- Full article rendered with react-native-render-html
- Share button (expo-sharing)
- Related articles at bottom
```

---

## Step 3.5 — Notes (CRUD)

```
Screen: NotesScreen
API: GET /notes

Layout:
- Search bar
- Subject filter
- FlashList of NoteCard:
  - Title + excerpt + subject + date
  - Swipe left → delete (with confirmation)
  - Tap → NoteDetailScreen (read-only)
  - Long press → edit

- FAB (Floating Action Button) → NoteEditorScreen

NoteEditorScreen:
- Title input
- Subject selector (optional)
- Multi-line text area
- Save button
- API: POST /notes or PATCH /notes/{id}
```

---

## Phase 3 Checklist

- [ ] CoursesScreen with category tabs
- [ ] SubjectDetailScreen with chapter accordion
- [ ] TopicDetailScreen with materials list
- [ ] SyllabusScreen with full hierarchy tree
- [ ] MaterialsScreen with filters
- [ ] PDF viewer (expo-linking or react-native-pdf)
- [ ] Video player (expo-av with custom controls)
- [ ] MaterialDetailScreen with progress tracking
- [ ] BlogsScreen with list
- [ ] BlogDetailScreen with HTML rendering
- [ ] NotesScreen with search and filters
- [ ] NoteEditorScreen (create/edit)
- [ ] Swipe-to-delete on notes
