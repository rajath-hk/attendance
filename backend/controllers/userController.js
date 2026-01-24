const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// @desc    Add a new student
// @route   POST /api/users/add
// @access  Private/Teacher
const addStudent = async (req, res) => {
    const { name, email, password, rollNumber } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const rollExists = await User.findOne({ rollNumber });
        if (rollExists) {
            return res.status(400).json({ message: 'Student already exists with this Roll Number' });
        }

        // Hash password handled by pre-save hook in model
        // We just create the user
        const user = await User.create({
            name,
            email,
            password,
            rollNumber,
            role: 'student'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                rollNumber: user.rollNumber,
                role: user.role
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error adding student' });
    }
};

// @desc    Check if student exists
// @route   POST /api/users/check
// @access  Private/Teacher
const checkStudent = async (req, res) => {
    const { rollNumber } = req.body;

    try {
        // Prevent NoSQL Injection by sanitizing rollNumber
        const student = await User.findOne({ rollNumber: String(rollNumber) });

        if (student) {
            return res.json({
                exists: true,
                student: {
                    name: student.name,
                    email: student.email,
                    rollNumber: student.rollNumber
                }
            });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error checking student' });
    }
};

module.exports = { addStudent, checkStudent };
