"use client";

import { useEffect, useRef, useState } from "react";
import { Question } from "@/types";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import { QuestionDrawer } from "./QuestionDrawer";

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
  shuffledQuestions: Question[];
  questionStatusMap: Record<number, "correct" | "wrong">;
  onSelectAnswer: (optionId: string) => void;
  onCheckAnswer: () => void;
  onNextQuestion: () => void;
  onStopAndReview: () => void;
  onJumpToQuestion: (index: number) => void;
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
  shuffledQuestions,
  questionStatusMap,
  onSelectAnswer,
  onCheckAnswer,
  onNextQuestion,
  onStopAndReview,
  onJumpToQuestion,
}: QuizViewProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      <div className="text-center">
        <div className="text-sm text-gray-500">
          Question {currentIndex + 1} of {totalQuestions}
        </div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-aws-orange">
          {currentQuestion.category}
        </div>
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

      <QuestionDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        questions={shuffledQuestions}
        questionStatusMap={questionStatusMap}
        currentIndex={currentIndex}
        onJumpToQuestion={onJumpToQuestion}
      />
    </div>
  );
}
