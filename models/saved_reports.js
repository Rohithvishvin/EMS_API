const mongoose = require('mongoose');

const SavedReportSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // UUID for saved report
  },
  template_id: {
    type: String,
    ref: 'ReportTemplate', // Reference to the 'report_templates' collection
    required: false, // Can be null for custom reports
  },
  name: {
    type: String,
    required: true,
    maxlength: 100, // Report name length constraint
  },
  description: {
    type: String,
    required: false, // Optional field for report description
  },
  parameters: {
    type: Object, // Stores the parameters used for report generation
    required: true,
  },
  result_format: {
    type: String,
    enum: ['json', 'csv', 'pdf'], // Report result format
    required: true,
  },
  result_url: {
    type: String,
    required: true, // URL where the generated report can be accessed
  },
  created_by: {
    type: String,
    ref: 'User', // Reference to the 'users' collection (who generated the report)
    required: true,
  },
  is_shared: {
    type: Boolean,
    default: false, // Whether the report is shared with other admins
    required: true,
  },
  expire_at: {
    type: Date,
    required: false, // Optional expiration time (null if the report doesn't expire)
  },
  created_at: {
    type: Date,
    default: Date.now, // Record creation time
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now, // Timestamp for the last update
    required: true,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Index on 'template_id' and 'created_by' for faster search
SavedReportSchema.index({ template_id: 1, created_by: 1 });

module.exports = mongoose.model('SavedReport', SavedReportSchema);
