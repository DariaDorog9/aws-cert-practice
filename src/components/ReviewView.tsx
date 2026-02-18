import { AnsweredQuestion } from "@/types";

interface ReviewViewProps {
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  wrongAnswers: AnsweredQuestion[];
  allAnswered: boolean;
  onResume: () => void;
  onStartOver: () => void;
}

export function ReviewView({
  answeredCount,
  correctCount,
  wrongCount,
  wrongAnswers,
  allAnswered,
  onResume,
  onStartOver,
}: ReviewViewProps) {
  const accuracy =
    answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-aws-dark">Session Review</h1>

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{answeredCount}</div>
            <div className="text-sm text-gray-500">Answered</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-correct">{correctCount}</div>
            <div className="text-sm text-gray-500">Correct</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-incorrect">{wrongCount}</div>
            <div className="text-sm text-gray-500">Wrong</div>
          </div>
        </div>
        <div className="mt-4 border-t pt-4 text-center">
          <div className="text-3xl font-bold text-aws-dark">{accuracy}%</div>
          <div className="text-sm text-gray-500">Accuracy</div>
        </div>
      </div>

      {wrongAnswers.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-incorrect">
            Wrong Answers ({wrongAnswers.length})
          </h2>
          <div className="flex flex-col gap-4">
            {wrongAnswers.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border-2 border-red-100 bg-white p-5 shadow-sm"
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
                  <div className="rounded-lg bg-blue-50 p-3 text-sm text-gray-700">
                    {item.question.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {wrongAnswers.length === 0 && (
        <div className="mb-6 rounded-xl bg-green-50 p-5 text-center text-correct">
          <div className="text-2xl font-bold">Perfect score!</div>
          <p className="text-sm">You got every question right.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
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
