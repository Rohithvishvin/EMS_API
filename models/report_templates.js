const mongoose = require('mongoose');

const ReportTemplateSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // UUID for report template
  },
  name: {
    type: String,
    required: true,
    unique: true, // Ensures no duplicate templates with the same name
    maxlength: 100,
  },
  type: {
    type: String,
    enum: ['attendance', 'leave', 'employee'], // Valid types for the report
    required: true,
  },
  description: {
    type: String,
    required: false, // Optional field for template description
  },
  query: {
    type: String,
    required: true, // SQL query or query parameters
  },
  parameters: {
    type: Object, // Stores the query parameters as a JSON object
    required: true,
  },
  created_by: {
    type: String,
    ref: 'User', // Reference to the User collection to track who created the template
    required: true,
  },
  is_public: {
    type: Boolean,
    default: false, // Whether the template is available to all admins or restricted to certain users
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true, // Timestamp when the template was created
  },
  updated_at: {
    type: Date,
    default: Date.now,
    required: true, // Timestamp when the template was last updated
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Index on 'created_by' and 'type' for fast searching
ReportTemplateSchema.index({ created_by: 1, type: 1 });

module.exports = mongoose.model('ReportTemplate', ReportTemplateSchema);
