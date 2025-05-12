const express = require('express');
const LeaveType = require('../models/leave_types');
const router = express.Router();

// POST /api/leaves/types - Create a new leave type
router.post('/types', async (req, res) => {
  try {
    const { id, name, code, description, max_days, policy } = req.body;

    // Basic validation
    if (!id || !name || !code || max_days === undefined) {
      return res.status(400).json({ message: 'id, name, code, and max_days are required' });
    }

    // Create a new LeaveType instance
    const leaveType = new LeaveType({
      id,
      name,
      code,
      description,
      max_consecutive_days: max_days,
      policy_description: policy,
    });

    await leaveType.save();

    res.status(201).json({
      message: 'Leave type created successfully',
      leave_type: leaveType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating leave type' });
  }
});

module.exports = router;
