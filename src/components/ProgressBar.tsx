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
    <div className="rounded-xl bg-aws-dark px-4 py-3 text-white">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm font-medium">
          <span>{answeredCount} answered</span>
          <span className="text-green-400">{correctCount} correct</span>
          <span className="text-red-400">{wrongCount} wrong</span>
        </div>
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
      <button
        onClick={onStopAndReview}
        className="mt-2 w-full rounded-lg bg-aws-orange px-3 py-1.5 text-sm font-semibold text-aws-dark transition-opacity hover:opacity-90"
      >
        Stop & Review
      </button>
    </div>
  );
}
