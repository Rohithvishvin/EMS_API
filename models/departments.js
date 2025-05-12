const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(), // UUID for department
  },
  name: {
    type: String,
    required: true,
    maxlength: 50,
    unique: true, // Unique department name
  },
  description: {
    type: String,
    required: false,
  },
  manager_id: {
    type: String,
    ref: 'User', // Foreign key reference to users collection (department head)
    required: true,
  },
  parent_department_id: {
    type: String,
    ref: 'Department', // Foreign key reference to parent department (if any)
    required: false,
    default: null,
  },
  is_active: {
    type: Boolean,
    default: true, // Default is true (active)
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

// Index on department name for quick lookup
DepartmentSchema.index({ name: 1 });

module.exports = mongoose.model('Department', DepartmentSchema);
