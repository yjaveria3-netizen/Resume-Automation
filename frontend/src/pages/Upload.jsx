import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ExecutiveLayout from '../components/layout/ExecutiveLayout';
import { uploadResume } from '../api/resumes';

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const validateFile = (file) => {
    setErrorMessage('');
    if (!file) return false;

    const hasDocxExtension = file.name.toLowerCase().endsWith('.docx');
    if (!hasDocxExtension) {
      setErrorMessage('Invalid file format. Only Microsoft Word (.docx) files are supported.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(`File size (${fileSizeMB} MB) exceeds maximum allowed limit of 5 MB.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleLoadSampleResume = async () => {
    try {
      const response = await fetch('/sample_resume.docx');
      if (!response.ok) throw new Error('Sample resume file not found');
      const blob = await response.blob();
      const file = new File([blob], 'Software_Engineer_Resume.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      setSelectedFile(file);
      setErrorMessage('');
    } catch (err) {
      console.warn('Could not load sample resume:', err);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setErrorMessage('');
    setUploadProgress(15);

    try {
      await uploadResume(selectedFile, (progress) => {
        setUploadProgress(Math.max(15, progress));
      });

      setUploadProgress(100);

      setTimeout(() => {
        navigate('/dashboard', {
          state: { toast: `Resume "${selectedFile.name}" successfully uploaded and processed!` },
        });
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Upload failed. Please check backend connection.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <ExecutiveLayout
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Upload Master' }]}
    >
      <div className="max-w-2xl mx-auto pt-4 pb-12">
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#9AA1AE]">
                  Document Ingestion
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#ECEEF2] tracking-tight mt-0.5">
                Upload Master Resume
              </h1>
              <p className="text-[#9AA1AE] text-xs mt-0.5">
                Upload your base resume file in Word (.docx) format for automated GitHub commit synchronization
              </p>
            </div>
            <Link
              to="/dashboard"
              className="text-xs text-[#9AA1AE] hover:text-[#ECEEF2] font-medium self-start sm:self-auto flex items-center gap-1 transition-colors"
            >
              ← Back
            </Link>
          </div>

          {/* Validation Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-rose-300 text-xs font-normal animate-fade-in">
              <svg className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Hidden Native File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".docx"
            className="hidden"
          />

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors cursor-pointer space-y-3 ${
              isDragging
                ? 'border-[#F97316] bg-[#F97316]/5'
                : 'border-white/[0.12] bg-[#0B0D12] hover:bg-white/[0.02] hover:border-white/[0.20]'
            }`}
          >
            <div className="w-12 h-12 bg-[#171B24] rounded-xl border border-white/[0.06] flex items-center justify-center mx-auto text-[#ECEEF2]">
              <svg className="w-6 h-6 text-[#9AA1AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium text-[#ECEEF2]">
                Drag and drop your resume file here, or{' '}
                <span className="text-[#F97316] underline underline-offset-2">browse files</span>
              </p>
              <p className="text-xs text-[#6B7280]">
                Strictly Microsoft Word (.docx) files up to 5 MB
              </p>
            </div>
          </div>

          {/* Selected File Preview Card */}
          {selectedFile && (
            <div className="bg-[#0B0D12] rounded-lg border border-white/[0.06] p-3.5 flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#171B24] text-[#ECEEF2] rounded-lg border border-white/[0.06]">
                  <svg className="w-4 h-4 fill-current text-[#9AA1AE]" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                    <path d="M15.2 13h-1.8l-1.4 3.6L10.6 13H8.8l2.3 5.4h1.8z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-medium text-[#ECEEF2] truncate max-w-[200px] sm:max-w-xs">
                      {selectedFile.name}
                    </p>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
                      Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              {!uploading && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-[#6B7280] hover:text-[#F87171] hover:bg-[#F87171]/10 rounded-lg transition-colors cursor-pointer"
                  title="Remove file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-normal text-[#9AA1AE]">
                <span>Parsing OpenXML document structure & line budget...</span>
                <span className="text-[#F97316] font-medium">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#0B0D12] rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
                <div
                  className="bg-[#F97316] h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleLoadSampleResume}
              className="px-3.5 py-2 rounded-lg border border-white/[0.06] bg-[#171B24] hover:bg-[#202531] text-[#ECEEF2] text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>📄</span>
              <span>Use Sample Resume (.docx)</span>
            </button>

            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={!selectedFile || uploading}
              className="px-5 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] active:scale-95 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing Document...</span>
                </>
              ) : (
                <span>Upload & Process Resume →</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </ExecutiveLayout>
  );
}
