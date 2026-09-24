import { useState, useEffect } from 'react';

const REGENERATION_STEPS = [
  {
    id: 1,
    label: 'Querying GitHub API for latest commits',
    desc: 'Fetching top repos, recent commit history, and activity timestamps',
  },
  {
    id: 2,
    label: 'Extracting tech stack & project context',
    desc: 'Analyzing code structure, primary languages, and framework usage',
  },
  {
    id: 3,
    label: 'Synthesizing tailored bullet points with Gemini AI',
    desc: 'Generating quantified action-verb bullet points tailored to your role',
  },
  {
    id: 4,
    label: 'Injecting formatted entries into .docx',
    desc: 'Updating document XML tree while preserving styling & fonts',
  },
  {
    id: 5,
    label: 'Computing ATS compatibility score',
    desc: 'Evaluating keyword density, metric presence, and parseability',
  },
];

/**
 * RegenerationModal component
 *
 * Displays a backdrop modal with step checklist and glowing progress indicator
 * during AI resume updates.
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

    // Step progression animation loop
    const stepInterval = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep < 5) {
          const nextStep = prevStep + 1;
          setProgress(Math.round(((nextStep - 1) / 5) * 100));
          return nextStep;
        }
        return 5;
      });
    }, 1800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90 && !isFinished) {
          return prev + 1;
        }
        return prev;
      });
    }, 200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen, isFinished, error]);

  if (!isOpen) return null;

  const actualProgress = isFinished ? 100 : progress;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-olive-wood/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-khaki/50 shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 relative overflow-hidden">
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sage/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sage/10 text-sage ring-8 ring-sage/5 mb-1">
            {error ? (
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : isFinished ? (
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-7 h-7 animate-spin text-sage" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-olive-wood">
            {error ? 'Regeneration Failed' : isFinished ? 'Resume Updated Successfully!' : 'Updating Your Resume...'}
          </h2>
          <p className="text-xs text-olive-wood/70 max-w-xs mx-auto">
            {error
              ? 'An error occurred during resume regeneration. Please check your GitHub connection or try again.'
              : isFinished
              ? 'Gemini AI has generated updated bullet points and computed your new ATS compatibility score.'
              : 'Our multi-stage pipeline is gathering GitHub commits, generating AI project bullets, and re-evaluating ATS score.'}
          </p>
        </div>

        {/* Progress Bar Header */}
        {!error && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-olive-wood">
              <span>Overall Pipeline Progress</span>
              <span className="text-sage">{actualProgress}%</span>
            </div>
            <div className="w-full bg-khaki/20 rounded-full h-3 p-0.5 overflow-hidden border border-khaki/30">
              <div
                className="bg-gradient-to-r from-sage to-emerald-500 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
                style={{ width: `${actualProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Checklist */}
        <div className="bg-khaki-light/30 rounded-xl border border-khaki/40 p-4 space-y-3">
          {REGENERATION_STEPS.map((step) => {
            const isCompleted = isFinished || currentStep > step.id;
            const isInProgress = !isFinished && !error && currentStep === step.id;
            const isPending = !isFinished && currentStep < step.id;

            return (
              <div key={step.id} className="flex items-start gap-3 text-xs">
                {/* Status Indicator Icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isInProgress ? (
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 border border-blue-400 flex items-center justify-center animate-pulse">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center border border-gray-300">
                      <span className="text-[10px] font-bold">{step.id}</span>
                    </div>
                  )}
                </div>

                {/* Step Text Details */}
                <div className="flex-1">
                  <p
                    className={`font-semibold transition-colors ${
                      isCompleted
                        ? 'text-emerald-800'
                        : isInProgress
                        ? 'text-blue-900 font-bold'
                        : 'text-olive-wood/60'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-olive-wood/60 leading-tight">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Details if any */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            <span className="font-bold">Error detail:</span> {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          {error ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={onRetry}
                className="px-5 py-2 rounded-xl bg-sage hover:bg-sage-hover text-white text-xs font-semibold transition-all shadow cursor-pointer"
              >
                Retry Pipeline
              </button>
            </>
          ) : isFinished ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-sage hover:bg-sage-hover text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
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
