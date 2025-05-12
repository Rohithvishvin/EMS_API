const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendanceHistory, getAttendanceReport  } = require('../controllers/attedenceController');
const authMiddleware = require('../middleware/authMiddleware');


// POST: Record Check-in
router.post('/check-in', authMiddleware.authenticate, checkIn);

// POST: Record Check-out
router.post('/check-out', authMiddleware.authenticate, checkOut);

router.get('/history', authMiddleware.authenticate, getAttendanceHistory);

router.get('/reports', authMiddleware.authenticate, getAttendanceReport); // Define the route

module.exports = router;
