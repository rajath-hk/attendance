const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./backend/config/db');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
connectDB();

// Routes
app.use('/api/auth', require('./backend/routes/authRoutes'));
app.use('/api/attendance', require('./backend/routes/attendanceRoutes'));
app.use('/api/users', require('./backend/routes/userRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
