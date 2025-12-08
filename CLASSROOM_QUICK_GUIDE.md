# Classroom System - Quick Reference Card

## 🎯 What You Can Do Now

### Teachers
- **Create Classrooms** - Give each a unique 8-char code
- **Invite Students** - Share code for students to join
- **Create Assignments** - Write, set due dates, assign points
- **Grade Work** - See submissions, grade with feedback
- **Track Progress** - View stats (submitted, graded, average grade)

### Students
- **Join Classes** - Enter classroom code
- **Submit Work** - Complete assignments before due date
- **Check Grades** - See feedback from teachers
- **Track Status** - Know which assignments are graded

---

## 📍 Where to Find Things

| Feature | Location |
|---------|----------|
| Teacher Dashboard | `/teacher` |
| Create Classroom | Teacher Dashboard → "Classrooms" tab → "+ New Classroom" |
| Manage Classroom | `/teacher/classroom/:classroomId` |
| Grade Assignments | `/teacher/assignment/:assignmentId` |
| Student Dashboard | `/student` |
| Student Classrooms | `/student/classroom/:classroomId` |
| Submit Assignment | `/student/assignment/:assignmentId` |

---

## 🔑 Key Features

### Classroom Codes
- **Auto-generated** when you create a classroom
- **Unique** - 8 character hex string (e.g., "AB3F7C2D")
- **Shareable** - Give to students so they can join
- **Copy easily** - Click classroom code to copy

### Assignment Status Flow
```
DRAFT (editing)
  ↓ Publish
PUBLISHED (students can submit)
  ↓ Close
CLOSED (no new submissions)
```

### Submission Status Flow
```
DRAFT (student working)
  ↓ Submit
SUBMITTED (waiting for grade)
  ↓ Grade
RETURNED (returned for revision) OR graded
  ↓ Resubmit (if returned)
GRADED
```

---

## 📋 Teacher Checklist

- [ ] Create first classroom
- [ ] Copy classroom code
- [ ] Share code with students
- [ ] Wait for students to join
- [ ] Create first assignment
- [ ] Add due date and point value
- [ ] Publish assignment
- [ ] Review student submissions
- [ ] Grade and add feedback
- [ ] Students see grades

---

## 📋 Student Checklist

- [ ] Get classroom code from teacher
- [ ] Join classroom
- [ ] View available assignments
- [ ] Read assignment details
- [ ] Write and submit response
- [ ] Check if submission accepted
- [ ] Wait for teacher to grade
- [ ] View grade and feedback
- [ ] Resubmit if needed

---

## 🔗 Important URLs

### Teacher
```
/teacher                          Dashboard & classroom management
/teacher/classroom/[id]           Manage specific classroom
/teacher/assignment/[id]          Grade submissions
/teacher/pending                  Activity approvals
```

### Student
```
/student                          Dashboard (unchanged)
/student/classroom/[id]           View classroom & assignments
/student/assignment/[id]          Submit & view assignment
/student/upload                   Activity upload (unchanged)
/student/activities               My activities (unchanged)
/student/profile                  Profile (unchanged)
```

---

## ⚡ Quick Tips

### For Teachers
1. **Draft Mode** - Create assignment in draft, only you see it
2. **Publish When Ready** - Publish to make visible and create submissions
3. **Sharing Code** - The unique code is in the classroom card
4. **Late Tracking** - Auto-marks submissions after due date as "LATE"
5. **Grading** - Must enter both grade and optional feedback

### For Students
1. **Code Entry** - Code is case-sensitive, 8 characters
2. **Due Dates** - See countdown timer on assignment
3. **Resubmit** - If marked "returned", you can submit again
4. **Late Warning** - See red "LATE" indicator on late submissions
5. **Grade Calculation** - Your percentage = (grade / maxPoints) × 100

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Can't find classroom button | Look in "Classrooms" tab on teacher dashboard |
| Student can't join with code | Verify code is exact (case-sensitive), has 8 characters |
| Assignment not visible to students | Make sure it's "PUBLISHED" not "DRAFT" |
| Can't grade submission | Click assignment → student list → grade button |
| Submission shows draft not submitted | Student needs to click "Submit" button |
| Late submission not marked | Check: submitted after due date, system uses server time |

---

## 📊 What Each Role Can Do

```
┌─────────────┬──────────┬──────────┬──────────┐
│ Action      │ Teacher  │ Student  │ Admin    │
├─────────────┼──────────┼──────────┼──────────┤
│ Create room │    ✅    │    ❌    │    ✅    │
│ Join room   │    ❌    │    ✅    │    ❌    │
│ Create asgn │    ✅    │    ❌    │    ❌    │
│ Submit asgn │    ❌    │    ✅    │    ❌    │
│ Grade       │    ✅    │    ❌    │    ❌    │
│ View grades │    ✅    │    ✅    │    ✅    │
└─────────────┴──────────┴──────────┴──────────┘
```

---

## 🎓 Complete Workflow Example

### 1. Teacher Creates Class (Day 1)
```
1. Go to /teacher
2. Click "Classrooms" tab
3. Click "+ New Classroom"
4. Fill: Name="CS101", Section="A", Department="CS"
5. Submit
6. Copy classroom code (e.g., "AB3F7C2D")
7. Share with students via email/announcement
```

### 2. Students Join (Day 2)
```
1. Go to /student
2. See classroom link or navigate to /student/classroom/:id
3. Or use code if needed
4. Classroom appears in their list
```

### 3. Teacher Creates Assignment (Day 3)
```
1. Open classroom (/teacher/classroom/:id)
2. Click "+ New Assignment"
3. Fill: Title, Description, Due Date, Points (e.g., 100)
4. Click "Create Assignment" (saved as DRAFT)
5. Click "Publish" to make visible to students
```

### 4. Students See & Submit (Day 4-5)
```
1. Go to classroom (/student/classroom/:id)
2. See assignment
3. Click assignment or "Submit" button
4. Enter response
5. Click "Submit"
6. See "submitted" status
```

### 5. Teacher Grades (Day 6)
```
1. Go to assignment (/teacher/assignment/:id)
2. See all submissions
3. For each: Enter grade (0-100) and feedback
4. Click "Save Grade"
5. Students notified automatically
```

### 6. Students See Grade (Day 7)
```
1. Go to their submission
2. See grade in green box
3. Read teacher feedback
4. If marked "returned", can resubmit
```

---

## 📱 Responsive Design

All pages work on:
- ✅ Mobile (phones)
- ✅ Tablet
- ✅ Desktop
- ✅ Widescreen

Grid layouts automatically adjust for screen size.

---

## 🔐 Authentication

- ✅ All routes protected by role (teacher/student/admin)
- ✅ Teachers can only grade their own assignments
- ✅ Students only see their own submissions
- ✅ Classroom codes prevent unauthorized access

---

## 💾 Data Persistence

All data is automatically saved:
- ✅ Classrooms stored in database
- ✅ Assignments attached to classrooms
- ✅ Submissions linked to students
- ✅ Grades preserved with timestamps

---

## 🚀 Ready to Go!

Everything is installed and working. Start using it now:

1. **Login** as a teacher
2. **Create** a classroom
3. **Invite** some students
4. **Create** an assignment
5. **Publish** it
6. **Grade** submissions when they come in

That's it! You have a full classroom system. 🎉
