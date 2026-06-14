import { useState } from 'react';
import { Search, Moon, Sun, LogOut, Menu, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = ({ darkMode, toggleDark, onSearch, onNewTask, sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const handleSearch = (e) => {
    setSearchVal(e.target.value);
    onSearch(e.target.value);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-900
                    border-b border-purple-100 dark:border-purple-900
                    flex items-center px-4 gap-3 shadow-sm">

      {/* Hamburger (mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30
                   text-purple-600 dark:text-purple-400"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <span className="lg:hidden font-bold text-purple-700 dark:text-purple-400 text-lg">TaskFlow</span>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks… (press N for new)"
          value={searchVal}
          onChange={handleSearch}
          className="input pl-9 py-1.5 text-sm"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* New Task */}
        <button onClick={onNewTask} className="btn-primary flex items-center gap-1.5 py-1.5 text-sm">
          <Plus size={16} />
          <span className="hidden sm:inline">New Task</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          title={darkMode ? 'Switch to light' : 'Switch to dark'}
          className="p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30
                     text-purple-600 dark:text-purple-400 transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User avatar + name */}
        <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-lg
                        bg-purple-50 dark:bg-purple-900/30">
          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center
                          text-white text-xs font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
            {user?.name}
          </span>
        </div>

        {/* Logout button — always visible */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                     text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                     border border-red-200 dark:border-red-800 transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
