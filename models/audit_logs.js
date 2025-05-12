const mongoose = require('mongoose');

const AuditLogsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // UUID for audit log entry
  },
  user_id: {
    type: String,
    ref: 'User', // Reference to the users collection
    required: false, // Nullable for system actions
  },
  action: {
    type: String,
    required: true, // Action performed (e.g., "create", "update", "delete")
    maxlength: 50,
  },
  entity_type: {
    type: String,
    required: true, // Type of entity affected (e.g., "leave_application", "user", etc.)
    maxlength: 50,
  },
  entity_id: {
    type: String,
    required: true, // ID of the affected entity (e.g., UUID of the leave application or user)
  },
  old_values: {
    type: mongoose.Schema.Types.Mixed,
    required: false, // Previous values before the action (stored as JSON)
  },
  new_values: {
    type: mongoose.Schema.Types.Mixed,
    required: false, // New values after the action (stored as JSON)
  },
  ip_address: {
    type: String,
    required: false, // IP address from which the action was performed
    maxlength: 45, // For IPv6 support
  },
  user_agent: {
    type: String,
    required: false, // User agent string from the request header
    maxlength: 255,
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true, // Timestamp for when the log entry was created
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Index on user_id and entity_id for faster querying
AuditLogsSchema.index({ user_id: 1, entity_id: 1 });

module.exports = mongoose.model('AuditLogs', AuditLogsSchema);
