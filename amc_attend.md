# A Skill Development Report on AMC ATTENDANCE MANAGEMENT SYSTEM

**Submitted By:** [Your Name]
**Department:** Master of Computer Applications
**College:** AMC ENGINEERING COLLEGE, BANGALORE

---

## INDEX

1.  **Abstract**
2.  **Introduction**
3.  **Technology Used**
4.  **Constraints Used**
5.  **How It Differs**
6.  **Flowchart**
7.  **Code**
8.  **Screenshots**
9.  **Conclusion**

---

## 1. ABSTRACT

The **AMC Attendance Management System** is a comprehensive web-based application designed to streamline the process of tracking and managing student attendance. Unlike traditional paper-based methods, this digital solution offers real-time data recording, automated calculations, and secure role-based access for both teachers and students.

The system features two distinct dashboards: a **Teacher Dashboard** for marking attendance (Present/Absent) across multiple class sessions, managing student records, and viewing daily summaries; and a **Student Dashboard** for viewing personal attendance history, subject-wise statistics, and overall percentage availability.

Developed using the **MERN Stack (MongoDB, Express, Node.js)** principles with a Vanilla JavaScript frontend, the application ensures data persistence, fast response times, and a responsive user interface. Key features include multi-session support (Class 1, Class 2, Lab), visual calendar integration, and automated percentage calculations, making it an efficient tool for academic monitoring.

---

## 2. INTRODUCTION

In modern educational institutions, maintaining accurate attendance records is crucial for academic discipline and performance evaluation. The **AMC Attendance Management System** addresses the limitations of manual registers—such as data redundancy, calculation errors, and lack of transparency—by digitizing the entire workflow.

This project provides a secure platform where:
*   **Teachers** can easily mark attendance for an entire class in bulk using a streamlined interface.
*   **Students** can track their own attendance in real-time, ensuring they meet the required attendance criteria (e.g., 75%).
*   **Administrators** can ensure data integrity and prevent unauthorized modifications.

The application leverages modern web technologies to provide a seamless experience, including dynamic DOM manipulation for immediate UI updates and RESTful APIs for secure data communication.

---

## 3. TECHNOLOGY USED

### Frontend
*   **HTML (HyperText Markup Language):** Used to structure the web pages, including login forms, dashboards, and data tables. It defines the semantic structure of the content.
*   **CSS (Cascading Style Sheets):** Used for styling the application with a modern, clean UI. Features include:
    *   Responsive Grid/Flexbox layouts.
    *   Custom "Toggle Buttons" for attendance status (Green/Red).
    *   Calendar widget styling.
    *   Interactive hover effects and animations.
*   **JavaScript (Vanilla):** Handles client-side logic, including:
    *   Fetching data from the backend API.
    *   Dynamic rendering of student lists and charts.
    *   Form validation and event handling.
    *   Managing authentication state (JWT storage).

### Backend
*   **Node.js:** A JavaScript runtime environment that executes the backend code, allowing for scalable and non-blocking operations.
*   **Express.js:** A web framework for Node.js used to build RESTful API endpoints (GET, POST) for handling user authentication and attendance operations.

### Database
*   **MongoDB:** A NoSQL database used to store flexible data structures:
    *   **Users Collection:** Stores teacher and student profiles with secure hashed passwords.
    *   **Attendance Collection:** Stores daily attendance records linked to specific students, dates, and sessions.

### Tools
*   **Visual Studio Code:** Primary IDE for development.
*   **Postman:** Used for testing API endpoints.
*   **Git:** Version control system.

---

## 4. CONSTRAINTS USED

To ensure data integrity and security, the system enforces several logical and validation constraints:

1.  **Unique Identity**: Each student is identified by a unique `Roll Number` and `Email`. Duplicate registrations are prevented by the backend.
2.  **Role-Based Access Control (RBAC)**:
    *   **Teachers** can only mark attendance and view all students.
    *   **Students** can only view their *own* records and cannot modify any data.
    *   Access to sensitive pages is protected via JSON Web Tokens (JWT).
3.  **Attendance Rules**:
    *   Attendance is scoped by **Date** and **Session** (e.g., Class 1 vs Class 2).
    *   A student cannot be marked twice for the same session; existing records are updated instead of duplicated.
4.  **Input Validation**:
    *   **Login**: Email must be valid; Password cannot be empty.
    *   **Assessment**: 'Present' or 'Absent' status must be explicitly defined (defaults to Present).
5.  **Subject Scope**:
    *   Attendance statistics shown to a teacher are strictly calculated based on *their* specific subject (e.g., Math Teacher sees only Math attendance).

---

## 5. HOW IT DIFFERS

This system offers several advantages over standard registration or basic data entry forms:

1.  **Multi-Session Architecture**: unlike simple systems that mark "Daily Attendance", this system allows granularity (Class 1, Class 2, Lab), accommodating complex college timetables.
2.  **Visual Analytics**: Instead of raw numbers, the system presents data visually:
    *   **Color-coded Stats**: Green (>75%) vs Red (<75%) indicators instantly alert students/teachers to low attendance.
    *   **Interactive Calendar**: A custom-built calendar highlights days with activity.
3.  **Bulk Actions**: Teachers can mark the entire class in one click (Default "All Present") and only toggle the absentees, significantly reducing data entry time.
4.  **State Persistence**: The system remembers the marked attendance. Navigating back to a previous date correctly loads the historical status for verification.

---

## 6. FLOWCHART

**(This section describes the logical flow of the application)**

1.  **Start** -> **Login Page** (User enters Credentials).
2.  **Authentication Check**:
    *   If Invalid -> Show Error.
    *   If Valid -> Check Role.
3.  **Role Routing**:
    *   **Teacher** -> **Teacher Dashboard**:
        *   Select Date & Session.
        *   Load Student List.
        *   Toggle Present/Absent.
        *   Save -> Update Database.
        *   View Calendar/Stats.
    *   **Student** -> **Student Dashboard**:
        *   Load Profile.
        *   Fetch Personal Attendance History.
        *   Calculate Subject-wise % Stats.
        *   Display Summary Cards.
4.  **End**.

---

## 7. CODE

### 1. Server Setup (server.js)
```javascript
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./backend/config/db');
const authRoutes = require('./backend/routes/authRoutes');
const attendanceRoutes = require('./backend/routes/attendanceRoutes');
const userRoutes = require('./backend/routes/userRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 2. User Controller (authController.js)
```javascript
const registerUser = async (req, res) => {
    const { name, email, password, role, rollNumber, subject } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name, email, password: hashedPassword, role, rollNumber, subject
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};
```

### 3. Attendance Controller (attendanceController.js)
```javascript
// Mark bulk attendance (for multiple students)
const markBulkAttendance = async (req, res) => {
    const { date, records, session } = req.body; 
    const currentSession = session || 'Class 1';

    try {
        const attendanceDate = new Date(date);
        
        const updates = records.map(async (record) => {
            const exists = await Attendance.findOne({
                studentId: record.studentId,
                date: attendanceDate,
                session: currentSession
            });

            if (exists) {
                exists.status = record.status;
                exists.markedBy = req.user._id;
                await exists.save();
            } else {
                await Attendance.create({
                    studentId: record.studentId,
                    date: attendanceDate,
                    status: record.status,
                    markedBy: req.user._id,
                    subject: req.user.subject,
                    session: currentSession
                });
            }
        });

        await Promise.all(updates);
        res.status(200).json({ message: 'Bulk attendance marked successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
```

### 4. Database Model (attendanceModel.js)
```javascript
const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    date: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true,
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    subject: {
        type: String,
        default: 'General'
    },
    session: {
        type: String,
        default: 'Class 1'
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Attendance', attendanceSchema);
```

---

## 8. SCREENSHOTS

*(Insert Screenshots of Login Page, Teacher Dashboard, Student Dashboard, and Mobile View here)*

---

## 9. CONCLUSION

The **AMC Attendance Management System** successfully digitizes the manual attendance process, providing a robust and scalable solution for the institution. By implementing role-based dashboards, multi-session tracking, and real-time visualization, the system reduces administrative workload and improves data accuracy. The use of modern web technologies ensures the application is future-proof and can be easily extended with features like SMS notifications or biometric integration in future iterations.
