# Acadify — Full Stack Setup

## Folder Structure
```
acadify-backend/
  server.js          ← Express backend
  package.json
  public/
    index.html       ← Full frontend (served by Express)
```

## 1. Import the Database
Open MySQL Workbench / phpMyAdmin / terminal and run:
```sql
source /path/to/Acadify.sql
```
Or paste the SQL file contents directly.

## 2. Configure DB credentials
Open `server.js` and update lines 11–13:
```js
host: 'localhost',
user: 'root',       // your MySQL username
password: '',       // your MySQL password
```

## 3. Install & Run
```bash
cd acadify-backend
npm install
node server.js
```
Then open: **http://localhost:3000**

## 4. Login Credentials
| Role    | Email               | Password |
|---------|---------------------|----------|
| Admin   | admin@gmail.com     | 1234     |
| Teacher | sharma@gmail.com    | (any)    |
| Student | rahul@gmail.com     | (any)    |

## Features (Live from DB)
- **Admin**: Real student/teacher/course/department counts from DB; add & delete students
- **Teacher**: Mark attendance (saves to Attendance table); create assignments; view exams
- **Student**: See real attendance %, assignments with submission status, marks & grades
