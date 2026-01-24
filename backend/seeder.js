const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const Attendance = require('./models/attendanceModel');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Attendance.deleteMany();
        await User.deleteMany();

        const users = [
            {
                name: 'Math Teacher',
                email: 'math@amc.com',
                password: 'password123',
                role: 'teacher',
                subject: 'Mathematics'
            },
            {
                name: 'Physics Teacher',
                email: 'physics@amc.com',
                password: 'password123',
                role: 'teacher',
                subject: 'Physics'
            },
            {
                name: 'web technology',
                email: 'web@amc.com',
                password: 'password123',
                role: 'teacher',
                subject: 'web technology'
            }
        ];

        await User.create(users);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Attendance.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
