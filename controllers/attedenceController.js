const AttendanceRecord = require('../models/attendance_records');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { generateCSV, generatePDF } = require('../utils/reportGenerators'); 

exports.checkIn = async (req, res) => {
    const { user_id, date, check_in_time, check_in_location, check_in_device, status } = req.body;
  
    try {
      // Validate check-in location
      if (!check_in_location || check_in_location.type !== 'Point' || !Array.isArray(check_in_location.coordinates) || check_in_location.coordinates.length !== 2) {
        return res.status(400).json({ success: false, message: "Invalid check-in location." });
      }
  
      // Create the new attendance record, ensuring check_out_location is set to null initially
      const newAttendance = new AttendanceRecord({
        user_id,
        date,
        check_in_time,
        check_in_location,
        check_in_device,
        status,
        check_out_location: { type: 'Point', coordinates: [0, 0] }, // Initialize check_out_location with default values
      });
  
      // Save the new attendance record
      await newAttendance.save();
      res.status(201).json({ success: true, message: "Check-in recorded successfully.", data: newAttendance });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  
  exports.checkOut = async (req, res) => {
    const { user_id, date, check_out_time, check_out_location, check_out_device, status } = req.body;
  
    try {
      // Ensure check-out location has the correct format
      if (!check_out_location || check_out_location.type !== 'Point' || !Array.isArray(check_out_location.coordinates) || check_out_location.coordinates.length !== 2) {
        return res.status(400).json({ success: false, message: "Invalid check-out location." });
      }
  
      // Find the attendance record for the user on the given date
      const attendance = await AttendanceRecord.findOne({ user_id, date });
  
      if (!attendance) {
        return res.status(404).json({ success: false, message: "Attendance record not found for today." });
      }
  
      // Update the check-out details
      attendance.check_out_time = check_out_time;
      attendance.check_out_location = check_out_location;
      attendance.check_out_device = check_out_device;
      attendance.status = status || attendance.status; // Default to the previous status if no new status is provided
  
      await attendance.save();
  
      res.status(200).json({ success: true, message: "Check-out recorded successfully.", data: attendance });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };


  exports.getAttendanceHistory = async (req, res) => {
    const { start_date, end_date, status, page = 1, limit = 10 } = req.query;
  
    try {
      // Build the filter object based on query parameters
      const filter = {};
  
      if (start_date) {
        filter.date = { $gte: new Date(start_date) }; // start date
      }
  
      if (end_date) {
        // End date is inclusive, so use $lte for "less than or equal to"
        filter.date = filter.date ? { ...filter.date, $lte: new Date(end_date) } : { $lte: new Date(end_date) };
      }
  
      if (status) {
        filter.status = status; // Filter by status (present/absent/late/half-day)
      }
  
      // Pagination and querying the records
      const records = await AttendanceRecord.find(filter)
        .skip((page - 1) * limit) // Skip records based on page number
        .limit(limit) // Limit the number of records per page
        .sort({ date: -1 }); // Sort by date descending
  
      // Get total number of records for pagination
      const totalRecords = await AttendanceRecord.countDocuments(filter);
  
      // Format the records as per the response structure
      const formattedRecords = records.map(record => ({
        date: record.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        day: record.date.toLocaleString('en-us', { weekday: 'long' }), // Get the day name
        check_in_time: record.check_in_time ? record.check_in_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        check_out_time: record.check_out_time ? record.check_out_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        working_hours: record.working_hours ? parseFloat(record.working_hours).toFixed(2) : 0.0,
        status: record.status,
        location: {
          lat: record.check_in_location.coordinates[1],
          lng: record.check_in_location.coordinates[0],
        },
      }));
  
      // Return the response with total records and the formatted attendance records
      res.status(200).json({
        success: true,
        total_records: totalRecords,
        records: formattedRecords,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };



  exports.getAttendanceReport = async (req, res) => {
    const { start_date, end_date, department, employee_id, status, format = 'json' } = req.query;
    const { user } = req; // assuming this comes from auth middleware
  
    // Optional: Enforce admin check
    // if (!user || !user.is_admin) {
    //   return res.status(403).json({ success: false, message: 'Admin rights are required.' });
    // }
  
    const startDate = moment(start_date, 'YYYY-MM-DD');
    const endDate = moment(end_date, 'YYYY-MM-DD');
  
    if (!startDate.isValid() || !endDate.isValid()) {
      return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
    }
  
    try {
      const filter = {
        date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      };
  
      if (status) filter.status = status;
      if (employee_id) filter.user_id = employee_id;
  
      // Fetch attendance records and populate user data
      const records = await AttendanceRecord.find(filter).populate('user_id');
  
      // Optionally filter by department (after population)
      const filteredRecords = department
        ? records.filter(r => r.user_id?.department === department)
        : records;
  
      const totalDays = filteredRecords.length;
      const presentDays = filteredRecords.filter(r => r.status === 'present').length;
      const absentDays = filteredRecords.filter(r => r.status === 'absent').length;
      const lateDays = filteredRecords.filter(r => r.status === 'late').length;
      const halfDays = filteredRecords.filter(r => r.status === 'half day').length;
      const workingHours = filteredRecords.reduce((total, record) => total + parseFloat(record.working_hours || 0), 0);
  
      const summary = {
        total_days: totalDays,
        present_days: presentDays,
        absent_days: absentDays,
        late_days: lateDays,
        half_days: halfDays,
        working_hours: workingHours.toFixed(2),
      };
  
      const reportRecords = filteredRecords.map(record => ({
        date: record.date.toISOString().split('T')[0],
        day: moment(record.date).format('dddd'),
        check_in_time: record.check_in_time ? moment(record.check_in_time).format('HH:mm') : 'N/A',
        check_out_time: record.check_out_time ? moment(record.check_out_time).format('HH:mm') : 'N/A',
        working_hours: record.working_hours ? parseFloat(record.working_hours).toFixed(2) : '0.00',
        status: record.status,
        employee_id: record.user_id?.employee_id || 'N/A',
        name: record.user_id?.name || 'N/A',
        department: record.user_id?.department || 'N/A',
        location: {
          lat: record.check_in_location?.coordinates[1],
          lng: record.check_in_location?.coordinates[0],
        },
      }));
  
      const reportData = { summary, records: reportRecords };
  
      if (format === 'csv') {
        const csvReport = generateCSV(reportData); // assume this util exists
        res.header('Content-Type', 'text/csv');
        res.attachment('attendance_report.csv');
        return res.send(csvReport);
      }
  
      if (format === 'pdf') {
        const pdfReport = await generatePDF(reportData); // assume this util exists
        res.header('Content-Type', 'application/pdf');
        res.attachment('attendance_report.pdf');
        return res.send(pdfReport);
      }
  
      res.status(200).json({ success: true, report: reportData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };