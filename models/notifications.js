const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // UUID for notification
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User', // Foreign key to the User schema
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['leave_status', 'attendance', 'general', 'other'], // Adjust types as needed
    required: true,
  },
  reference_id: {
    type: String,
    required: false, // Not all notifications may reference another entity (e.g., leave or attendance)
  },
  is_read: {
    type: Boolean,
    default: false, // Whether the notification is read by the user
    required: true,
  },
  action_url: {
    type: String,
    required: false, // URL to navigate to when clicked (optional)
    maxlength: 255,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Additional data payload (JSON format)
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true, // Notification creation time
  },
  expires_at: {
    type: Date,
    required: false, // Expiration time (null if never)
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Index to speed up searching by user_id and read status
NotificationSchema.index({ user_id: 1, is_read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
