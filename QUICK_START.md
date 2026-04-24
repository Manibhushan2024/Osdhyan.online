# Quick Start Guide - Test Series Platform

## 🎯 What You Can Do Now

### ✅ Admin Features
1. **Create Test Series** → `/admin/test-series`
2. **View All Tests** → `/admin/tests`
3. **Manage Courses** → `/admin/courses`

### ✅ Student Features
1. **Take Tests** → Test Player with fullscreen, pause, and submit
2. **Resume Tests** → Automatically resumes ongoing attempts
3. **View Results** → Complete with sectional breakdown

---

## 🚦 Quick Test

### Test the Admin Test Series
```
1. Open browser: http://localhost:3000/admin/test-series
2. Click "+ Create New Series"
3. Fill form and upload an image
4. Click "Construct Series Vector"
5. ✅ Series should appear in grid
```

### Test the Student Test Player
```
1. Open browser: http://localhost:3000/dashboard/tests/play/1
2. Accept declaration and start test
3. Select an answer
4. ✅ Palette should turn green for that question
5. Click floating Rocket button (bottom-right)
6. Confirm submission
7. ✅ Should redirect to results page
```

---

## 🔧 Troubleshooting

### Images Not Showing?
```bash
cd backend
php artisan storage:link
```

### 404 on Admin Routes?
Check that backend is running:
```bash
cd backend
php artisan serve --port=8000
```

### Frontend Not Loading?
Check that Next.js dev server is running:
```bash
cd apps/portal
npm run dev
```

---

## 📍 Key URLs

| Purpose | URL |
|---------|-----|
| Filament Admin | http://localhost:8000/admin |
| Test Series Manager | http://localhost:3000/admin/test-series |
| Tests Pool | http://localhost:3000/admin/tests |
| Intelligence Hub | http://localhost:3000/admin/courses |
| Student Dashboard | http://localhost:3000/dashboard |
| Test Player | http://localhost:3000/dashboard/tests/play/{id} |

---

## 🎨 UI Overview

### Admin Test Series Page
- **Grid of Cards** with cover images
- **Green Button** = "Create New Series"
- **Badge Colors:**
  - 🟢 Emerald = Published (Live)
  - 🟠 Amber = Draft

### Test Player
- **Top Bar:** Timer + Pause + Submit
- **Left:** Question & Options
- **Right:** Palette (collapsible)
- **Bottom:** Navigation buttons
- **Floating Rocket:** Quick submit (bottom-right corner)

### Question Palette Colors
- ⚪ **Gray/Border:** Not visited yet
- 🔴 **Red:** Visited but not answered
- 🟢 **Green:** Answered
- 🟣 **Purple:** Marked for review
- 🔵 **Blue Ring:** Current question

---

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Can create test series with image upload
2. ✅ Test player opens and timer starts
3. ✅ Selecting option changes palette color to green
4. ✅ Submit button redirects to results page
5. ✅ Closing browser and reopening resumes test
6. ✅ Fullscreen mode works (Maximize button)

---

**All systems operational! 🚀**
