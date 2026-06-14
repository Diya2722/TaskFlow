import { format, isPast, isToday } from 'date-fns';
import { Calendar, Tag, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';

const priorityColors = {
  High:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  Low:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
};

const statusColors = {
  'To Do':       'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  'In Progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  'Done':        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
};

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete }) => {
  const dueDateInfo = (() => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    const overdue = isPast(date) && !isToday(date) && task.status !== 'Done';
    return { text: isToday(date) ? 'Today' : format(date, 'MMM d, yyyy'), overdue };
  })();

  return (
    <div className={`card p-4 hover:shadow-md transition-shadow ${task.completed ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Complete toggle */}
        <button
          onClick={() => onToggleComplete(task)}
          className={`mt-0.5 flex-shrink-0 transition-colors ${
            task.completed ? 'text-purple-600 dark:text-purple-400' : 'text-gray-300 dark:text-gray-600 hover:text-purple-400'
          }`}
        >
          {task.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-800 dark:text-gray-100 truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
          )}
        </div>

        <span className={`badge flex-shrink-0 ${priorityColors[task.priority]}`}>{task.priority}</span>
      </div>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className={`badge ${statusColors[task.status]}`}>{task.status}</span>

        {dueDateInfo && (
          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
            dueDateInfo.overdue
              ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 font-semibold'
              : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
          }`}>
            <Calendar size={11} />
            {dueDateInfo.overdue && '⚠ '}{dueDateInfo.text}
          </span>
        )}

        {task.labels?.slice(0, 2).map(l => (
          <span key={l} className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
            <Tag size={10} />{l}
          </span>
        ))}
        {task.labels?.length > 2 && <span className="text-xs text-gray-400">+{task.labels.length - 2}</span>}

        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" title="Edit">
            <Edit size={15} />
          </button>
          <button onClick={() => onDelete(task._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {task.comments?.length > 0 && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          💬 {task.comments.length} comment{task.comments.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default TaskCard;
