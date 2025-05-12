const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // UUID for system setting
  },
  key: {
    type: String,
    required: true,
    maxlength: 50,
    unique: true, // Unique setting key
  },
  value: {
    type: String,
    required: true, // Setting value (string for flexibility)
  },
  description: {
    type: String,
    required: false, // Optional description of the setting
  },
  is_protected: {
    type: Boolean,
    default: false, // Whether the setting requires admin approval for changes
    required: true,
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

// Index on setting key for quick lookup
SystemSettingsSchema.index({ key: 1 });

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
