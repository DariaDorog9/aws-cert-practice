interface ProgressBarProps {
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  onStopAndReview: () => void;
}

export function ProgressBar({
  answeredCount,
  correctCount,
  wrongCount,
  onStopAndReview,
}: ProgressBarProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-aws-dark px-4 py-3 text-white">
      <div className="flex gap-4 text-sm font-medium">
        <span>Answered: {answeredCount}</span>
        <span className="text-green-400">Correct: {correctCount}</span>
        <span className="text-red-400">Wrong: {wrongCount}</span>
      </div>
      <button
        onClick={onStopAndReview}
        className="rounded-lg bg-aws-orange px-3 py-1.5 text-sm font-semibold text-aws-dark transition-opacity hover:opacity-90"
      >
        Stop & Review
      </button>
    </div>
  );
}
