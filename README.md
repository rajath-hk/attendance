# AMC Attendance System

A full-stack attendance management system built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- Teacher dashboard for marking attendance
- Student dashboard for viewing attendance
- User authentication with JWT
- Calendar view for attendance dates
- Bulk attendance marking

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Seed the database: `npm run data:import`
5. Start the server: `npm run dev`

The app will be available at `http://localhost:5000`

## Database Setup

For online deployment, use Supabase (free tier available):

1. Create account at [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > API to get:
   - Project URL (SUPABASE_URL)
   - Anon public key (SUPABASE_ANON_KEY)
4. Create tables in Supabase SQL Editor:
   ```sql
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     role TEXT DEFAULT 'student',
     roll_number TEXT,
     subject TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE attendance (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     student_id UUID REFERENCES users(id),
     date DATE NOT NULL,
     subject TEXT NOT NULL,
     session TEXT DEFAULT 'Class 1',
     status TEXT NOT NULL,
     marked_by UUID REFERENCES users(id),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
5. Set environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`

## Deployment

This is a full-stack application. GitHub Pages only serves static files and cannot run the Node.js backend. To deploy online:

### Full-Stack Deployment

Deploy to platforms that support Node.js:

- **Render** (recommended for free tier):
  - Connect GitHub repo
  - Set build command: `npm install`
  - Set start command: `npm start`
  - Set environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`, `PORT=10000`
  - Deploy

- **Heroku**:
  - Create app
  - Connect repo or push code
  - Set config vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`
  - Deploy

- **Railway**:
  - Connect repo
  - Set environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `JWT_SECRET`
  - Deploy automatically

The app will be online with persistent database storage.

## Default Users

After seeding:
- Teacher: math@amc.com / password123
- Teacher: physics@amc.com / password123
- Teacher: web@amc.com / password123

## API Endpoints

- POST /api/auth/login - User login
- GET /api/attendance/students - Get all students (teacher)
- POST /api/attendance/bulk - Mark bulk attendance
- GET /api/attendance/:id - Get student's attendance
- And more...

## Technologies Used

- Backend: Node.js, Express, Supabase, JWT
- Frontend: HTML, CSS, JavaScript
- Database: Supabase (PostgreSQL)
