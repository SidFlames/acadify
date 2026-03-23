-- ======================
-- DATABASE
-- ======================
CREATE DATABASE IF NOT EXISTS Acadify;
USE Acadify;

-- ======================
-- TABLE CREATION
-- ======================

CREATE TABLE Admin (
    Admin_ID INT PRIMARY KEY,
    Name VARCHAR(50),
    Email VARCHAR(100) UNIQUE,
    Password VARCHAR(50)
);

CREATE TABLE Department (
    Department_ID INT PRIMARY KEY,
    Department_Name VARCHAR(50) NOT NULL
);

CREATE TABLE Course (
    Course_ID INT PRIMARY KEY,
    Course_Name VARCHAR(50),
    Duration VARCHAR(20),
    Department_ID INT,
    FOREIGN KEY (Department_ID) REFERENCES Department(Department_ID)
);

CREATE TABLE Teacher (
    Teacher_ID INT PRIMARY KEY,
    Name VARCHAR(50),
    Email VARCHAR(100),
    Phone VARCHAR(15)
);

CREATE TABLE Student (
    Student_ID INT PRIMARY KEY,
    Name VARCHAR(50),
    Email VARCHAR(100) UNIQUE,
    Phone VARCHAR(15),
    Department_ID INT,
    Course_ID INT,
    FOREIGN KEY (Department_ID) REFERENCES Department(Department_ID),
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID)
);

CREATE TABLE Subject (
    Subject_ID INT PRIMARY KEY,
    Subject_Name VARCHAR(50),
    Course_ID INT,
    Teacher_ID INT,
    FOREIGN KEY (Course_ID) REFERENCES Course(Course_ID),
    FOREIGN KEY (Teacher_ID) REFERENCES Teacher(Teacher_ID)
);

CREATE TABLE Attendance (
    Attendance_ID INT PRIMARY KEY,
    Student_ID INT,
    Subject_ID INT,
    Date DATE,
    Status VARCHAR(10),
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID),
    FOREIGN KEY (Subject_ID) REFERENCES Subject(Subject_ID)
);

CREATE TABLE Assignment (
    Assignment_ID INT PRIMARY KEY,
    Subject_ID INT,
    Teacher_ID INT,
    Title VARCHAR(100),
    Description TEXT,
    Due_Date DATE,
    FOREIGN KEY (Subject_ID) REFERENCES Subject(Subject_ID),
    FOREIGN KEY (Teacher_ID) REFERENCES Teacher(Teacher_ID)
);

CREATE TABLE Submission (
    Submission_ID INT PRIMARY KEY,
    Assignment_ID INT,
    Student_ID INT,
    File_Path VARCHAR(255),
    Submission_Date DATE,
    Marks INT,
    FOREIGN KEY (Assignment_ID) REFERENCES Assignment(Assignment_ID),
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID)
);

CREATE TABLE Exam (
    Exam_ID INT PRIMARY KEY,
    Subject_ID INT,
    Exam_Date DATE,
    Total_Marks INT,
    FOREIGN KEY (Subject_ID) REFERENCES Subject(Subject_ID)
);

CREATE TABLE Marks (
    Marks_ID INT PRIMARY KEY,
    Exam_ID INT,
    Student_ID INT,
    Marks_Obtained INT,
    Grade VARCHAR(5),
    FOREIGN KEY (Exam_ID) REFERENCES Exam(Exam_ID),
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID)
);

CREATE TABLE Notification (
    Notification_ID INT PRIMARY KEY,
    Sender_ID INT,
    Sender_Role VARCHAR(20),
    Receiver_ID INT,
    Receiver_Role VARCHAR(20),
    Message TEXT,
    Date DATE
);

-- ======================
-- DATA INSERTION
-- ======================

INSERT INTO Department VALUES
(1, 'Computer Science'),
(2, 'Mathematics'),
(3, 'Physics'),
(4, 'Commerce'),
(5, 'English'),
(6, 'Economics'),
(7, 'Geography');

INSERT INTO Course VALUES
(101, 'BSc CS', '3 Years', 1),
(102, 'BSc Maths', '3 Years', 2),
(103, 'BSc Physics', '3 Years', 3),
(104, 'BCom', '3 Years', 4),
(105, 'BA English', '3 Years', 5),
(106, 'BA Economics', '3 Years', 6),
(107, 'BA Geography', '3 Years', 7);

INSERT INTO Teacher VALUES
(1, 'Mr. Sharma', 'sharma@gmail.com', '9999999999'),
(2, 'Ms. Gupta', 'gupta@gmail.com', '9876543210'),
(3, 'Mr. Verma', 'verma@gmail.com', '9123456780'),
(4, 'Ms. Iyer', 'iyer@gmail.com', '9988776655'),
(5, 'Mr. Khan', 'khan@gmail.com', '9090909090'),
(6, 'Ms. Das', 'das@gmail.com', '9012345678');

INSERT INTO Student VALUES
(1, 'Rahul', 'rahul@gmail.com', '8888888888', 1, 101),
(2, 'Amit', 'amit@gmail.com', '7777777777', 2, 102),
(3, 'Sneha', 'sneha@gmail.com', '7666666666', 3, 103),
(4, 'Riya', 'riya@gmail.com', '7555555555', 4, 104),
(5, 'Karan', 'karan@gmail.com', '7444444444', 5, 105),
(6, 'Neha', 'neha@gmail.com', '7333333333', 6, 106),
(7, 'Devyash', 'devyash@gmail.com', '7222222222', 1, 101),
(8, 'Humble', 'humble@gmail.com', '7111111111', 1, 101),
(9, 'Sanjoli', 'sanjoli@gmail.com', '7000000000', 7, 107),
(10, 'Maanshi', 'maanshi@gmail.com', '6999999999', 7, 107);

INSERT INTO Subject VALUES
(1, 'DBMS', 101, 1),
(2, 'Algebra', 102, 2),
(3, 'Mechanics', 103, 3),
(4, 'Accounting', 104, 4),
(5, 'Literature', 105, 5),
(6, 'Microeconomics', 106, 6),
(7, 'Physical Geography', 107, 2);

-- ======================
-- IMPORTANT: ADMIN LOGIN
-- ======================

INSERT INTO Admin VALUES
(1, 'Admin', 'admin@gmail.com', '1234');