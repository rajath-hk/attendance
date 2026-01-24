# AMC Attendance Project Documentation

## 1. Project Overview
AMC Attendance is a web-based attendance management system designed for colleges. It allows teachers to digitally mark and track student attendance while providing students with real-time access to their attendance records.

## 2. Technology Stack

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (via Mongoose ODM)
*   **Authentication**: JSON Web Tokens (JWT) + Bcrypt for password hashing
*   **Dependencies**: `express`, `mongoose`, `dotenv`, `cors`, `date-fns`, `jsonwebtoken`, `bcryptjs`

### Frontend
*   **Core**: HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Design**: Custom CSS with Glassmorphism elements (Login) and clean Dashboard UI.
*   **Font**: Inter (Google Fonts)
*   **Icons**: None (Pure CSS/Text)

## 3. Directory Structure

```
amc-attendance/
├── backend/
│   ├── config/          # DB connection logic (db.js)
│   ├── controllers/     # Business logic (auth, attendance, user)
│   ├── middleware/      # Auth protection middleware
│   ├── models/          # Mongoose Schemas (User, Attendance)
│   ├── routes/          # API Route definitions
│   └── seeder.js        # Script to seed/destroy database data
├── frontend/
│   ├── assets/          # Static assets (bg video)
│   ├── css/             # Stylesheets (style, calendar, toggle)
│   ├── js/              # Application logic (app.js)
│   ├── index.html       # Login Page
│   ├── dashboard-student.html # Student Interface
│   └── dashboard-teacher.html # Teacher Interface
├── package.json         # Project dependencies and scripts
└── server.js            # Backend entry point
```

## 4. Features & Functionality

### 4.1. Authentication
*   **Login**: Single login page for both Students and Teachers.
*   **Roles**:
    *   **Teacher**: Full access to manage students and mark attendance.
    *   **Student**: Read-only access to their own records.
*   **Security**: Passwords are hashed. Sessions are managed via JWT stored in LocalStorage.

### 4.2. Teacher Dashboard
*   **Calendar View**: Visual calendar to navigate between dates.
*   **Bulk Attendance**: Mark entire class as Present/Absent in one go using toggle buttons.
*   **Session Support**: Support for multiple sessions per day (Class 1-7, Lab, Extra).
*   **Student Management**: Add new students directly from the dashboard (checks for duplicate Roll Numbers).
*   **Stats**: View real-time attendance percentage for each student in the list.

### 4.3. Student Dashboard
*   **Personal Stats**: View overall attendance percentage.
*   **Subject Breakdown**: Detailed stats per subject.
*   **History**: List of all past attendance records with dates and status.

## 5. API Endpoints

### Auth (`/api/auth`)
*   `POST /login`: Authenticate user and return token + role.

### Users (`/api/users`)
*   `POST /add`: Create a new student (Teacher only).
*   `POST /check`: Check if a Roll Number already exists.

### Attendance (`/api/attendance`)
*   `GET /students`: Get list of all students with their stats.
*   `GET /sheet`: Get attendance status for a specific Date + Session.
*   `POST /bulk`: Save/Update attendance for multiple students.
*   `GET /dates`: Get a list of all dates that have attendance marked.
*   `GET /:id`: Get attendance history for a specific student.

## 6. Setup & Installation

### Prerequisites
*   Node.js installed.
*   MongoDB installed and running locally (or a cloud URI).

### Steps
1.  **Clone/Download** the project.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root if not present (default config provided in code for dev).
4.  **Seed Data** (Optional - for testing):
    ```bash
    npm run data:import
    ```
    *(Creates Admin Teacher: `admin@school.com` / `123456`)*
5.  **Start Server**:
    ```bash
    npm start
    ```
    *Runs backend at port 5000.*
6.  **Run Frontend**:
    Open `frontend/index.html` in your browser (or use Live Server).

## 7. Configuration Details
*   **Database**: Connects to `mongodb://127.0.0.1:27017/amc_attendance` by default.
*   **Port**: Backend runs on `5000`. Frontend expects this URL (configured in `app.js`).
