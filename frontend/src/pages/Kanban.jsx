import { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import KanbanColumn from '../components/KanbanColumn';
import TaskModal from '../components/TaskModal';
import Loader from '../components/Loader';

const COLS = ['To Do', 'In Progress', 'Done'];

const Kanban = () => {
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);

  const fetchTasks = async () => {
    try { const { data } = await api.get('/tasks'); setTasks(data.tasks); }
    catch { toast.error('Could not load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleDrop = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try { await api.put(`/tasks/${taskId}`, { status: newStatus }); toast.success(`Moved to "${newStatus}"`); }
    catch { toast.error('Could not move task'); fetchTasks(); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${id}`); toast.success('Deleted'); fetchTasks(); }
    catch { toast.error('Could not delete'); }
  };

  const handleToggle = async task => {
    try { await api.put(`/tasks/${task._id}`, { completed: !task.completed }); fetchTasks(); }
    catch { toast.error('Could not update'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Kanban Board</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Drag and drop tasks between columns</p>
        </div>
        <button onClick={() => { setEditTask(null); setShowModal(true); }} className="btn-primary">+ New Task</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLS.map(col => (
          <KanbanColumn
            key={col} title={col}
            tasks={tasks.filter(t => t.status === col)}
            onDrop={handleDrop} onEdit={t => { setEditTask(t); setShowModal(true); }}
            onDelete={handleDelete} onToggleComplete={handleToggle}
          />
        ))}
      </div>

      {showModal && <TaskModal task={editTask} onClose={() => { setShowModal(false); setEditTask(null); }} onSaved={fetchTasks} />}
    </div>
  );
};

export default Kanban;
