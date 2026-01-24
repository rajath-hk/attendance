const express = require('express');
const router = express.Router();
const { markAttendance, markBulkAttendance, getAttendance, getStudents, getAttendanceDates, getAttendanceSheet } = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/mark', protect, admin, markAttendance);
router.post('/bulk', protect, admin, markBulkAttendance);
router.get('/dates', protect, admin, getAttendanceDates);
router.get('/sheet', protect, admin, getAttendanceSheet);
router.get('/students', protect, admin, getStudents);
router.get('/:studentId', protect, getAttendance);

module.exports = router;
