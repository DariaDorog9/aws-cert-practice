import { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  selectedAnswers: string[];
  hasChecked: boolean;
  onSelectAnswer: (optionId: string) => void;
}

export function QuestionCard({
  question,
  selectedAnswers,
  hasChecked,
  onSelectAnswer,
}: QuestionCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="mb-1 text-sm font-medium text-gray-500">
        {question.type === "multiple"
          ? "Select all that apply"
          : "Select one answer"}
      </div>
      <h2 className="mb-5 text-lg font-semibold leading-snug">
        {question.question}
      </h2>
      <div className="flex flex-col gap-3">
        {question.options.map((option) => {
          const isSelected = selectedAnswers.includes(option.id);
          const isCorrectAnswer = question.correctAnswers.includes(option.id);

          let style =
            "border-gray-200 bg-gray-50 hover:border-selected hover:bg-blue-50";

          if (hasChecked) {
            if (isCorrectAnswer) {
              style = "border-correct bg-green-50 text-correct";
            } else if (isSelected) {
              style = "border-incorrect bg-red-50 text-incorrect";
            } else {
              style = "border-gray-200 bg-gray-50 opacity-60";
            }
          } else if (isSelected) {
            style = "border-selected bg-blue-50 ring-2 ring-selected";
          }

          return (
            <button
              key={option.id}
              onClick={() => onSelectAnswer(option.id)}
              disabled={hasChecked}
              className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl border-2 p-4 text-left text-base font-medium transition-all ${style} disabled:cursor-default`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-current text-sm font-bold uppercase">
                {option.id}
              </span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
