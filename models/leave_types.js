const mongoose = require('mongoose');

const LeaveTypeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50, // Maximum length for name
  },
  code: {
    type: String,
    required: true,
    unique: true,
    maxlength: 10, // Maximum length for code
  },
  description: {
    type: String,
    required: false, // Optional description
    default: '',
  },
  color_code: {
    type: String,
    maxlength: 7, // Assuming it's a hex color code (e.g., #FF5733)
    default: '#FFFFFF', // Default to white if not specified
  },
  annual_quota: {
    type: Number,
    required: false,
    default: 0, // Default to 0 if not specified
  },
  requires_approval: {
    type: Boolean,
    required: true,
    default: true, // Default to true (requires approval by default)
  },
  requires_documentation: {
    type: Boolean,
    required: true,
    default: false, // Default to false (documentation not required by default)
  },
  documentation_threshold_days: {
    type: Number,
    required: false,
    default: 0, // Default to 0 days for documentation requirement
  },
  max_consecutive_days: {
    type: Number,
    required: false,
    default: 0, // Default to no limit if not specified
  },
  is_active: {
    type: Boolean,
    required: true,
    default: true, // Leave type is active by default
  },
  created_at: {
    type: Date,
    default: Date.now, // Automatically set the creation timestamp
  },
  updated_at: {
    type: Date,
    default: Date.now, // Automatically set the updated timestamp
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('LeaveType', LeaveTypeSchema);
