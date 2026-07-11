import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileText, Bookmark, Calendar, ChevronRight } from 'lucide-react';
import { Resume } from '../types';

export default function SavedReports() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

        // Filtering saved / high-performing reports scoring 80+
        const highScoring = response.data.filter(
          (r: any) => r.analysisResult && r.analysisResult.overallScore >= 80
        );
        setResumes(highScoring);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Saved Reports</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A customized folder showcasing elite and high-performing resume audits (Score &ge; 80/100).
        </p>
      </div>

      {resumes.length === 0 ? (
        <div className="p-12 border border-slate-200 dark:border-slate-800 rounded-3xl text-center text-slate-500 bg-white dark:bg-slate-950 space-y-4 shadow-sm">
          <Bookmark className="h-10 w-10 mx-auto text-indigo-300" />
          <h4 className="font-bold text-slate-800 dark:text-white text-base">No saved reports</h4>
          <p className="text-xs max-w-xs mx-auto leading-relaxed">Once your resume score hits 80 or above through improvements, it will automatically bookmark and display here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {Array.isArray(resumes) && resumes.map((res) => {
            const date = new Date(res.uploadedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            return (
              <div
                key={res._id || res.id}
                onClick={() => navigate('/dashboard')}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 shadow-lg shadow-indigo-100/50 dark:shadow-none hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100/30 dark:border-indigo-900/30">
                      <Bookmark className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">Elite</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition">
                      {res.originalFileName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Saved on {date}</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-900">
                  <span className="text-xs text-slate-400 font-bold">Overall: {res.analysisResult?.overallScore}/100</span>
                  <ChevronRight className="h-4 w-4 text-indigo-500 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
