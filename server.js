const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── DB CONFIG ─────────────────────────────────────────────────────────────
const dbConfig = {
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'Acadify',
};

async function getDb() {
  return mysql.createConnection(dbConfig);
}

// ─── AUTH ───────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const db = await getDb();
    if (role === 'admin') {
      const [rows] = await db.execute(
        'SELECT * FROM Admin WHERE Email=? AND Password=?', [email, password]
      );
      if (rows.length) return res.json({ ok: true, user: rows[0], role: 'admin' });
    } else if (role === 'teacher') {
      const [rows] = await db.execute(
        'SELECT * FROM Teacher WHERE Email=?', [email]
      );
      if (rows.length) return res.json({ ok: true, user: rows[0], role: 'teacher' });
    } else if (role === 'student') {
      const [rows] = await db.execute(
        'SELECT s.*, d.Department_Name, c.Course_Name FROM Student s JOIN Department d ON s.Department_ID=d.Department_ID JOIN Course c ON s.Course_ID=c.Course_ID WHERE s.Email=?', [email]
      );
      if (rows.length) return res.json({ ok: true, user: rows[0], role: 'student' });
    }
    res.json({ ok: false, error: 'Invalid credentials' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
app.get('/api/admin/stats', async (req, res) => {
  try {
    const db = await getDb();
    const [[{ students }]] = await db.execute('SELECT COUNT(*) students FROM Student');
    const [[{ teachers }]] = await db.execute('SELECT COUNT(*) teachers FROM Teacher');
    const [[{ courses }]] = await db.execute('SELECT COUNT(*) courses FROM Course');
    const [[{ depts }]] = await db.execute('SELECT COUNT(*) depts FROM Department');
    res.json({ students, teachers, courses, depts });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/recent-students', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT s.Student_ID, s.Name, s.Email, s.Phone,
             d.Department_Name, c.Course_Name
      FROM Student s
      JOIN Department d ON s.Department_ID=d.Department_ID
      JOIN Course c ON s.Course_ID=c.Course_ID
      LIMIT 5
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/departments', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT d.Department_ID, d.Department_Name,
             COUNT(DISTINCT s.Student_ID) AS students,
             COUNT(DISTINCT c.Course_ID) AS courses
      FROM Department d
      LEFT JOIN Student s ON s.Department_ID=d.Department_ID
      LEFT JOIN Course c ON c.Department_ID=d.Department_ID
      GROUP BY d.Department_ID, d.Department_Name
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/notifications', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(
      'SELECT * FROM Notification ORDER BY Date DESC LIMIT 5'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── STUDENTS ────────────────────────────────────────────────────────────────
app.get('/api/students', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT s.Student_ID, s.Name, s.Email, s.Phone,
             d.Department_Name, c.Course_Name
      FROM Student s
      JOIN Department d ON s.Department_ID=d.Department_ID
      JOIN Course c ON s.Course_ID=c.Course_ID
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/students', async (req, res) => {
  const { name, email, phone, department_id, course_id } = req.body;
  try {
    const db = await getDb();
    const [[{ maxId }]] = await db.execute('SELECT COALESCE(MAX(Student_ID),0)+1 AS maxId FROM Student');
    await db.execute(
      'INSERT INTO Student VALUES (?,?,?,?,?,?)',
      [maxId, name, email, phone, department_id, course_id]
    );
    res.json({ ok: true, id: maxId });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.execute('DELETE FROM Student WHERE Student_ID=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// ─── TEACHERS ────────────────────────────────────────────────────────────────
app.get('/api/teachers', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT t.Teacher_ID, t.Name, t.Email, t.Phone,
             GROUP_CONCAT(s.Subject_Name SEPARATOR ', ') AS subjects
      FROM Teacher t
      LEFT JOIN Subject s ON s.Teacher_ID=t.Teacher_ID
      GROUP BY t.Teacher_ID
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── COURSES ─────────────────────────────────────────────────────────────────
app.get('/api/courses', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT c.Course_ID, c.Course_Name, c.Duration, d.Department_Name,
             COUNT(s.Student_ID) AS student_count
      FROM Course c
      JOIN Department d ON c.Department_ID=d.Department_ID
      LEFT JOIN Student s ON s.Course_ID=c.Course_ID
      GROUP BY c.Course_ID
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Departments list for dropdowns
app.get('/api/departments', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute('SELECT * FROM Department');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── TEACHER ROUTES ──────────────────────────────────────────────────────────
// Subjects for a teacher
app.get('/api/teacher/:id/subjects', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT s.Subject_ID, s.Subject_Name, c.Course_Name
      FROM Subject s JOIN Course c ON s.Course_ID=c.Course_ID
      WHERE s.Teacher_ID=?
    `, [req.params.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Students for a subject (for attendance)
app.get('/api/subject/:id/students', async (req, res) => {
  try {
    const db = await getDb();
    const [[sub]] = await db.execute('SELECT Course_ID FROM Subject WHERE Subject_ID=?', [req.params.id]);
    const [rows] = await db.execute(
      'SELECT Student_ID, Name, Email FROM Student WHERE Course_ID=?', [sub.Course_ID]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Mark attendance
app.post('/api/attendance', async (req, res) => {
  const { records } = req.body; // [{student_id, subject_id, date, status}]
  try {
    const db = await getDb();
    const [[{ maxId }]] = await db.execute('SELECT COALESCE(MAX(Attendance_ID),0) AS maxId FROM Attendance');
    let id = maxId + 1;
    for (const r of records) {
      // Upsert: delete existing then insert
      await db.execute(
        'DELETE FROM Attendance WHERE Student_ID=? AND Subject_ID=? AND Date=?',
        [r.student_id, r.subject_id, r.date]
      );
      await db.execute(
        'INSERT INTO Attendance VALUES (?,?,?,?,?)',
        [id++, r.student_id, r.subject_id, r.date, r.status]
      );
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Assignments for a teacher
app.get('/api/teacher/:id/assignments', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT a.*, s.Subject_Name FROM Assignment a
      JOIN Subject s ON a.Subject_ID=s.Subject_ID
      WHERE a.Teacher_ID=?
      ORDER BY a.Due_Date
    `, [req.params.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create assignment
app.post('/api/assignments', async (req, res) => {
  const { subject_id, teacher_id, title, description, due_date } = req.body;
  try {
    const db = await getDb();
    const [[{ maxId }]] = await db.execute('SELECT COALESCE(MAX(Assignment_ID),0)+1 AS maxId FROM Assignment');
    await db.execute(
      'INSERT INTO Assignment VALUES (?,?,?,?,?,?)',
      [maxId, subject_id, teacher_id, title, description, due_date]
    );
    res.json({ ok: true, id: maxId });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Submissions for an assignment
app.get('/api/assignment/:id/submissions', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT sub.*, s.Name AS Student_Name FROM Submission sub
      JOIN Student s ON sub.Student_ID=s.Student_ID
      WHERE sub.Assignment_ID=?
    `, [req.params.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Grade submission
app.put('/api/submission/:id/grade', async (req, res) => {
  const { marks } = req.body;
  try {
    const db = await getDb();
    await db.execute('UPDATE Submission SET Marks=? WHERE Submission_ID=?', [marks, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Marks entry
app.post('/api/marks', async (req, res) => {
  const { exam_id, student_id, marks_obtained, grade } = req.body;
  try {
    const db = await getDb();
    const [[{ maxId }]] = await db.execute('SELECT COALESCE(MAX(Marks_ID),0)+1 AS maxId FROM Marks');
    await db.execute(
      'INSERT INTO Marks VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE Marks_Obtained=?, Grade=?',
      [maxId, exam_id, student_id, marks_obtained, grade, marks_obtained, grade]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// Exams for teacher's subjects
app.get('/api/teacher/:id/exams', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT e.*, s.Subject_Name FROM Exam e
      JOIN Subject s ON e.Subject_ID=s.Subject_ID
      WHERE s.Teacher_ID=?
    `, [req.params.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── STUDENT ROUTES ───────────────────────────────────────────────────────────
// Student attendance summary
app.get('/api/student/:id/attendance', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT sub.Subject_Name,
             COUNT(*) AS total,
             SUM(a.Status='Present') AS present
      FROM Attendance a
      JOIN Subject sub ON a.Subject_ID=sub.Subject_ID
      WHERE a.Student_ID=?
      GROUP BY sub.Subject_ID
    `, [req.params.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Student assignments
app.get('/api/student/:id/assignments', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT a.*, s.Subject_Name,
             sub.Submission_ID, sub.Marks, sub.Submission_Date
      FROM Assignment a
      JOIN Subject s ON a.Subject_ID=s.Subject_ID
      JOIN Student st ON st.Course_ID=s.Course_ID AND st.Student_ID=?
      LEFT JOIN Submission sub ON sub.Assignment_ID=a.Assignment_ID AND sub.Student_ID=?
      ORDER BY a.Due_Date
    `, [req.params.id, req.params.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Student marks
app.get('/api/student/:id/marks', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(`
      SELECT m.Marks_Obtained, m.Grade, e.Exam_Date, e.Total_Marks,
             s.Subject_Name
      FROM Marks m
      JOIN Exam e ON m.Exam_ID=e.Exam_ID
      JOIN Subject s ON e.Subject_ID=s.Subject_ID
      WHERE m.Student_ID=?
    `, [req.params.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Acadify backend running on http://localhost:${PORT}`));
