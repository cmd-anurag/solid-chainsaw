# Google Classroom-Like Assignment System Implementation Guide

This guide explains how to integrate the classroom assignment system into your web application. The system allows teachers to create classrooms, assign assignments, and grade student submissions.

## 📋 Overview

The assignment system includes three main features:

1. **Classrooms** - Virtual learning spaces where teachers manage students
2. **Assignments** - Tasks created by teachers with due dates and point values
3. **Submissions** - Student responses that teachers can grade

## 🗄️ Database Models

### Classroom Model (`server/src/models/Classroom.js`)
Represents a virtual classroom for a section/department.

**Fields:**
- `name` - Classroom name
- `description` - Description of the classroom
- `section` - Section/batch identifier
- `department` - Department name
- `teacher` - Reference to the teacher (User)
- `students` - Array of student references (User)
- `code` - Unique 8-character code for joining
- `status` - 'active' or 'archived'

### Assignment Model (`server/src/models/Assignment.js`)
Represents a task assigned to students.

**Fields:**
- `title` - Assignment title
- `description` - Detailed description
- `classroom` - Reference to Classroom
- `teacher` - Reference to the teacher
- `dueDate` - Due date and time
- `maxPoints` - Total points possible
- `instructions` - Detailed instructions
- `attachments` - Array of files
- `status` - 'draft', 'published', or 'closed'

### Submission Model (`server/src/models/Submission.js`)
Represents a student's submission for an assignment.

**Fields:**
- `assignment` - Reference to Assignment
- `student` - Reference to the student (User)
- `classroom` - Reference to Classroom
- `content` - Submission content/text
- `attachments` - Submitted files
- `submittedAt` - Submission timestamp
- `isLate` - Boolean if submitted after due date
- `status` - 'draft', 'submitted', or 'returned'
- `grade` - Numeric grade
- `feedback` - Teacher feedback
- `gradedBy` - Reference to teacher who graded

## 🔄 API Endpoints

### Classroom Endpoints

**Create Classroom** (Teacher Only)
```
POST /api/classrooms
Body: { name, description, section, department }
Returns: Classroom object with unique code
```

**Get Teacher's Classrooms**
```
GET /api/classrooms/teacher/all
Returns: Array of classrooms taught by current user
```

**Get Student's Classrooms**
```
GET /api/classrooms/student/all
Returns: Array of classrooms the student is enrolled in
```

**Get Single Classroom**
```
GET /api/classrooms/:id
Returns: Classroom details with all students and teacher
```

**Join Classroom** (Student Only)
```
POST /api/classrooms/join/code
Body: { code }
Returns: Updated classroom with student added
```

**Add Student** (Teacher Only)
```
POST /api/classrooms/:id/add-student
Body: { classroomId, studentId }
Returns: Updated classroom
```

**Remove Student** (Teacher Only)
```
POST /api/classrooms/:id/remove-student
Body: { classroomId, studentId }
Returns: Updated classroom
```

### Assignment Endpoints

**Create Assignment** (Teacher Only)
```
POST /api/assignments
Body: { title, description, classroomId, dueDate, maxPoints, instructions }
Returns: Assignment object (status: draft)
```

**Get Classroom Assignments**
```
GET /api/assignments/classroom/:classroomId
Returns: Array of assignments in classroom
```

**Get Assignment Details**
```
GET /api/assignments/:id
Returns: Single assignment with all details
```

**Update Assignment** (Teacher Only, draft only)
```
PUT /api/assignments/:id
Body: { title, description, ... }
Returns: Updated assignment
```

**Publish Assignment** (Teacher Only)
```
PUT /api/assignments/:id/publish
Returns: Published assignment, creates draft submissions for all students
```

**Close Assignment** (Teacher Only)
```
PUT /api/assignments/:id/close
Returns: Closed assignment
```

**Delete Assignment** (Teacher Only)
```
DELETE /api/assignments/:id
Deletes all associated submissions
```

### Submission Endpoints

**Submit Assignment** (Student Only)
```
POST /api/submissions
Body: { assignmentId, content }
Returns: Submission object
```

**Get Submission**
```
GET /api/submissions/:id
Returns: Submission with student, assignment details
```

**Get Assignment Submissions** (Teacher Only)
```
GET /api/submissions/assignment/:assignmentId/all
Returns: Array of all submissions for assignment
```

**Get Student's Submissions**
```
GET /api/submissions/classroom/:classroomId
Returns: Student's submissions in classroom
```

**Grade Submission** (Teacher Only)
```
PUT /api/submissions/:id/grade
Body: { grade, feedback }
Returns: Graded submission, notifies student
```

**Return Submission** (Teacher Only)
```
PUT /api/submissions/:id/return
Body: { feedback }
Returns: Submission marked as 'returned'
```

**Get Grading Summary** (Teacher Only)
```
GET /api/submissions/assignment/:assignmentId/summary
Returns: Statistics and list of all submissions
```

## 🎨 Frontend Components

### ClassroomList Component
`client/src/components/Classroom/ClassroomList.jsx`

**Features:**
- List all classrooms (teacher's or student's)
- Create new classroom (teachers)
- Join classroom with code (students)
- Navigate to individual classroom

**Usage:**
```jsx
import ClassroomList from './components/Classroom/ClassroomList';

<ClassroomList userRole={userRole} />
```

### AssignmentList Component
`client/src/components/Classroom/AssignmentList.jsx`

**Features:**
- Display all assignments in a classroom
- Create new assignment (teachers)
- View assignment details
- Delete draft assignments

**Usage:**
```jsx
import AssignmentList from './components/Classroom/AssignmentList';

<AssignmentList userRole={userRole} />
```

### AssignmentDetail Component
`client/src/components/Classroom/AssignmentDetail.jsx`

**Features:**
- View full assignment details
- Submit assignment (students)
- View/manage submissions (teachers)
- Grade submissions with feedback
- Track late submissions
- View submission history

**Usage:**
```jsx
import AssignmentDetail from './components/Classroom/AssignmentDetail';

<AssignmentDetail userRole={userRole} />
```

## 🔐 Permissions

**Teachers can:**
- Create classrooms
- Add/remove students
- Create, edit (draft only), publish, and close assignments
- View all submissions
- Grade submissions
- Provide feedback
- Archive classrooms

**Students can:**
- Join classrooms with code
- View classroom assignments
- Submit assignments
- View their own submissions
- See grades and feedback
- Resubmit after being returned

**Admins can:** (extend as needed)
- View all classrooms and assignments
- Monitor system analytics

## 📝 Integration Steps

1. **Register Routes** - Already done in `server/src/index.js`
   ```javascript
   app.use('/api/classrooms', require('./routes/classroomRoutes'));
   app.use('/api/assignments', require('./routes/assignmentRoutes'));
   app.use('/api/submissions', require('./routes/submissionRoutes'));
   ```

2. **Create Navigation** - Add links to your main navigation:
   ```jsx
   {userRole === 'teacher' && <Link to="/classrooms">Classrooms</Link>}
   {userRole === 'student' && <Link to="/classrooms">My Classrooms</Link>}
   ```

3. **Add Routes in React** - Update your routing configuration:
   ```jsx
   <Route path="/classrooms" element={<ClassroomList userRole={userRole} />} />
   <Route path="/classroom/:classroomId" element={<ClassroomDetail userRole={userRole} />} />
   <Route path="/assignment/:assignmentId" element={<AssignmentDetail userRole={userRole} />} />
   ```

4. **Run Database Migrations** - If using Prisma:
   ```bash
   npx prisma migrate dev --name add-classroom-system
   ```

5. **Start Your Server** - Test the endpoints
   ```bash
   npm run dev
   ```

## 💡 Usage Workflow

### Teacher Workflow
1. Create a classroom (automatically gets unique code)
2. Share classroom code with students
3. Create assignments with due dates
4. Publish assignments when ready
5. View student submissions as they come in
6. Grade submissions with feedback
7. Close assignments after due date

### Student Workflow
1. Join classroom using the code from teacher
2. View assignments in the classroom
3. Click "Submit Assignment"
4. Enter response content
5. Submit and see confirmation
6. View grades and feedback when graded
7. Resubmit if returned for revision

## 🔔 Notifications

When integrated with your notification system, the following events trigger notifications:

- **Student submits assignment** → Teacher notified
- **Submission is graded** → Student notified with grade/score
- **Submission returned for revision** → Student notified with feedback

## 🚀 Future Enhancements

1. **File Attachments** - Add file upload for assignments and submissions
2. **Rubrics** - Create detailed grading rubrics
3. **Class Discussions** - Add discussion forums per assignment
4. **Peer Review** - Allow students to review each other's work
5. **Bulk Operations** - Bulk add students, publish multiple assignments
6. **Due Date Reminders** - Automatic notifications before due date
7. **Grade Statistics** - Class performance analytics
8. **Assignment Templates** - Save and reuse assignment templates
9. **Comments** - Detailed feedback with inline comments
10. **Plagiarism Detection** - Integration with plagiarism checkers

## 🐛 Troubleshooting

**Classroom code not working:**
- Ensure code is entered exactly (case-sensitive)
- Verify classroom exists and is active

**Assignment not showing for students:**
- Assignment must be 'published' status
- Student must be in the classroom

**Can't submit assignment:**
- Assignment must be in 'published' status
- Assignment must have a future due date (or currently open)

**Grade submission not working:**
- Ensure you're a teacher of the classroom
- Grade must be between 0 and maxPoints

## 📚 Related Documentation

- [Student Dashboard Documentation](./STUDENT_DASHBOARD_IMPROVEMENTS.md)
- [Advanced Features](./ADVANCED_FEATURES.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
