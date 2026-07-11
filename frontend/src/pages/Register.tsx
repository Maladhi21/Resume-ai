import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileSearch, User, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field Valids
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creating your account...');

    try {
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const response = await axios.post(
  `${API_URL}/api/auth/register`,
  formData,
  {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  }
);
      toast.success(response.data.message || 'Account registered successfully!', { id: toastId });
      
      // Save credentials & redirect
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-900 transition-colors duration-200 bg-grid-pattern">
      {/* Top bar with logo and theme toggle */}
      <header className="px-6 py-4 flex justify-between items-center bg-white/50 dark:bg-slate-950/20 backdrop-blur-sm">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <FileSearch className="h-4.5 w-4.5" />
          </div>
          <span className="font-extrabold text-lg text-slate-800 dark:text-white">AI Resume Analyzer</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main card */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-indigo-100/50 dark:shadow-none transition-colors duration-200">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Create your account</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
                Log in
              </Link>
            </p>
          </div>

          {error && (
            <div id="register-error" className="flex items-center space-x-2 p-4 mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="register-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white transition duration-150"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white transition duration-150"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white transition duration-150"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white transition duration-150"
                />
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-bold text-sm transition shadow-lg shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        &copy; 2026 AI Resume Analyzer. All rights reserved.
      </footer>
    </div>
  );
}
