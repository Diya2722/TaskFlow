import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';
import { format, isSameDay } from 'date-fns';
import TaskModal from '../components/TaskModal';
import Loader from '../components/Loader';

const CalendarPage = () => {
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);

  const fetchTasks = async () => {
    try { const { data } = await api.get('/tasks'); setTasks(data.tasks); }
    catch { toast.error('Could not load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const dayTasks = date => tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), date));
  const selectedTasks = dayTasks(selected);

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const count = dayTasks(date).length;
    if (!count) return null;
    return (
      <div className="flex justify-center gap-0.5 mt-0.5">
        {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
        ))}
      </div>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Click a date to see tasks due that day</p>
        </div>
        <button onClick={() => { setEditTask(null); setShowModal(true); }} className="btn-primary">+ New Task</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar onChange={setSelected} value={selected} tileContent={tileContent} />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            Purple dots = tasks due that day
          </p>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
            📅 {format(selected, 'MMMM d, yyyy')}
          </h2>
          {selectedTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🗓️</p>
              <p className="text-sm text-gray-400">No tasks due this day</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map(task => (
                <div key={task._id} onClick={() => { setEditTask(task); setShowModal(true); }}
                  className="p-3 rounded-lg border border-purple-100 dark:border-purple-800
                             hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors">
                  <p className={`text-sm font-medium text-gray-800 dark:text-gray-100 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      task.priority === 'High'   ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    }`}>{task.priority}</span>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <TaskModal task={editTask} onClose={() => { setShowModal(false); setEditTask(null); }} onSaved={fetchTasks} />
      )}
    </div>
  );
};

export default CalendarPage;
