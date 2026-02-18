"use client";

import { useEffect, useRef } from "react";
import { Question } from "@/types";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";

interface QuizViewProps {
  currentQuestion: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswers: string[];
  hasChecked: boolean;
  isCorrect: boolean;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  onSelectAnswer: (optionId: string) => void;
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
  onStopAndReview: () => void;
}

export function QuizView({
  currentQuestion,
  currentIndex,
  totalQuestions,
  selectedAnswers,
  hasChecked,
  isCorrect,
  answeredCount,
  correctCount,
  wrongCount,
  onSelectAnswer,
  onCheckAnswer,
  onNextQuestion,
  onStopAndReview,
}: QuizViewProps) {
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentIndex]);

  return (
    <div ref={topRef} className="flex flex-col gap-4">
      <ProgressBar
        answeredCount={answeredCount}
        correctCount={correctCount}
        wrongCount={wrongCount}
        onStopAndReview={onStopAndReview}
      />

      <div className="text-center text-sm text-gray-500">
        Question {currentIndex + 1} of {totalQuestions}
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswers={selectedAnswers}
        hasChecked={hasChecked}
        onSelectAnswer={onSelectAnswer}
      />

      {hasChecked && (
        <div
          className={`rounded-xl p-4 text-center font-semibold ${
            isCorrect
              ? "bg-green-50 text-correct"
              : "bg-red-50 text-incorrect"
          }`}
        >
          {isCorrect ? "Correct!" : "Incorrect"}
        </div>
      )}

      {hasChecked && currentQuestion.explanation && (
        <div className="rounded-xl bg-blue-50 p-4 text-sm leading-relaxed text-gray-700">
          {currentQuestion.explanation}
        </div>
      )}

      {!hasChecked ? (
        <button
          onClick={onCheckAnswer}
          disabled={selectedAnswers.length === 0}
          className="min-h-[48px] w-full rounded-xl bg-aws-orange px-8 py-4 text-lg font-bold text-aws-dark shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:brightness-100"
        >
          Check Answer
        </button>
      ) : (
        <button
          onClick={onNextQuestion}
          className="min-h-[48px] w-full rounded-xl bg-aws-dark px-8 py-4 text-lg font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
        >
          Next Question
        </button>
      )}
    </div>
  );
}
