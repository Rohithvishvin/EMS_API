const express = require('express');
const multer = require('multer');
const path = require('path');
const LeaveApplication = require('../models/leave_applications');
const LeaveAttachment = require('../models/leave_attachments');
const LeaveType = require('../models/leave_types');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose'); // ✅ Required for ObjectId validation
const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});
const upload = multer({ storage });

// POST /api/leaves — Submit leave application
router.post('/', upload.single('attachment'), async (req, res) => {
    try {
      const { leave_type, start_date, end_date, reason } = req.body;
  
      // Validate dates
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
        return res.status(400).json({ message: 'Invalid start or end date' });
      }
  
      // ✅ Find leave type by `id` instead of `name`
      const leaveTypeDoc = await LeaveType.findOne({ id: leave_type });
      if (!leaveTypeDoc) {
        return res.status(400).json({ message: 'Invalid leave type' });
      }
  
      // Calculate duration (in days)
      const durationInDays = ((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  
      // Create new leave application
      const leaveApplication = new LeaveApplication({
        user_id: "681c83f3271ab642b95bec18", // Replace with req.user.id when auth is ready
        leave_type_id: leaveTypeDoc.id,
        start_date: startDate,
        end_date: endDate,
        duration: durationInDays.toFixed(1), // Decimal128 expects string
        reason,
        status: 'pending'
      });
  
      await leaveApplication.save();
  
      // Save attachment if uploaded
      if (req.file) {
        const attachment = new LeaveAttachment({
          leave_application_id: leaveApplication.id,
          file_name: req.file.filename,
          file_type: req.file.mimetype,
          file_size: req.file.size,
          file_url: `/uploads/${req.file.filename}`,
        });
        await attachment.save();
      }
  
      res.status(201).json({
        message: 'Leave application submitted successfully',
        leave_details: leaveApplication
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error processing leave application' });
    }
  });



// GET /api/leaves — Fetch leave history
router.get('/', authMiddleware.authenticate, async (req, res) => {
    try {
      const userId = "681c83f3271ab642b95bec18"; // Authenticated user's ID
      const { status, type, year, page = 1, limit = 10 } = req.query;
  
      const filter = { user_id: userId };
  
      // Optional: filter by leave status
      if (status) {
        filter.status = status;
      }
  
      // Optional: filter by year
      if (year) {
        const start = new Date(`${year}-01-01`);
        const end = new Date(`${parseInt(year) + 1}-01-01`);
        filter.start_date = { $gte: start, $lt: end };
      }
  
      // Optional: filter by leave type ID
      if (type) {
        const leaveType = await LeaveType.findOne({ id: type });
        if (leaveType) {
          filter.leave_type_id = leaveType.id;
        } else {
          return res.status(400).json({ message: 'Invalid leave type' });
        }
      }
  
      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      // Get total count for pagination
      const total = await LeaveApplication.countDocuments(filter);
  
      // Fetch leave applications with pagination
      const leaves = await LeaveApplication.find(filter)
        .sort({ start_date: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();
  
      // Enrich results with leave type name and (optionally) approval info
      const leaveTypeMap = await LeaveType.find().lean().then(types =>
        types.reduce((acc, t) => {
          acc[t.id] = t.name;
          return acc;
        }, {})
      );
  
      const enrichedLeaves = await Promise.all(
        leaves.map(async (leave) => {
          return {
            id: leave._id,
            type: leaveTypeMap[leave.leave_type_id] || leave.leave_type_id,
            start_date: leave.start_date.toISOString().split('T')[0],
            end_date: leave.end_date.toISOString().split('T')[0],
            duration: parseFloat(leave.duration),
            reason: leave.reason,
            status: leave.status,
            applied_on: leave.createdAt,
            approved_by: leave.approved_by ? await getApproverName(leave.approved_by) : null,
            approval_date: leave.approval_date || null
          };
        })
      );
  
      res.json({
        total,
        leaves: enrichedLeaves
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch leave history' });
    }
  });
  
  // Helper to get approver's name
  async function getApproverName(userId) {
    const user = await User.findById(userId).lean();
    return user ? `${user.first_name} ${user.last_name}` : null;
  }


  // Utility to get approver info
const getApproverInfo = async (userId) => {
    const user = await User.findOne({ id: userId }).lean();
    return user ? { id: user.id, name: user.name, role: user.role } : null;
  };
  
  // GET /api/leaves/:id — Fetch leave by custom ID
  router.get('/:id', async (req, res) => {
    try {
      const leaveId = req.params.id;
  
      // Lookup by custom 'id' field
      const leaveApplication = await LeaveApplication.findOne({ id: leaveId }).lean();

      console.log(leaveApplication);


      if (!leaveApplication) {
        return res.status(404).json({ message: 'Leave application not found' });
      }
  
      // Get leave type name
      const leaveTypeDoc = await LeaveType.findOne({ id: leaveApplication.leave_type_id }).lean();
      const leaveTypeName = leaveTypeDoc ? leaveTypeDoc.name : 'Unknown';
  
      // Get approver info if available
      const approverInfo = leaveApplication.approved_by
        ? await getApproverInfo(leaveApplication.approved_by)
        : null;
  
      // Get attachments
      const attachments = await LeaveAttachment.find({
        leave_application_id: leaveApplication._id
      }).lean();
  
      // Build response
      const response = {
        id: leaveApplication.id,
        type: leaveTypeName,
        start_date: leaveApplication.start_date,
        end_date: leaveApplication.end_date,
        duration: parseFloat(leaveApplication.duration.toString()),
        reason: leaveApplication.reason,
        status: leaveApplication.status,
        applied_on: leaveApplication.applied_on || leaveApplication.createdAt,
        approved_by: approverInfo,
        approval_date: leaveApplication.approval_date,
        remarks: leaveApplication.remarks || null,
        attachments: attachments.map(att => ({
          name: att.file_name,
          url: att.file_url
        })),
        history: leaveApplication.history || []
      };
  
      res.status(200).json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching leave application details' });
    }
  });


  // DELETE /api/leaves/:id — Cancel a leave application
router.delete('/:id', authMiddleware.authenticate, async (req, res) => {
    try {
      const leaveId = req.params.id;
      const userId = "681c83f3271ab642b95bec18"; // Assuming user ID is available after authentication
  
      // Validate leave ID
      if (!mongoose.Types.ObjectId.isValid(leaveId)) {
        return res.status(400).json({ message: 'Invalid leave application ID' });
      }
  
      // Find the leave application
      const leaveApplication = await LeaveApplication.findOne({ id: leaveId, user_id: userId }).lean();
      if (!leaveApplication) {
        return res.status(404).json({ message: 'Leave application not found' });
      }
  
      // Delete the leave application
      await LeaveApplication.findByIdAndDelete(leaveApplication._id);
  
      // Update the user's leave balance
      const leaveType = await LeaveType.findOne({ id: leaveApplication.leave_type_id }).lean();
      if (!leaveType) {
        return res.status(404).json({ message: 'Leave type not found' });
      }
  
      // Assuming you have a User model with leave balance fields
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the leave balance
      if (leaveType.code === 'CL') {
        user.casual_leave_balance += leaveApplication.duration;
      } else if (leaveType.code === 'SK') {
        user.sick_leave_balance += leaveApplication.duration;
      } else if (leaveType.code === 'EL') {
        user.earned_leave_balance += leaveApplication.duration;
      }
  
      await user.save();
  
      // Respond with success message and updated leave balance
      res.status(200).json({
        success: true,
        message: 'Leave application cancelled successfully',
        leave_balance: {
          casual: user.casual_leave_balance,
          sick: user.sick_leave_balance,
          earned: user.earned_leave_balance,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error cancelling leave application' });
    }
  });
  



  
module.exports = router;
