interface LandingViewProps {
  totalQuestions: number;
  onStart: () => void;
}

export function LandingView({ totalQuestions, onStart }: LandingViewProps) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="mb-8">
        <div className="mb-4 text-5xl">☁️</div>
        <h1 className="mb-2 text-3xl font-bold text-aws-dark">
          AWS Certification
        </h1>
        <h2 className="text-xl font-semibold text-aws-orange">
          Practice Quiz
        </h2>
      </div>
      <p className="mb-8 text-gray-600">
        {totalQuestions} questions available
      </p>
      <button
        onClick={onStart}
        className="min-h-[48px] w-full rounded-xl bg-aws-orange px-8 py-4 text-lg font-bold text-aws-dark shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
      >
        Start Practicing
      </button>
    </div>
  );
}
