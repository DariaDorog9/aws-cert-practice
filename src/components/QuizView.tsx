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
  flaggedQuestions: Set<number>;
  isFlagged: boolean;
  onToggleFlag: () => void;
  onSelectAnswer: (optionId: string) => void;
  onCheckAnswer: () => void;
  onClearAnswer: () => void;
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
  flaggedQuestions,
  isFlagged,
  onToggleFlag,
  onSelectAnswer,
  onCheckAnswer,
  onClearAnswer,
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

      <div className="relative text-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Question {currentIndex + 1} of {totalQuestions}
        </div>
        <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-aws-orange">
          {currentQuestion.category}
        </div>
        <button
          onClick={onToggleFlag}
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={isFlagged ? "Unflag question" : "Flag question"}
          title={isFlagged ? "Unflag question" : "Flag question"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isFlagged ? "#F59E0B" : "none"}
            stroke={isFlagged ? "#F59E0B" : "currentColor"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isFlagged ? "" : "text-gray-400 dark:text-gray-500"}
          >
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        </button>
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
              ? "bg-green-50 dark:bg-green-900/30 text-correct"
              : "bg-red-50 dark:bg-red-900/30 text-incorrect"
          }`}
        >
          {isCorrect ? "Correct!" : "Incorrect"}
        </div>
      )}

      {hasChecked && currentQuestion.explanation && (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/30 p-4 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
          {currentQuestion.explanation}
        </div>
      )}

      {!hasChecked ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={onCheckAnswer}
            disabled={selectedAnswers.length === 0}
            className="min-h-[48px] w-full rounded-xl bg-aws-orange px-8 py-4 text-lg font-bold text-aws-dark shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:brightness-100"
          >
            Check Answer
          </button>
          <button
            onClick={onNextQuestion}
            className="min-h-[48px] w-full rounded-xl border-2 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 px-8 py-4 text-base font-semibold text-gray-500 dark:text-gray-400 transition-all hover:border-gray-400 dark:hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-200 active:scale-[0.98]"
          >
            Skip
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {!isCorrect && (
            <button
              onClick={onClearAnswer}
              className="min-h-[48px] w-full rounded-xl border-2 border-aws-dark dark:border-gray-500 bg-white dark:bg-gray-800 px-8 py-4 text-lg font-bold text-aws-dark dark:text-gray-100 shadow-md transition-all hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg active:scale-[0.98]"
            >
              Clear Answer
            </button>
          )}
          <button
            onClick={onNextQuestion}
            className="min-h-[48px] w-full rounded-xl bg-aws-dark px-8 py-4 text-lg font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
          >
            Next Question
          </button>
        </div>
      )}

      <QuestionDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        questions={shuffledQuestions}
        questionStatusMap={questionStatusMap}
        currentIndex={currentIndex}
        onJumpToQuestion={onJumpToQuestion}
        flaggedQuestions={flaggedQuestions}
      />
    </div>
  );
}
