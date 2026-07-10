import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  History,
  Bookmark,
  User,
  Settings,
  LogOut,
  FileSearch,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully.');
    if (onClose) onClose();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Resume', path: '/dashboard/upload', icon: UploadCloud },
    { name: 'My Resumes', path: '/dashboard/resumes', icon: FileText },
    { name: 'Analysis History', path: '/dashboard/history', icon: History },
    { name: 'Saved Reports', path: '/dashboard/saved-reports', icon: Bookmark },
    { name: 'Profile', path: '/dashboard/profile', icon: User },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs md:hidden transition-opacity duration-200"
          onClick={onClose}
        ></div>
      )}

      <aside
        id="dashboard-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 flex flex-col justify-between`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-900">
          <NavLink to="/" className="flex items-center space-x-3" onClick={onClose}>
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <FileSearch className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-800 dark:text-white block">
                AI Resume
              </span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold block uppercase tracking-wider">
                Analyzer
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation links */}
        <div className="flex-grow py-6 px-4 overflow-y-auto space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </div>

      {/* Bottom Profile details & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-900 space-y-3">
        {/* Upgrade Card placeholder */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-100 dark:shadow-none">
          <span className="text-xs font-bold uppercase tracking-wider block mb-1">👑 Go Premium</span>
          <p className="text-[11px] text-indigo-100 mb-3">Unlock advanced analysis, keyword insights, and more.</p>
          <button className="w-full py-2 bg-white text-indigo-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition shadow-sm">
            Upgrade Now
          </button>
        </div>

        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  </>
  );
}
