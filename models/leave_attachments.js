const mongoose = require('mongoose');

const LeaveAttachmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // UUID for the attachment
  },
  leave_application_id: {
    type: String,
    required: true,
    ref: 'LeaveApplication', // Foreign key to the LeaveApplication schema
  },
  file_name: {
    type: String,
    required: true,
    maxlength: 255,
  },
  file_type: {
    type: String,
    required: true,
    maxlength: 50,
  },
  file_size: {
    type: Number,
    required: true,
  },
  file_url: {
    type: String,
    required: true,
    maxlength: 255,
  },
  upload_date: {
    type: Date,
    default: Date.now,
    required: true,
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Indexing to speed up search by leave_application_id
LeaveAttachmentSchema.index({ leave_application_id: 1 });

module.exports = mongoose.model('LeaveAttachment', LeaveAttachmentSchema);
