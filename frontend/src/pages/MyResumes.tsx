import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Resume } from '../types';

export default function MyResumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const response = await axios.get(
  `${API_URL}/api/resumes`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

const resumesData = Array.isArray(response.data)
  ? response.data
  : response.data.resumes || [];

    setResumes(resumesData);
    } catch (err: any) {
      toast.error('Failed to load uploaded resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resume and all of its associated analysis reports? This action cannot be undone.')) {
      return;
    }

    const toastId = toast.loading('Deleting resume...');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/resumes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Resume deleted successfully.', { id: toastId });
      setResumes(prev => prev.filter(r => r._id !== id && r.id !== id));
    } catch (err: any) {
      toast.error('Failed to delete resume. Please try again.', { id: toastId });
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/resumes/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded file successfully!');
    } catch (err) {
      toast.error('Failed to download resume file.');
    }
  };

  const handleReanalyze = async (id: string) => {
    const toastId = toast.loading('Re-analyzing with fresh AI schemas...');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/resumes/${id}/analyze`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('AI Re-analysis complete!', { id: toastId });
      fetchResumes();
    } catch (err) {
      toast.error('Failed to perform analysis. Try again.', { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500 font-medium">Retrieving resume archives...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Resumes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View, download, delete, or perform updated AI re-analysis on your uploaded documents.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard/upload')}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-bold text-sm transition shadow-lg shadow-indigo-500/20"
        >
          <Plus className="h-5 w-5" />
          <span>Upload Resume</span>
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-6 bg-white dark:bg-slate-950">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto border border-indigo-100 dark:border-indigo-900">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No resumes found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Your uploaded resume lists are currently empty. Click the button above to upload and analyze your first resume.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((res) => {
            const date = new Date(res.uploadedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const analysis = res.analysisResult;

            return (
              <div
                key={res._id || res.id}
                className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-5 shadow-lg shadow-indigo-100/50 dark:shadow-none hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30">
                      <FileText className="h-5 w-5" />
                    </div>
                    
                    {analysis && (
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-450 uppercase tracking-wider block mb-0.5">Score</span>
                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{analysis.overallScore}/100</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition duration-150">
                      {res.originalFileName}
                    </h4>
                    <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{date}</span>
                    </div>
                  </div>

                  {analysis && (
                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-100 dark:border-slate-900 py-3 mt-4">
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">ATS Match:</span>
                        <p className="font-extrabold text-emerald-500 mt-0.5">{analysis.atsScore}%</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Suggestions:</span>
                        <p className="font-extrabold text-amber-500 mt-0.5">{analysis.suggestions?.length || 0} steps</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2">
                  <button
                    onClick={() => {
                      // Set this as active by refreshing dashboard
                      navigate('/dashboard');
                    }}
                    title="View Full Dashboard Analysis"
                    className="p-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(res._id || res.id, res.originalFileName)}
                    title="Download Physical File"
                    className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReanalyze(res._id || res.id)}
                    title="Re-analyze with AI"
                    className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(res._id || res.id)}
                    title="Delete Permanently"
                    className="p-2.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
