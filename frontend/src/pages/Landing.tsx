import { Link } from 'react-router-dom';
import { FileSearch, Sparkles, Trophy, CheckCircle, Download, ArrowRight, Github, Linkedin } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  const token = localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 bg-grid-pattern">
      {/* Landing Navbar */}
      <nav id="landing-nav" className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <FileSearch className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                AI Resume <span className="text-indigo-600 dark:text-indigo-400">Analyzer</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {token ? (
                <Link
                  id="nav-dashboard-btn"
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-all duration-150 shadow-md shadow-indigo-500/20"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    id="nav-login-btn"
                    to="/login"
                    className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    id="nav-register-btn"
                    to="/register"
                    className="px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-all duration-150 shadow-md shadow-indigo-500/20"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero-section" className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-indigo-750 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span>AI-Powered Insights & Real-time Analysis</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            Get AI-Powered Feedback to <br />
            <span className="bg-gradient-to-r from-indigo-650 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
              Improve Your Resume
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Optimize your resume for applicant tracking systems (ATS), discover key skills, improve formatting, and secure more job interviews with instant smart suggestions.
          </p>

          <div className="flex justify-center">
            <Link
              id="hero-cta-btn"
              to={token ? "/dashboard/upload" : "/register"}
              className="group flex items-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all duration-150 shadow-xl shadow-indigo-500/25 dark:shadow-indigo-500/10 hover:translate-y-[-1px]"
            >
              <span>Upload Resume Now</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Supercharge Your Job Search
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Our advanced analyzer inspects your resume across multiple key vectors to match modern hiring standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-indigo-100/50 dark:shadow-none hover:shadow-xl transition duration-250">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">AI Analysis</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Advanced structural text analysis using Google Gemini or OpenAI to audit your experience, impact, and phrasing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-indigo-100/50 dark:shadow-none hover:shadow-xl transition duration-250">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">ATS Score</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Get a score indicating how readable your resume is to automated Applicant Tracking Systems and filters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-indigo-100/50 dark:shadow-none hover:shadow-xl transition duration-250">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Skill Detection</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Instantly map technical, soft, and industry skill terms present in your career history for optimization.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-indigo-100/50 dark:shadow-none hover:shadow-xl transition duration-250">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <Sparkles className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Smart Suggestions</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Receive customized recommendations for adding metrics, formatting details, and stronger active verbs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-indigo-100/50 dark:shadow-none hover:shadow-xl transition duration-250">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <Download className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Export Report</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Easily save and download your resume audit history for later revision. Keep copies of previous scores.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl border border-slate-150 dark:border-slate-800 bg-gradient-to-br from-indigo-600 to-indigo-850 text-white shadow-xl shadow-indigo-200 dark:shadow-none flex flex-col justify-center items-center text-center">
              <h3 className="text-2xl font-black mb-3 tracking-tight">Ready to Start?</h3>
              <p className="text-indigo-100 text-xs mb-6 max-w-xs leading-relaxed">
                Upload your resume in PDF or DOCX format to receive your detailed analysis inside 10 seconds.
              </p>
              <Link
                id="feature-cta-btn"
                to={token ? "/dashboard/upload" : "/register"}
                className="px-6 py-3 bg-white text-indigo-700 hover:bg-slate-50 rounded-xl font-bold transition shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="landing-footer" className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <FileSearch className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-lg text-slate-850 dark:text-white">AI Resume Analyzer</span>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; © 2026 AI Resume Analyzer. All rights reserved.
          </p>

          <div className="flex space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              aria-label="GitHub Link"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              aria-label="LinkedIn Link"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
