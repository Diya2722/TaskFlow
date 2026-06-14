import { useState, useEffect } from 'react';
import { X, Tag, Send } from 'lucide-react';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TaskModal = ({ task, onClose, onSaved }) => {
  const isEdit = !!task;

  const [form, setForm] = useState({
    title: '', description: '', status: 'To Do',
    priority: 'Medium', dueDate: '', labels: [],
  });
  const [labelInput, setLabelInput] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title       || '',
        description: task.description || '',
        status:      task.status      || 'To Do',
        priority:    task.priority    || 'Medium',
        dueDate:     task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        labels:      task.labels      || [],
      });
      setComments(task.comments || []);
    }
  }, [task]);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const addLabel = e => {
    if ((e.key === 'Enter' || e.key === ',') && labelInput.trim()) {
      e.preventDefault();
      const v = labelInput.trim().replace(',', '');
      if (!form.labels.includes(v)) setForm({ ...form, labels: [...form.labels, v] });
      setLabelInput('');
    }
  };

  const removeLabel = l => setForm({ ...form, labels: form.labels.filter(x => x !== l) });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/tasks/${task._id}`, form);
        toast.success('Task updated!');
      } else {
        await api.post('/tasks', form);
        toast.success('Task created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post(`/tasks/${task._id}/comments`, { text: commentText });
      setComments(data.task.comments);
      setCommentText('');
    } catch { toast.error('Could not add comment'); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto card">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-purple-100 dark:border-purple-900">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Title *</label>
            <input type="text" name="title" value={form.title} onChange={onChange} className="input" placeholder="What needs to be done?" required />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={onChange} className="input resize-none" rows={3} placeholder="Add details…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={onChange} className="select">
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select name="priority" value={form.priority} onChange={onChange} className="select">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Due Date</label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={onChange} className="input" />
          </div>

          <div>
            <label className="label">Labels (press Enter to add)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.labels.map(l => (
                <span key={l} className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                  <Tag size={10} />{l}
                  <button type="button" onClick={() => removeLabel(l)} className="hover:text-red-500"><X size={10} /></button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              onKeyDown={addLabel}
              className="input"
              placeholder="Type a label and press Enter…"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>

        {/* Comments — edit mode only */}
        {isEdit && (
          <div className="px-5 pb-5 border-t border-purple-100 dark:border-purple-900 pt-4">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
              💬 Comments ({comments.length})
            </h3>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {comments.length === 0 && <p className="text-sm text-gray-400">No comments yet.</p>}
              {comments.map((c, i) => (
                <div key={i} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">{c.userName}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{c.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                className="input flex-1 text-sm"
                placeholder="Write a comment…"
              />
              <button type="button" onClick={handleAddComment} className="btn-primary px-3"><Send size={15} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;
