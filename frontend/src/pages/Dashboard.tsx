import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FileText,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen,
  LayoutGrid,
  RefreshCw,
  Download,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Resume } from '../types';

export default function Dashboard() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);

  const fetchLatestResume = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/resumes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.length > 0) {
        // Sort by date to get latest
        const sorted = response.data.sort(
          (a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        setResume(sorted[0]);
      }
    } catch (err: any) {
      console.error('Error fetching resume:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestResume();
  }, []);

  const handleReanalyze = async () => {
    if (!resume) return;
    setReanalyzing(true);
    const toastId = toast.loading('Re-analyzing your resume with AI...');
    try {
      const token = localStorage.getItem('token');
      const resumeId = resume._id || resume.id;
      const response = await axios.post(`/api/resumes/${resumeId}/analyze`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Resume analyzed successfully with fresh insights!', { id: toastId });
      // Update state
      setResume(prev => prev ? { ...prev, analysisResult: response.data.analysisResult } : null);
    } catch (err: any) {
      toast.error('AI Re-analysis failed. Please try again.', { id: toastId });
    } finally {
      setReanalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!resume) return;
    try {
      const token = localStorage.getItem('token');
      const resumeId = resume._id || resume.id;
      const response = await axios.get(`/api/resumes/${resumeId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      // Trigger file download in browser
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resume.originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Downloaded file successfully!');
    } catch (err) {
      toast.error('Failed to download resume file.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading your profile dashboard...</span>
        </div>
      </div>
    );
  }

  // Empty State if no resumes uploaded
  if (!resume) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-8 animate-fade-in">
        <div className="h-20 w-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-lg shadow-indigo-100 dark:shadow-none">
          <FileText className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Analyze your first resume</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            Upload your resume in PDF or DOCX format. Get an instant ATS compatibility score, formatting feedback, and concrete suggestions for landing your next role.
          </p>
        </div>
        <div>
          <Link
            id="empty-upload-btn"
            to="/dashboard/upload"
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all duration-150 shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus className="h-5 w-5" />
            <span>Upload Resume</span>
          </Link>
        </div>
      </div>
    );
  }

  const analysis = resume.analysisResult;
  if (!analysis) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="h-14 w-14 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 mx-auto">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Pending</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Your uploaded resume is pending analysis. Press Re-analyze below to trigger the audit.</p>
        </div>
        <button
          onClick={handleReanalyze}
          disabled={reanalyzing}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 mx-auto disabled:opacity-50 shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <RefreshCw className={`h-4 w-4 ${reanalyzing ? 'animate-spin' : ''}`} />
          <span>Analyze Resume</span>
        </button>
      </div>
    );
  }

  // Radar chart data for Section scores
  const chartData = [
    { subject: 'Content', A: analysis.sectionScores?.content || 50, fullMark: 100 },
    { subject: 'Skills', A: analysis.sectionScores?.skills || 50, fullMark: 100 },
    { subject: 'Experience', A: analysis.sectionScores?.experience || 50, fullMark: 100 },
    { subject: 'Education', A: analysis.sectionScores?.education || 50, fullMark: 100 },
    { subject: 'Formatting', A: analysis.sectionScores?.formatting || 50, fullMark: 100 },
  ];

  // Formatting date
  const formattedDate = new Date(resume.uploadedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Overview Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Resume Overview Card */}
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-6 shadow-lg shadow-indigo-100/50 dark:shadow-none flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Active Resume</h3>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/40 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-grow">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{resume.originalFileName}</p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Uploaded {formattedDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-900">
            <button
              id="reanalyze-btn"
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
              <span>{reanalyzing ? 'Analyzing...' : 'Re-analyze'}</span>
            </button>
            <button
              id="download-btn"
              onClick={handleDownload}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Overall Score Progress Card */}
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-6 shadow-lg shadow-indigo-100/50 dark:shadow-none flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Overall Score</h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">Excellent</span>
          </div>

          <div className="flex items-center space-x-6 my-4">
            <div className="relative flex items-center justify-center h-28 w-28 flex-shrink-0">
              {/* Outer circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-slate-100 dark:stroke-slate-900"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-indigo-600"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - (analysis.overallScore || 0) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-2xl font-black text-slate-800 dark:text-white">
                {analysis.overallScore}<span className="text-xs text-slate-400 dark:text-slate-500 font-medium">/100</span>
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Keep it up! 🎉</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your resume performs exceptionally well. Check suggestions to secure full ATS approval.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-900 pt-4">
            <div className="text-center">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Strengths Found</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{analysis.strengths?.length || 0}</p>
            </div>
            <div className="text-center border-l border-slate-100 dark:border-slate-900">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Improvement Steps</p>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{analysis.suggestions?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* ATS Compatibility Chart */}
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-6 shadow-lg shadow-indigo-100/50 dark:shadow-none flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">ATS Compatibility</h3>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">ATS Friendly</span>
          </div>

          <div className="flex items-center space-x-6 my-4">
            <div className="relative flex items-center justify-center h-28 w-28 flex-shrink-0">
              {/* Outer circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-slate-100 dark:stroke-slate-900"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-emerald-500"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - (analysis.atsScore || 0) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-2xl font-black text-slate-800 dark:text-white">
                {analysis.atsScore}%
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">High Approval Rate</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Formatting and key skills provide strong keyword mapping for screening triggers.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-900 pt-4 flex items-center justify-between">
            <span>ATS Approved Standard</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">Passing: &gt;75%</span>
          </div>
        </div>

      </div>

      {/* Main Core Breakdown and Skills area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Core Breakdown Progress Bars (Deep Indigo Container in Light Mode!) */}
        <div className="lg:col-span-3 bg-indigo-900 text-white dark:bg-slate-950 rounded-3xl p-8 shadow-xl shadow-indigo-100/40 dark:shadow-none space-y-6">
          <h3 className="text-base font-extrabold tracking-tight text-white dark:text-white">Score Breakdown</h3>
          
          <div className="space-y-5">
            {chartData.map((bar) => (
              <div key={bar.subject} className="space-y-1.5">
                <div className="flex justify-between text-sm font-bold text-slate-200 dark:text-slate-300">
                  <span>{bar.subject}</span>
                  <span>{bar.A}/100</span>
                </div>
                <div className="h-2 w-full bg-indigo-850 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white dark:bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${bar.A}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-indigo-800/80 dark:border-slate-900 flex justify-between items-center text-xs text-indigo-200 dark:text-slate-500">
            <span>Overall Evaluation Structure</span>
            <Link to="/dashboard/history" className="text-indigo-200 dark:text-indigo-400 font-bold hover:text-white dark:hover:underline flex items-center space-x-1">
              <span>View Past Scores</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Top Skills Found Chips */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-8 shadow-lg shadow-indigo-100/50 dark:shadow-none flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="text-base font-extrabold tracking-tight text-slate-800 dark:text-white">Top Skills Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The following keywords and technologies were automatically mapped and highlighted from your active resume.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {analysis.skills && analysis.skills.length > 0 ? (
                analysis.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3.5 py-2 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100/30 dark:border-indigo-900/30 transition duration-150"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <div className="py-6 text-center text-slate-500 text-xs">No technical skills detected. Please add a skills section.</div>
              )}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-900 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            * Evaluated from custom parsed technical dictionaries.
          </div>
        </div>

      </div>

      {/* Strengths and Improvements lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Strengths card */}
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-8 shadow-lg shadow-indigo-100/50 dark:shadow-none space-y-6">
          <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">Key Strengths Found</h3>
          </div>
          <ul className="space-y-4">
            {analysis.strengths && analysis.strengths.length > 0 ? (
              analysis.strengths.map((strength, i) => (
                <li key={i} className="flex items-start space-x-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <div className="h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5 font-bold text-xs">
                    ✓
                  </div>
                  <span>{strength}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 text-sm">Formatting evaluated. Standard spacing validated.</li>
            )}
          </ul>
        </div>

        {/* Suggestions Card */}
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-8 shadow-lg shadow-indigo-100/50 dark:shadow-none space-y-6">
          <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">Improvement Suggestions</h3>
          </div>
          <ul className="space-y-4">
            {analysis.suggestions && analysis.suggestions.length > 0 ? (
              analysis.suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start space-x-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed group cursor-pointer hover:text-slate-950 dark:hover:text-white transition duration-150">
                  <div className="h-5 w-5 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 font-bold text-xs">
                    !
                  </div>
                  <span className="flex-grow">{suggestion}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                </li>
              ))
            ) : (
              <li className="text-emerald-500 text-sm">Perfect resume score! No critical suggestions found.</li>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}
