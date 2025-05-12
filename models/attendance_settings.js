const mongoose = require('mongoose');

const AttendanceSettingsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  department: {
    type: String,
    required: false, // Department is optional, can be null for company-wide settings
    default: null,
  },
  work_start_time: {
    type: Date,
    required: true, // Regular work start time
  },
  work_end_time: {
    type: Date,
    required: true, // Regular work end time
  },
  grace_period_minutes: {
    type: Number,
    required: true,
    default: 15, // Default grace period for being late
  },
  half_day_hours: {
    type: mongoose.Decimal128,
    required: true,
  },
  full_day_hours: {
    type: mongoose.Decimal128,
    required: true,
  },
  geo_fencing_enabled: {
    type: Boolean,
    required: true,
    default: false, // Default to false, geo-fencing is disabled
  },
  office_location: {
    type: {
      type: String,
      enum: ['Point'], // GeoJSON type
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  allowed_radius_meters: {
    type: Number,
    required: true,
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
  timestamps: true,  // Automatically manages createdAt and updatedAt fields
});

// Create an index on department and office_location to optimize queries based on those fields
AttendanceSettingsSchema.index({ department: 1, office_location: 1 });

module.exports = mongoose.model('AttendanceSettings', AttendanceSettingsSchema);
