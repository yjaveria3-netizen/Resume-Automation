import { getDownloadUrl } from '../../api/resumes';

/**
 * VersionHistoryList Component - Calm Executive Dark Theme
 *
 * Clean vertical timeline of resume versions with ATS scores,
 * generation timestamps, and direct download buttons.
 */
export default function VersionHistoryList({ versions = [], onSelectVersion, selectedVersionId }) {
  if (!versions || versions.length === 0) {
    return (
      <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-8 text-center space-y-2.5 shadow-xs">
        <div className="w-10 h-10 rounded-lg bg-[#171B24] text-[#9AA1AE] flex items-center justify-center mx-auto border border-white/[0.06]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-[#ECEEF2]">No Previous Builds Found</h4>
        <p className="text-xs text-[#9AA1AE] max-w-sm mx-auto leading-relaxed">
          Trigger the resume update pipeline to synthesize fresh GitHub commits and generate your first version build.
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
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-[#ECEEF2] flex items-center gap-1.5 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
          Build Version History ({versions.length})
        </h3>
        <span className="text-[11px] text-[#6B7280]">Latest builds first</span>
      </div>

      <div className="space-y-2">
        {versions.map((v) => {
          const isSelected = selectedVersionId === v.id;
          const downloadLink = getDownloadUrl(v.id);

          return (
            <div
              key={v.id}
              className={`bg-[#12151C] rounded-lg border p-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-white/[0.12] ${
                isSelected
                  ? 'border-[#F97316]/50 bg-[#171B24]'
                  : 'border-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0B0D12] border border-white/[0.06] text-[#ECEEF2] flex items-center justify-center font-medium text-xs shrink-0">
                  v{v.version_number}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#ECEEF2] text-xs sm:text-sm">
                      Resume_Build_v{v.version_number}.docx
                    </span>
                    {v.ats_score && (
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                          v.ats_score >= 80
                            ? 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20'
                            : v.ats_score >= 60
                            ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20'
                            : 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/20'
                        }`}
                      >
                        ATS {v.ats_score}%
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#9AA1AE] mt-0.5">
                    Synthesized: {formatDate(v.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                {onSelectVersion && (
                  <button
                    type="button"
                    onClick={() => onSelectVersion(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#F97316] text-white border-transparent'
                        : 'bg-[#171B24] text-[#ECEEF2] border-white/[0.06] hover:bg-[#202531]'
                    }`}
                  >
                    {isSelected ? 'Active Preview' : 'Select'}
                  </button>
                )}

                <a
                  href={downloadLink}
                  download={`Resume_Build_v${v.version_number}.docx`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#171B24] hover:bg-[#202531] text-[#ECEEF2] border border-white/[0.06] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 text-[#9AA1AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
