const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leaves');
const leave_types = require('./routes/leaveTypes');
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));


// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve attachments
app.use('/api/leaves', leaveRoutes);
app.use('/api/leave_types', leave_types);

// Routes
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attedence', attendanceRoutes);





// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});