
const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Relates to the User schema
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  check_in_time: {
    type: Date,  // Using Date to store both time and date
    default: null,
  },
  check_out_time: {
    type: Date, // Using Date to store both time and date
    default: null,
  },
  check_in_location: {
    type: {
      type: String,
      enum: ['Point'], // GeoJSON type for geographical coordinates
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  check_out_location: {
    type: {
      type: String,
      enum: ['Point'], // GeoJSON type for geographical coordinates
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  check_in_address: {
    type: String,
    default: '',
  },
  check_out_address: {
    type: String,
    default: '',
  },
  check_in_device: {
    type: mongoose.Schema.Types.Mixed, // Stores device info for check-in (JSON)
    default: {},
  },
  check_out_device: {
    type: mongoose.Schema.Types.Mixed, // Stores device info for check-out (JSON)
    default: {},
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half day'],
    default: 'present',
    required: true,
  },
  working_hours: {
    type: mongoose.Decimal128, // Store working hours as decimal (e.g., 8.5 hours)
    default: 0.00,
  },
}, {
  timestamps: true,  // Created and updated timestamps
});

AttendanceRecordSchema.index({ user_id: 1, date: 1 }, { unique: true }); // Ensure only one record per day

module.exports = mongoose.model('AttendanceRecord', AttendanceRecordSchema);

