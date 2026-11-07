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
 * RegenerationModal component
 *
 * Renders a clean backdrop modal with step checklist and progress indicator
 * matching the team's Khaki / Sage / Olive-Wood design system.
 */
export default function RegenerationModal({
  isOpen,
  isFinished = false,
  resultData = null,
  error = null,
  onClose,
  onRetry,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const modalRef = useRef(null);

  // Close modal on Escape key press and trap focus
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

    const stepInterval = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep < 5) {
          const nextStep = prevStep + 1;
          setProgress(Math.round(((nextStep - 1) / 5) * 100));
          return nextStep;
        }
        return 5;
      });
    }, 1600);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 92 && !isFinished) {
          return prev + 1;
        }
        return prev;
      });
    }, 180);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen, isFinished, error]);

  if (!isOpen) return null;

  const actualProgress = isFinished ? 100 : progress;

  return (
    <div
      tabIndex={-1}
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-olive-wood/65 backdrop-blur-xs animate-fade-in outline-none"
    >
      <div className="bg-white rounded-3xl border border-khaki/50 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Soft background glow accents */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-sage/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-khaki/20 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sage/15 text-sage ring-8 ring-sage/5 mb-1">
            {error ? (
              <svg className="w-7 h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : isFinished ? (
              <svg className="w-7 h-7 text-sage-hover" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-7 h-7 animate-spin text-sage" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </div>

          <h2 className="text-2xl font-extrabold text-olive-wood">
            {error ? 'Regeneration Interrupted' : isFinished ? 'Resume Updated Successfully!' : 'Updating Your Resume...'}
          </h2>
          <p className="text-xs text-olive-wood/70 max-w-xs mx-auto leading-relaxed">
            {error
              ? 'An error occurred during resume regeneration. Please verify your GitHub connection or try again.'
              : isFinished
              ? 'Gemini AI has updated your project bullets and re-computed your ATS score.'
              : 'Our multi-stage pipeline is gathering commits, generating AI project bullets, and scoring ATS compatibility.'}
          </p>
        </div>

        {/* Progress Bar Container */}
        {!error && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-olive-wood">
              <span className="text-olive-wood/80">Overall Pipeline Progress</span>
              <span className="text-sage font-extrabold">{actualProgress}%</span>
            </div>
            <div className="w-full bg-khaki-light rounded-full h-3 p-0.5 overflow-hidden border border-khaki/40">
              <div
                className="bg-sage h-full rounded-full transition-all duration-300 ease-out shadow-xs"
                style={{ width: `${actualProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Vertical Step Checklist */}
        <div className="bg-khaki-light/50 rounded-2xl border border-khaki/40 p-4 space-y-3">
          {REGENERATION_STEPS.map((step) => {
            const isCompleted = isFinished || currentStep > step.id;
            const isInProgress = !isFinished && !error && currentStep === step.id;

            return (
              <div key={step.id} className="flex items-start gap-3 text-xs">
                <div className="mt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-sage text-white flex items-center justify-center shadow-xs">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isInProgress ? (
                    <div className="w-5 h-5 rounded-full bg-sage/20 text-sage border border-sage flex items-center justify-center animate-pulse">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-khaki/30 text-olive-wood/60 flex items-center justify-center border border-khaki/50 font-bold text-[10px]">
                      {step.id}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`font-semibold transition-colors ${
                      isCompleted
                        ? 'text-sage-hover font-bold'
                        : isInProgress
                        ? 'text-olive-wood font-extrabold'
                        : 'text-olive-wood/60'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-olive-wood/60 leading-tight mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Details */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            <span className="font-bold">Error detail:</span> {error}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-1">
          {error ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-khaki-light hover:bg-khaki/30 text-olive-wood text-xs font-semibold transition-all cursor-pointer border border-khaki/40"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onRetry}
                className="px-5 py-2 rounded-xl bg-sage hover:bg-sage-hover text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Retry Pipeline
              </button>
            </>
          ) : isFinished ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-sage hover:bg-sage-hover text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>View Updated Dashboard & Resume</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
