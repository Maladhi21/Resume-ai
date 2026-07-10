import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ChevronDown,
  X,
  TrendingUp,
} from 'lucide-react';
import { Resume, AnalysisResult } from '../types';

export default function History() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/resumes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumes(response.data);
    } catch (err: any) {
      toast.error('Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const filteredResumes = resumes.filter((res) => {
    const matchSearch = res.originalFileName.toLowerCase().includes(search.toLowerCase());
    const score = res.analysisResult?.overallScore || 0;
    const matchScore = score >= minScore;
    return matchSearch && matchScore;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Analysis History</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Search and inspect detailed reports of all your previous resume evaluation and ATS optimization attempts.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl p-4 shadow-lg shadow-indigo-100/40 dark:shadow-none flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by resume file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white transition"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">Min Score:</span>
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-slate-250 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-semibold outline-none text-slate-700 dark:text-slate-300 transition"
          >
            <option value="0">All Scores</option>
            <option value="50">50+</option>
            <option value="70">70+ (Passing)</option>
            <option value="85">85+ (Elite)</option>
          </select>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 border-3 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredResumes.length === 0 ? (
        <div className="p-12 border border-slate-200 dark:border-slate-800 rounded-3xl text-center text-slate-500 text-sm bg-white dark:bg-slate-950">
          No analysis reports match your filter constraints.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl overflow-x-auto shadow-lg shadow-indigo-100/40 dark:shadow-none">
          <table className="min-w-full divide-y divide-slate-150 dark:divide-slate-900">
            <thead className="bg-slate-50 dark:bg-slate-950/60">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Resume Name
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Uploaded Date
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ATS score
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Overall Score
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-900 text-sm">
              {filteredResumes.map((res) => {
                const date = new Date(res.uploadedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const analysis = res.analysisResult;
                if (!analysis) return null;

                return (
                  <tr key={res._id || res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition duration-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-indigo-555" />
                        <span className="font-bold text-slate-800 dark:text-white truncate max-w-xs">
                          {res.originalFileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-emerald-500 font-bold">
                      {analysis.atsScore}% Match
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        analysis.overallScore >= 80
                          ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : analysis.overallScore >= 70
                          ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {analysis.overallScore} / 100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedAnalysis(analysis)}
                        className="px-4 py-1.5 rounded-lg border border-slate-250 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 text-indigo-600 dark:text-indigo-400 transition"
                      >
                        Inspect Report
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal Component */}
      {selectedAnalysis && (
        <div id="history-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto space-y-6 animate-scale-up">
            <button
              onClick={() => setSelectedAnalysis(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-900">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                <span>Resume Audit Record</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-md">
                Overall: {selectedAnalysis.overallScore}/100
              </span>
            </div>

            <div className="space-y-6">
              {/* Score segments */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Segment Scores</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Object.entries(selectedAnalysis.sectionScores || {}).map(([key, value]) => (
                    <div key={key} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center border border-slate-100 dark:border-slate-900/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{key}</span>
                      <span className="text-base font-black text-slate-800 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Found */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Detected Technical Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAnalysis.skills?.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths / Suggestions lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-emerald-650 dark:text-emerald-400">Strengths Validated</h5>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {selectedAnalysis.strengths?.map((str, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-500 flex-shrink-0 font-bold">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400">Next Action Steps</h5>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {selectedAnalysis.suggestions?.map((sug, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-amber-500 flex-shrink-0 font-bold">!</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-900 text-right">
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
