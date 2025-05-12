const mongoose = require('mongoose');

const LeaveStatusHistorySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // UUID for the status history record
  },
  leave_application_id: {
    type: String,
    required: true,
    ref: 'LeaveApplication', // Foreign key to the LeaveApplication schema
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    required: true, // Status must be one of the defined enums
  },
  changed_by: {
    type: String,
    required: true,
    ref: 'User', // Foreign key to the User schema (user who changed the status)
  },
  remarks: {
    type: String,
    required: false, // Optional remarks for the status change
  },
  changed_at: {
    type: Date,
    default: Date.now,
    required: true, // Timestamp of when the status was changed
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Indexing to speed up searching by leave_application_id and status
LeaveStatusHistorySchema.index({ leave_application_id: 1, status: 1 });

module.exports = mongoose.model('LeaveStatusHistory', LeaveStatusHistorySchema);
