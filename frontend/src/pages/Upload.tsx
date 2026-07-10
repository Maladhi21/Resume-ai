import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UploadCloud, File, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.pdf', '.docx'];

    if (!allowed.includes(ext)) {
      toast.error('Only PDF and DOCX formats are supported.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size cannot exceed 5MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    const toastId = toast.loading('Uploading resume file...');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setProgress(percent);
        }
      });

      toast.success(response.data.message || 'Resume uploaded and analyzed successfully!', { id: toastId });
      
      // Redirect to dashboard page
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Upload failed. Please ensure the file is readable and try again.';
      toast.error(message, { id: toastId });
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Upload Resume</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload your latest resume file to perform a structural AI and ATS optimization screening.
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <div
          id="upload-dropzone"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center space-y-4 ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
              : 'border-slate-250 hover:border-indigo-400 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
          }`}
        >
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.docx"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />

          <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/40">
            <UploadCloud className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              Drag and drop your file here, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Supports PDF and DOCX formats (Max 5MB)</p>
          </div>
        </div>

        {file && (
          <div id="selected-file-panel" className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between animate-slide-up">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center rounded-xl border border-indigo-100 dark:border-indigo-900">
                <File className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setFile(null)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 rounded-lg transition font-bold text-xs"
              disabled={uploading}
            >
              Clear
            </button>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>Extracting and analyzing file content...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-3 rounded-xl border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            id="upload-submit-btn"
            type="submit"
            disabled={!file || uploading}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-bold text-sm transition shadow-lg shadow-indigo-500/20 disabled:opacity-55 disabled:cursor-not-allowed"
          >
            <Sparkles className="h-4 w-4" />
            <span>{uploading ? 'Analyzing...' : 'Start AI Analysis'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
