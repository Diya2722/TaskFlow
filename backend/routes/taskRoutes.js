const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTasks, getStats, getTask, createTask, updateTask, deleteTask, addComment } = require('../controllers/taskController');

router.use(protect);

router.get('/stats', getStats);
router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.post('/:id/comments', addComment);

module.exports = router;
