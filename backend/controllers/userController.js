const User = require('../models/userModel');

// @desc    Add a new student
// @route   POST /api/users/add
// @access  Private/Teacher
const addStudent = async (req, res) => {
    const { name, email, password, rollNumber } = req.body;

    try {
        const userExists = await User.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const rollExists = await User.findByRollNumber(rollNumber);
        if (rollExists) {
            return res.status(400).json({ message: 'Student already exists with this Roll Number' });
        }

        const user = await User.create({
            name,
            email,
            password,
            rollNumber,
            role: 'student'
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                rollNumber: user.roll_number,
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
        const student = await User.findByRollNumber(rollNumber);

        if (student) {
            return res.json({
                exists: true,
                student: {
                    name: student.name,
                    email: student.email,
                    rollNumber: student.roll_number
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
