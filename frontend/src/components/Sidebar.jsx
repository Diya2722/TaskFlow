import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Kanban, Calendar, CheckSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/kanban',    icon: <Kanban size={20} />,          label: 'Kanban' },
  { to: '/calendar',  icon: <Calendar size={20} />,        label: 'Calendar' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-20 h-full w-64
        bg-white dark:bg-gray-900
        border-r border-purple-100 dark:border-purple-900
        transform transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-purple-100 dark:border-purple-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <CheckSquare size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-purple-700 dark:text-purple-400">TaskFlow</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all
                ${isActive
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-purple-100 dark:border-purple-900">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
