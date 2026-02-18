interface LandingViewProps {
  totalQuestions: number;
  hasSavedSession: boolean;
  onStart: () => void;
  onContinue: () => void;
}

export function LandingView({
  totalQuestions,
  hasSavedSession,
  onStart,
  onContinue,
}: LandingViewProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6 mt-8">
        <div className="mb-4 text-5xl">&#9729;&#65039;</div>
        <h1 className="mb-2 text-3xl font-bold text-aws-dark">
          AWS Certification
        </h1>
        <h2 className="text-xl font-semibold text-aws-orange">
          Practice Quiz
        </h2>
      </div>

      <p className="mb-6 text-gray-600">{totalQuestions} questions</p>

      <div className="flex w-full flex-col gap-3">
        {hasSavedSession && (
          <button
            onClick={onContinue}
            className="min-h-[48px] w-full rounded-xl bg-aws-orange px-8 py-4 text-lg font-bold text-aws-dark shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
          >
            Continue Previous Session
          </button>
        )}
        <button
          onClick={onStart}
          className={`min-h-[48px] w-full rounded-xl px-8 py-4 text-lg font-bold shadow-md transition-all hover:shadow-lg active:scale-[0.98] ${
            hasSavedSession
              ? "bg-gray-200 text-aws-dark hover:bg-gray-300"
              : "bg-aws-orange text-aws-dark hover:brightness-105"
          }`}
        >
          {hasSavedSession ? "Start New Session" : "Start Practicing"}
        </button>
      </div>
    </div>
  );
}
