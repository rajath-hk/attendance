const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    subject: {
        type: String,
        required: true,
    },
    session: {
        type: String,
        default: 'Class 1',
    },
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true,
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
