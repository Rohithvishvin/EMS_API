const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // UUID for holiday
  },
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  date: {
    type: Date,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    enum: ['national', 'company', 'optional'],
    default: 'company', // Default type is company-specific
    required: true,
  },
  applicable_departments: {
    type: [String], // Array of department names or empty array for all departments
    default: [], 
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Index on holiday date for quick searching
HolidaySchema.index({ date: 1 });

module.exports = mongoose.model('Holiday', HolidaySchema);
