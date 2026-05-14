const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Private/Teacher
const markAttendance = async (req, res) => {
    try {
        const { studentId, date, status } = req.body;

        const student = await User.findById(studentId);

        if (!student || student.role !== 'student') {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if exists (simplified, assuming no duplicate)
        const attendance = await Attendance.create({
            studentId,
            date: new Date(date),
            status,
            markedBy: req.user.id,
            subject: req.user.subject || 'General'
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for a student
// @route   GET /api/attendance/:studentId
// @access  Private (Teacher can view all, Student can view own)
const getAttendance = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Check access
        if (req.user.role !== 'teacher' && req.user.id !== studentId) {
            return res.status(401).json({ message: 'Not authorized to view this record' });
        }

        const attendance = await Attendance.findByStudentAndDateRange(studentId, '1900-01-01', '2100-01-01');
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark bulk attendance (for multiple students)
// @route   POST /api/attendance/bulk
// @access  Private/Teacher
const markBulkAttendance = async (req, res) => {
    const { date, records, session } = req.body; // records: [{ studentId, status }], session: 'Class 1'

    if (!records || records.length === 0) {
        return res.status(400).json({ message: 'No records provided' });
    }

    const currentSession = session || 'Class 1';

    try {
        const attendances = records.map(record => ({
            studentId: record.studentId,
            date: new Date(date),
            status: record.status,
            markedBy: req.user.id,
            subject: req.user.subject || 'General',
            session: currentSession
        }));

        await Attendance.bulkInsert(attendances);
        res.status(200).json({ message: 'Bulk attendance marked successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error marking bulk attendance' });
    }
};

// @desc    Get all students with stats (total days, present days, %) for the TEACHER'S SUBJECT
// @route   GET /api/users/students
// @access  Private/Teacher
const getStudents = async (req, res) => {
    try {
        const students = await User.findAllStudents();
        const teacherSubject = req.user.subject || 'General';

        // For simplicity, return without detailed stats for now
        // In Supabase, stats calculation would need views or complex queries
        const studentsWithStats = students.map(student => ({
            ...student,
            _id: student.id,
            rollNumber: student.roll_number,
            stats: {
                percentage: 0, // Placeholder
                present: 0,
                total: 0
            }
        }));

        res.json(studentsWithStats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching students' });
    }
};

// @desc    Get attendance sheet for a specific date and session
// @route   GET /api/attendance/sheet
// @access  Private/Teacher
const getAttendanceSheet = async (req, res) => {
    const { date, session } = req.query;

    if (!date) {
        return res.status(400).json({ message: 'Date is required' });
    }

    try {
        const records = await Attendance.findByDateAndSession(date, session || 'Class 1');
        res.json(records.map(r => ({ studentId: r.student_id, status: r.status })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching sheet' });
    }
};

// @desc    Get dates with attendance for current teacher
// @route   GET /api/attendance/dates
// @access  Private/Teacher
const getAttendanceDates = async (req, res) => {
    try {
        const dates = await Attendance.findDistinctDates();
        res.json(dates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dates' });
    }
};

module.exports = { markAttendance, markBulkAttendance, getAttendance, getStudents, getAttendanceDates, getAttendanceSheet };
