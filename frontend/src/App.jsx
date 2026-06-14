import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Kanban     from './pages/Kanban';
import CalendarPage from './pages/Calendar';

import Navbar   from './components/Navbar';
import Sidebar  from './components/Sidebar';
import Loader   from './components/Loader';
import TaskModal from './components/TaskModal';

// Redirect to /login if not authenticated
const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
};

// Layout that wraps every protected page
// Page = the actual page component (Dashboard / Kanban / CalendarPage)
const Layout = ({ darkMode, toggleDark, Page }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          darkMode={darkMode}
          toggleDark={toggleDark}
          onSearch={setSearchQuery}
          onNewTask={() => setShowNewTask(true)}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto bg-purple-50 dark:bg-gray-950">
          {/* Render the page and pass searchQuery as a prop */}
          <Page searchQuery={searchQuery} />
        </main>
      </div>

      {/* Global "New Task" modal — triggered from navbar button */}
      {showNewTask && (
        <TaskModal
          task={null}
          onClose={() => setShowNewTask(false)}
          onSaved={() => setShowNewTask(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('taskflow-theme') === 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('taskflow-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleDark = () => setDarkMode(d => !d);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background:   darkMode ? '#1f1a2e' : '#fff',
            color:        darkMode ? '#e9d5ff' : '#374151',
            border:       '1px solid',
            borderColor:  darkMode ? '#7c3aed' : '#e9d5ff',
            borderRadius: '0.75rem',
          },
        }}
      />

      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <Protected><Layout darkMode={darkMode} toggleDark={toggleDark} Page={Dashboard} /></Protected>
        } />
        <Route path="/kanban" element={
          <Protected><Layout darkMode={darkMode} toggleDark={toggleDark} Page={Kanban} /></Protected>
        } />
        <Route path="/calendar" element={
          <Protected><Layout darkMode={darkMode} toggleDark={toggleDark} Page={CalendarPage} /></Protected>
        } />

        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
