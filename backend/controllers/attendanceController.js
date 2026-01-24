const Attendance = require('../models/attendanceModel');
const User = require('../models/userModel');

// @desc    Mark attendance
// @route   POST /api/attendance/mark
// @access  Private/Teacher
const markAttendance = async (req, res) => {
    const { studentId, date, status } = req.body;

    const student = await User.findById(studentId);

    if (!student || student.role !== 'student') {
        return res.status(404).json({ message: 'Student not found' });
    }

    const attendanceExists = await Attendance.findOne({
        studentId,
        date: new Date(date),
    });

    if (attendanceExists) {
        return res.status(400).json({ message: 'Attendance already marked for this date' });
    }

    const attendance = await Attendance.create({
        studentId,
        date: new Date(date),
        status,
        markedBy: req.user._id,
    });

    res.status(201).json(attendance);
};

// @desc    Get attendance for a student
// @route   GET /api/attendance/:studentId
// @access  Private (Teacher can view all, Student can view own)
const getAttendance = async (req, res) => {
    const studentId = req.params.studentId;

    // Check access
    if (req.user.role !== 'teacher' && req.user._id.toString() !== studentId) {
        return res.status(401).json({ message: 'Not authorized to view this record' });
    }

    const attendance = await Attendance.find({ studentId }).sort({ date: -1 });
    res.json(attendance);
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
        const attendanceDate = new Date(date);

        // Use Promise.all for parallel operations (or bulkWrite for efficiency, but loop is simpler for now)
        const updates = records.map(async (record) => {
            // Check if exists
            const exists = await Attendance.findOne({
                studentId: record.studentId,
                date: attendanceDate,
                session: currentSession
            });

            if (exists) {
                // Update
                if (exists.status !== record.status) {
                    exists.status = record.status;
                    exists.markedBy = req.user._id;
                    exists.subject = req.user.subject;
                    await exists.save();
                }
            } else {
                // Create
                await Attendance.create({
                    studentId: record.studentId,
                    date: attendanceDate,
                    status: record.status,
                    markedBy: req.user._id,
                    subject: req.user.subject || 'General',
                    session: currentSession
                });
            }
        });

        await Promise.all(updates);
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
        const students = await User.find({ role: 'student' }).select('-password').lean();
        const teacherSubject = req.user.subject || 'General';

        // Calculate stats for each student scoped to the teacher's subject
        const studentsWithStats = await Promise.all(students.map(async (student) => {
            // Count total classes for THIS subject
            const total = await Attendance.countDocuments({
                studentId: student._id,
                subject: teacherSubject
            });

            // Count present days for THIS subject
            const present = await Attendance.countDocuments({
                studentId: student._id,
                status: 'Present',
                subject: teacherSubject
            });

            return {
                ...student,
                stats: {
                    total,
                    present,
                    absent: total - present,
                    percentage: total === 0 ? 0 : Math.round((present / total) * 100)
                }
            };
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
        const query = {
            date: new Date(date),
            markedBy: req.user._id,
        };

        if (session) {
            query.session = session;
        }

        const records = await Attendance.find(query).select('studentId status');
        res.json(records);
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
        // Distinct dates where markedBy is current user
        const dates = await Attendance.find({ markedBy: req.user._id }).distinct('date');
        res.json(dates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dates' });
    }
};

module.exports = { markAttendance, markBulkAttendance, getAttendance, getStudents, getAttendanceDates, getAttendanceSheet };
