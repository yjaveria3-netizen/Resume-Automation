import { useState, useEffect, useRef } from 'react';

const REGENERATION_STEPS = [
  {
    id: 1,
    label: 'Querying GitHub API for latest commits',
    desc: 'Fetching top repos, commit history, and activity metadata',
  },
  {
    id: 2,
    label: 'Extracting tech stack & project context',
    desc: 'Analyzing language distribution and framework usage',
  },
  {
    id: 3,
    label: 'Synthesizing tailored bullet points with Gemini AI',
    desc: 'Generating quantified accomplishment bullet points for your role',
  },
  {
    id: 4,
    label: 'Injecting formatted entries into .docx',
    desc: 'Updating document OpenXML structure while preserving font styling',
  },
  {
    id: 5,
    label: 'Computing ATS compatibility score',
    desc: 'Evaluating keyword density, metrics presence, and parseability',
  },
];

/**
 * RegenerationModal Component - Calm Executive Dark Theme
 */
export default function RegenerationModal({
  isOpen,
  isFinished = false,
  resultData: _resultData = null,
  error = null,
  onClose,
  onRetry,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (modalRef.current) {
      modalRef.current.focus();
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setProgress(0);
      return;
    }

    if (error) return;

    if (isFinished) {
      setCurrentStep(5);
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) {
          clearInterval(interval);
          return 92;
        }
        const next = prev + 12;
        if (next < 25) setCurrentStep(1);
        else if (next < 45) setCurrentStep(2);
        else if (next < 68) setCurrentStep(3);
        else if (next < 85) setCurrentStep(4);
        else setCurrentStep(5);
        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen, isFinished, error]);

  if (!isOpen) return null;

  const actualProgress = isFinished ? 100 : progress;

  return (
    <div
      tabIndex={-1}
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06090E]/80 backdrop-blur-xs animate-fade-in outline-none"
    >
      <div className="bg-[#12151C] rounded-xl border border-white/[0.06] shadow-xl max-w-lg w-full p-6 sm:p-7 space-y-4 relative overflow-hidden text-[#ECEEF2]">
        {/* Modal Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#171B24] text-[#F97316] border border-white/[0.06] mb-1">
            {error ? (
              <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : isFinished ? (
              <svg className="w-5 h-5 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 animate-spin text-[#F97316]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-[#ECEEF2]">
            {error ? 'Regeneration Interrupted' : isFinished ? 'Resume Updated Successfully!' : 'Updating Your Resume...'}
          </h2>
          <p className="text-xs text-[#9AA1AE] max-w-xs mx-auto leading-relaxed">
            {error
              ? 'An error occurred during resume regeneration. Please verify your GitHub connection or try again.'
              : isFinished
              ? 'Gemini AI has updated your project bullets and re-computed your ATS score.'
              : 'Our pipeline is gathering commits, generating AI project bullets, and scoring ATS compatibility.'}
          </p>
        </div>

        {/* Progress Bar Container */}
        {!error && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-[#ECEEF2]">
              <span>Pipeline Progress</span>
              <span className="text-[#F97316] font-semibold">{actualProgress}%</span>
            </div>
            <div className="w-full bg-[#0B0D12] rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
              <div
                className="bg-[#F97316] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${actualProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Vertical Step Checklist */}
        <div className="bg-[#0B0D12] rounded-lg border border-white/[0.06] p-3 space-y-2">
          {REGENERATION_STEPS.map((step) => {
            const isCompleted = isFinished || currentStep > step.id;
            const isInProgress = !isFinished && !error && currentStep === step.id;

            return (
              <div key={step.id} className="flex items-start gap-2.5 text-xs">
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <div className="w-4 h-4 rounded-full bg-[#34D399] text-[#0B0D12] flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  ) : isInProgress ? (
                    <div className="w-4 h-4 rounded-full bg-[#F97316] text-[#0B0D12] flex items-center justify-center text-[10px] font-bold">
                      •
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[#171B24] text-[#6B7280] flex items-center justify-center font-normal text-[9px] border border-white/[0.06]">
                      {step.id}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`text-xs ${
                      isCompleted
                        ? 'text-[#34D399] font-medium'
                        : isInProgress
                        ? 'text-[#ECEEF2] font-semibold'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-[#6B7280] leading-tight mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
          {error && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3.5 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Retry Pipeline
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-white/[0.06] bg-[#171B24] hover:bg-[#202531] text-[#ECEEF2] text-xs font-medium transition-colors cursor-pointer"
          >
            {isFinished ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
