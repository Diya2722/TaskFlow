const colStyle = {
  'To Do':       { hdr: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',       dot: 'bg-gray-400',   border: 'border-gray-200 dark:border-gray-700' },
  'In Progress': { hdr: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300', dot: 'bg-purple-500', border: 'border-purple-200 dark:border-purple-700' },
  'Done':        { hdr: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',   dot: 'bg-green-500',  border: 'border-green-200 dark:border-green-700' },
};

const KanbanColumn = ({ title, tasks, onDrop, onEdit, onDelete, onToggleComplete }) => {
  const s = colStyle[title];

  const onDragOver  = e => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); };
  const onDragLeave = e => e.currentTarget.classList.remove('drag-over');
  const handleDrop  = e => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    onDrop(e.dataTransfer.getData('taskId'), title);
  };

  return (
    <div
      className={`flex flex-col rounded-xl border ${s.border} bg-white dark:bg-gray-900 min-h-64 transition-all`}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={handleDrop}
    >
      <div className={`flex items-center gap-2 px-4 py-3 rounded-t-xl ${s.hdr}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
        <span className="font-semibold text-sm">{title}</span>
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20">{tasks.length}</span>
      </div>

      <div className="flex-1 p-3 space-y-2">
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            Drop tasks here
          </div>
        )}
        {tasks.map(task => (
          <div
            key={task._id}
            draggable
            onDragStart={e => { e.dataTransfer.setData('taskId', task._id); e.dataTransfer.effectAllowed = 'move'; }}
            className="cursor-grab active:cursor-grabbing"
          >
            <div className="card p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-medium text-gray-800 dark:text-gray-100 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                  {task.title}
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                  task.priority === 'High'   ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                }`}>{task.priority}</span>
              </div>

              {task.labels?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.labels.slice(0, 3).map(l => (
                    <span key={l} className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">{l}</span>
                  ))}
                </div>
              )}

              {task.dueDate && (
                <p className="text-xs text-gray-400 mt-2">📅 {new Date(task.dueDate).toLocaleDateString()}</p>
              )}

              <div className="flex gap-2 mt-2 text-xs text-gray-400">
                <button onClick={() => onToggleComplete(task)} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {task.completed ? '✅ Done' : '⭕ Mark done'}
                </button>
                <span className="text-gray-200 dark:text-gray-700">|</span>
                <button onClick={() => onEdit(task)} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Edit</button>
                <span className="text-gray-200 dark:text-gray-700">|</span>
                <button onClick={() => onDelete(task._id)} className="hover:text-red-500 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
