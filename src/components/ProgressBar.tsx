interface ProgressBarProps {
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  onStopAndReview: () => void;
  onOpenDrawer: () => void;
}

export function ProgressBar({
  answeredCount,
  correctCount,
  wrongCount,
  onStopAndReview,
  onOpenDrawer,
}: ProgressBarProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-aws-dark px-4 py-3 text-white">
      <div className="flex gap-4 text-sm font-medium">
        <span>Answered: {answeredCount}</span>
        <span className="text-green-400">Correct: {correctCount}</span>
        <span className="text-red-400">Wrong: {wrongCount}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onStopAndReview}
          className="rounded-lg bg-aws-orange px-3 py-1.5 text-sm font-semibold text-aws-dark transition-opacity hover:opacity-90"
        >
          Stop & Review
        </button>
        <button
          onClick={onOpenDrawer}
          className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
          aria-label="Open question list"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
