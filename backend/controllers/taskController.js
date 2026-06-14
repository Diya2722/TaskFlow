// controllers/taskController.js
const Task = require('../models/Task');

// GET /api/tasks  — with search, filter, sort
const getTasks = async (req, res, next) => {
  try {
    const query = { user: req.user._id };

    if (req.query.search) {
      query.$or = [
        { title:       { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    if (req.query.status   && req.query.status   !== 'All') query.status   = req.query.status;
    if (req.query.priority && req.query.priority !== 'All') query.priority = req.query.priority;
    if (req.query.label)  query.labels = { $in: [req.query.label] };

    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (req.query.dueFilter === 'overdue') {
      query.dueDate = { $lt: today }; query.completed = false;
    } else if (req.query.dueFilter === 'today') {
      const tom = new Date(today); tom.setDate(tom.getDate() + 1);
      query.dueDate = { $gte: today, $lt: tom };
    } else if (req.query.dueFilter === 'week') {
      const nw = new Date(today); nw.setDate(nw.getDate() + 7);
      query.dueDate = { $gte: today, $lt: nw };
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === 'dueDate')  sort = { dueDate: 1 };
    if (req.query.sort === 'priority') sort = { priority: -1 };
    if (req.query.sort === 'title')    sort = { title: 1 };

    const tasks = await Task.find(query).sort(sort);
    res.json({ tasks });
  } catch (err) { next(err); }
};

// GET /api/tasks/stats
const getStats = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [total, completed, inProgress, overdue] = await Promise.all([
      Task.countDocuments({ user: uid }),
      Task.countDocuments({ user: uid, status: 'Done' }),
      Task.countDocuments({ user: uid, status: 'In Progress' }),
      Task.countDocuments({ user: uid, dueDate: { $lt: today }, status: { $ne: 'Done' } }),
    ]);
    res.json({ stats: { total, completed, inProgress, overdue, pending: total - completed } });
  } catch (err) { next(err); }
};

// GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) { next(err); }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, labels } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: 'Title is required' });
    const task = await Task.create({ user: req.user._id, title, description, status, priority, dueDate, labels });
    res.status(201).json({ task });
  } catch (err) { next(err); }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'labels', 'completed'];
    fields.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
    if (req.body.completed === true && task.status !== 'Done') task.status = 'Done';

    await task.save();
    res.json({ task });
  } catch (err) { next(err); }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};

// POST /api/tasks/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Comment text required' });
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.comments.push({ text: text.trim(), userName: req.user.name });
    await task.save();
    res.json({ task });
  } catch (err) { next(err); }
};

module.exports = { getTasks, getStats, getTask, createTask, updateTask, deleteTask, addComment };
