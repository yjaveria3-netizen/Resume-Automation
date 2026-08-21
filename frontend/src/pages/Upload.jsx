export default function Upload() {
  // TODO (Day 3): Auth-gating check for logged-in user state & real file upload handler

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-khaki-light p-6 md:p-10 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-khaki/40 p-8 shadow-xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-olive-wood">Upload Resume</h1>
          <p className="text-olive-wood/70 text-sm mt-1">
            Upload your base resume file in PDF or DOCX format to parse and auto-update
          </p>
        </div>

        {/* Drag and Drop Zone */}
        <div className="border-2 border-dashed border-khaki rounded-2xl p-10 text-center bg-khaki-light/20 hover:bg-khaki-light/40 transition-colors cursor-pointer space-y-4">
          <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto text-sage">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-olive-wood font-medium">
              Drag and drop your resume file here, or{' '}
              <span className="text-sage underline cursor-pointer">browse</span>
            </p>
            <p className="text-xs text-olive-wood/60 mt-1">
              Supports PDF, DOCX (Max 10MB)
            </p>
          </div>
        </div>

        {/* Selected File Preview Placeholder */}
        <div className="bg-khaki-light/30 rounded-xl border border-khaki/50 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sage/10 text-sage rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-olive-wood">my_resume.docx</p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sage/20 text-sage border border-sage/30">
                  Ready to process
                </span>
              </div>
              <p className="text-xs text-olive-wood/60">1.2 MB</p>
            </div>
          </div>
          <button 
            type="button" 
            className="p-1.5 text-olive-wood/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Remove file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="px-6 py-3 rounded-xl bg-sage text-white font-semibold shadow transition-all hover:bg-sage-hover cursor-pointer"
          >
            Upload Resume
          </button>
        </div>
      </div>
    </div>
  );
}