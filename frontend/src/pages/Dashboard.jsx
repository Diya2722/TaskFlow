import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, AlertCircle, LayoutList, Filter, ArrowUpDown, Download, RefreshCw } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Loader from '../components/Loader';

const StatCard = ({ label, value, icon, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

const Dashboard = ({ searchQuery = '' }) => {
  const [tasks, setTasks]       = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filters, setFilters]   = useState({ status: 'All', priority: 'All', dueFilter: '', sort: 'createdAt' });

  // Press N to open new task modal
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'n' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        setEditTask(null); setShowModal(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks', { params: { ...filters, search: searchQuery } });
      setTasks(data.tasks);
    } catch { toast.error('Could not load tasks'); }
    finally { setLoading(false); }
  }, [filters, searchQuery]);

  const fetchStats = async () => {
    try { const { data } = await api.get('/tasks/stats'); setStats(data.stats); }
    catch {}
  };

  useEffect(() => { fetchTasks(); fetchStats(); }, [fetchTasks]);

  const refresh = () => { fetchTasks(); fetchStats(); };

  const handleDelete = async id => {
    if (!window.confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${id}`); toast.success('Task deleted'); refresh(); }
    catch { toast.error('Could not delete'); }
  };

  const handleToggleComplete = async task => {
    try { await api.put(`/tasks/${task._id}`, { completed: !task.completed }); refresh(); }
    catch { toast.error('Could not update'); }
  };

  const exportTasks = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'taskflow-export.json';
    a.click();
    toast.success('Exported!');
  };

  const openEdit = task => { setEditTask(task); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTask(null); };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Press <kbd className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-xs font-mono">N</kbd> to create a task
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportTasks} className="btn-ghost flex items-center gap-1.5 text-sm py-1.5">
            <Download size={15} /> <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={refresh} className="btn-ghost flex items-center gap-1.5 text-sm py-1.5">
            <RefreshCw size={15} /> <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total"       value={stats.total      || 0} icon={<LayoutList   size={22} className="text-purple-600" />} color="bg-purple-100 dark:bg-purple-900/30" />
        <StatCard label="Completed"   value={stats.completed  || 0} icon={<CheckCircle2 size={22} className="text-green-600"  />} color="bg-green-100 dark:bg-green-900/30"  />
        <StatCard label="In Progress" value={stats.inProgress || 0} icon={<Clock        size={22} className="text-yellow-600" />} color="bg-yellow-100 dark:bg-yellow-900/30"/>
        <StatCard label="Overdue"     value={stats.overdue    || 0} icon={<AlertCircle  size={22} className="text-red-600"    />} color="bg-red-100 dark:bg-red-900/30"       />
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-purple-500 flex-shrink-0" />
        <select value={filters.status}    onChange={e => setFilters({...filters, status:    e.target.value})} className="select w-auto text-sm py-1.5">
          <option value="All">All Status</option>
          <option>To Do</option><option>In Progress</option><option>Done</option>
        </select>
        <select value={filters.priority}  onChange={e => setFilters({...filters, priority:  e.target.value})} className="select w-auto text-sm py-1.5">
          <option value="All">All Priority</option>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select value={filters.dueFilter} onChange={e => setFilters({...filters, dueFilter: e.target.value})} className="select w-auto text-sm py-1.5">
          <option value="">Any Due Date</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due Today</option>
          <option value="week">Due This Week</option>
        </select>
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown size={14} className="text-gray-400" />
          <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})} className="select w-auto text-sm py-1.5">
            <option value="createdAt">Newest First</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader size="lg" /></div>
      ) : tasks.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No tasks found</h3>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            {searchQuery ? `No results for "${searchQuery}"` : 'Create your first task to get started'}
          </p>
          <button onClick={() => { setEditTask(null); setShowModal(true); }} className="btn-primary">
            + Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
          ))}
          <p className="text-center text-xs text-gray-400 py-2">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {showModal && (
        <TaskModal task={editTask} onClose={closeModal} onSaved={refresh} />
      )}
    </div>
  );
};

export default Dashboard;
