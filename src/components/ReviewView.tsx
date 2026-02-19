import { AnsweredQuestion } from "@/types";
import { CategoryStats } from "@/hooks/useQuizSession";

interface ReviewViewProps {
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  wrongAnswers: AnsweredQuestion[];
  allAnswered: boolean;
  categoryStats: CategoryStats;
  flaggedCount: number;
  onResume: () => void;
  onStartOver: () => void;
  onRetryWrong: () => void;
  onRetryFlagged: () => void;
}

export function ReviewView({
  answeredCount,
  correctCount,
  wrongCount,
  wrongAnswers,
  allAnswered,
  categoryStats,
  flaggedCount,
  onResume,
  onStartOver,
  onRetryWrong,
  onRetryFlagged,
}: ReviewViewProps) {
  const accuracy =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const sortedCategories = Object.entries(categoryStats)
    .map(([name, stats]) => {
      const answered = stats.correct + stats.wrong;
      const accuracy = answered > 0 ? Math.round((stats.correct / answered) * 100) : -1;
      return { name, ...stats, answered, accuracy };
    })
    .filter((c) => c.answered > 0)
    .sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-aws-dark dark:text-gray-100">Session Review</h1>

      <div className="mb-6 rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{answeredCount}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Answered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-correct">{correctCount}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Correct</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-incorrect">{wrongCount}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Wrong</div>
          </div>
        </div>
        <div className="mt-4 border-t dark:border-gray-700 pt-4 text-center">
          <div className="text-3xl font-bold text-aws-dark dark:text-gray-100">{accuracy}%</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Accuracy</div>
        </div>
      </div>

      {sortedCategories.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-aws-dark dark:text-gray-100">
            Category Breakdown
          </h2>
          <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm">
            {sortedCategories.map((cat, i) => {
              const colorClass =
                cat.accuracy >= 80
                  ? "text-correct"
                  : cat.accuracy >= 50
                    ? "text-amber-500"
                    : "text-incorrect";
              return (
                <div
                  key={cat.name}
                  className={`flex items-center justify-between px-5 py-3 ${
                    i < sortedCategories.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {cat.name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {cat.correct} correct, {cat.wrong} wrong / {cat.total} total
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${colorClass}`}>
                    {cat.accuracy}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {wrongAnswers.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-incorrect">
            Wrong Answers ({wrongAnswers.length})
          </h2>
          <div className="flex flex-col gap-4">
            {wrongAnswers.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border-2 border-red-100 dark:border-red-900/50 bg-white dark:bg-gray-800 p-5 shadow-sm"
              >
                <p className="mb-3 font-semibold">{item.question.question}</p>
                <div className="mb-2 text-sm">
                  <span className="text-incorrect">Your answer: </span>
                  {item.selectedAnswers
                    .map(
                      (id) =>
                        item.question.options.find((o) => o.id === id)?.text
                    )
                    .join(", ")}
                </div>
                <div className="mb-3 text-sm">
                  <span className="text-correct">Correct answer: </span>
                  {item.question.correctAnswers
                    .map(
                      (id) =>
                        item.question.options.find((o) => o.id === id)?.text
                    )
                    .join(", ")}
                </div>
                {item.question.explanation && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-3 text-sm text-gray-700 dark:text-gray-200">
                    {item.question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {wrongAnswers.length === 0 && (
        <div className="mb-6 rounded-xl bg-green-50 dark:bg-green-900/30 p-5 text-center text-correct">
          <div className="text-2xl font-bold">Perfect score!</div>
          <p className="text-sm">You got every question right.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {wrongAnswers.length > 0 && (
          <button
            onClick={onRetryWrong}
            className="min-h-[48px] w-full rounded-xl bg-red-500 px-8 py-4 text-lg font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
          >
            Retry Wrong Answers ({wrongAnswers.length})
          </button>
        )}
        {flaggedCount > 0 && (
          <button
            onClick={onRetryFlagged}
            className="min-h-[48px] w-full rounded-xl bg-amber-500 px-8 py-4 text-lg font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
          >
            Practice Flagged ({flaggedCount})
          </button>
        )}
        {!allAnswered && (
          <button
            onClick={onResume}
            className="min-h-[48px] w-full rounded-xl bg-aws-orange px-8 py-4 text-lg font-bold text-aws-dark shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
          >
            Resume Quiz
          </button>
        )}
        {allAnswered && (
          <button
            onClick={onStartOver}
            className="min-h-[48px] w-full rounded-xl bg-aws-orange px-8 py-4 text-lg font-bold text-aws-dark shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
          >
            Start Over
          </button>
        )}
      </div>
    </div>
  );
}
