import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

    // Strict .docx format validation
    const hasDocxExtension = file.name.toLowerCase().endsWith('.docx');
    if (!hasDocxExtension) {
      setErrorMessage('Invalid file format. Only Microsoft Word (.docx) files are supported.');
      return false;
    }

    // Size validation (<5MB)
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

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setErrorMessage('');
    setUploadProgress(10);

    try {
      await uploadResume(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      setUploadProgress(100);

      setTimeout(() => {
        navigate('/dashboard', {
          state: { toast: `Resume "${selectedFile.name}" successfully uploaded and saved!` },
        });
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-khaki-light p-6 md:p-10 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-khaki/40 p-8 shadow-xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-olive-wood">Upload Resume</h1>
          <p className="text-olive-wood/70 text-sm mt-1">
            Upload your base resume file in DOCX format to parse and auto-update
          </p>
        </div>

        {/* Validation Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-fade-in">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>{errorMessage}</div>
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
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer space-y-4 ${
            isDragging
              ? 'border-sage bg-sage/10 scale-[1.01]'
              : 'border-khaki bg-khaki-light/20 hover:bg-khaki-light/40'
          }`}
        >
          <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto text-sage">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-olive-wood font-medium">
              Drag and drop your resume file here, or{' '}
              <span className="text-sage underline font-semibold">browse files</span>
            </p>
            <p className="text-xs text-olive-wood/60 mt-1">
              Strictly supports .docx files (Max size: 5MB)
            </p>
          </div>
        </div>

        {/* Selected File Preview Card */}
        {selectedFile && (
          <div className="bg-khaki-light/40 rounded-xl border border-khaki/50 p-4 flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl shadow-sm">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                  <path d="M15.2 13h-1.8l-1.4 3.6L10.6 13H8.8l2.3 5.4h1.8z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-olive-wood truncate max-w-[240px]">
                    {selectedFile.name}
                  </p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage/20 text-sage border border-sage/30">
                    Ready to Upload
                  </span>
                </div>
                <p className="text-xs text-olive-wood/60 mt-0.5">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            {!uploading && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-2 text-olive-wood/50 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Remove file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-olive-wood">
              <span>Uploading Resume...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-khaki/30 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-sage h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload CTA Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={!selectedFile || uploading}
            className="px-6 py-3 rounded-xl bg-sage text-white font-semibold shadow transition-all hover:bg-sage-hover cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading && (
              <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}