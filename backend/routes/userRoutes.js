const express = require('express');
const router = express.Router();
const { addStudent, checkStudent } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/add', protect, admin, addStudent);
router.post('/check', protect, admin, checkStudent);

module.exports = router;
