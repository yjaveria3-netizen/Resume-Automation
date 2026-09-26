import { getDownloadUrl } from '../../api/resumes';

/**
 * VersionHistoryList component
 *
 * Renders a clean version history listing matching project theme tokens.
 */
export default function VersionHistoryList({ versions = [], onSelectVersion, selectedVersionId }) {
  if (!versions || versions.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-khaki/40 p-10 text-center space-y-3 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-sage/15 text-sage flex items-center justify-center mx-auto border border-sage/30">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-base font-extrabold text-olive-wood">No Previous Builds Found</h4>
        <p className="text-xs text-olive-wood/70 max-w-sm mx-auto leading-relaxed font-medium">
          Click the "Update Resume Now" button on your dashboard sidebar to run Gemini AI regeneration and create your first version.
        </p>
      </div>
    );
  }

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-extrabold text-olive-wood flex items-center gap-2">
          <svg className="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Version History ({versions.length})
        </h3>
        <span className="text-xs text-olive-wood/60 font-semibold">Sorted by latest build</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {versions.map((v) => {
          const isSelected = selectedVersionId === v.id;
          const downloadLink = getDownloadUrl(v.id);

          return (
            <div
              key={v.id}
              className={`bg-white rounded-2xl border p-4.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-sm ${
                isSelected
                  ? 'border-sage ring-2 ring-sage/20 bg-sage/5'
                  : 'border-khaki/40 hover:border-khaki'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-sage/15 text-sage flex items-center justify-center font-extrabold text-sm shadow-xs border border-sage/30 flex-shrink-0">
                  v{v.version_number}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-olive-wood text-sm">
                      Updated_Resume_v{v.version_number}.docx
                    </span>
                    {v.ats_score && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          v.ats_score >= 80
                            ? 'bg-sage/20 text-sage-hover border-sage/40'
                            : v.ats_score >= 60
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        ATS {v.ats_score}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-olive-wood/60 font-medium mt-0.5">
                    Generated: {formatDate(v.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 justify-end">
                {onSelectVersion && (
                  <button
                    type="button"
                    onClick={() => onSelectVersion(v)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sage text-white border-sage'
                        : 'bg-khaki-light/60 text-olive-wood border-khaki/50 hover:bg-khaki-light'
                    }`}
                  >
                    {isSelected ? 'Active Preview' : 'Select'}
                  </button>
                )}

                <a
                  href={downloadLink}
                  download={`Updated_Resume_v${v.version_number}.docx`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-sage hover:bg-sage-hover text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download .docx</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
