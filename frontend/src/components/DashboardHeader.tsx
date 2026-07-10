import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 px-6 transition-colors duration-200 shadow-sm">
      <div className="flex items-center space-x-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:block">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">AI Resume Analyzer</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Get AI-powered insights to improve your resume</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification Icon */}
        <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600"></span>
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 focus:outline-none focus:ring-0"
          >
            <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold border border-indigo-500 shadow-sm">
              {user ? getInitials(user.name) : 'U'}
            </div>
            <span className="hidden md:flex items-center space-x-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span>{user ? user.name : 'User'}</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </span>
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay blocker */}
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
              
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-20 transition-colors duration-200">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user ? user.email : 'user@example.com'}
                  </p>
                </div>
                
                <Link
                  to="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <User className="h-4 w-4 opacity-75" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  <Settings className="h-4 w-4 opacity-75" />
                  <span>Settings</span>
                </Link>

                <hr className="border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                >
                  <LogOut className="h-4 w-4 opacity-75" />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
