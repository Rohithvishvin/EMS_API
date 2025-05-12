const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // UUID for emergency contact entry
  },
  user_id: {
    type: String,
    ref: 'User', // Reference to the 'users' collection
    required: true, // Ensures this contact is linked to a user (employee)
  },
  name: {
    type: String,
    required: true, // Contact's name
    maxlength: 100,
  },
  relationship: {
    type: String,
    required: true, // Relationship to employee (e.g., "mother", "friend", etc.)
    maxlength: 50,
  },
  primary_phone: {
    type: String,
    required: true, // Primary phone number for the emergency contact
    maxlength: 15,
  },
  secondary_phone: {
    type: String,
    required: false, // Alternative phone number (optional)
    maxlength: 15,
  },
  email: {
    type: String,
    required: false, // Email address for the emergency contact (optional)
    maxlength: 100,
  },
  address: {
    type: String,
    required: false, // Physical address (optional)
  },
  is_primary: {
    type: Boolean,
    default: true, // Whether this is the primary emergency contact
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true, // Timestamp of when the record was created
  },
  updated_at: {
    type: Date,
    default: Date.now,
    required: true, // Timestamp for when the record was last updated
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Index on user_id to allow fast searching for emergency contacts by user
EmergencyContactSchema.index({ user_id: 1 });

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);
