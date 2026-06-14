// models/Task.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  { text: { type: String, required: true }, userName: { type: String, required: true } },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status:      { type: String, enum: ['To Do', 'In Progress', 'Done'], default: 'To Do' },
    priority:    { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    dueDate:     { type: Date, default: null },
    labels:      { type: [String], default: [] },
    completed:   { type: Boolean, default: false },
    comments:    [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
