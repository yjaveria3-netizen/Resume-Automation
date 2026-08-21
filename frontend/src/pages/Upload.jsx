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

        {/* Drag and Drop Zone Placeholder */}
        <div className="border-2 border-dashed border-khaki rounded-2xl p-12 text-center bg-khaki-light/20 hover:bg-khaki-light/40 transition-colors cursor-pointer space-y-4">
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
