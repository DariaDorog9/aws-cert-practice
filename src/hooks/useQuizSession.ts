"use client";

import { useState, useCallback } from "react";
import { Question, ViewState, AnsweredQuestion } from "@/types";
import { shuffle } from "@/lib/shuffle";
import questionsData from "@/data/questions.json";

const allQuestions = questionsData as Question[];

export function useQuizSession() {
  const [view, setView] = useState<ViewState>("landing");
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<AnsweredQuestion[]>([]);

  const currentQuestion = shuffledQuestions[currentIndex] ?? null;

  const startSession = useCallback(() => {
    setShuffledQuestions(shuffle(allQuestions));
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setHasChecked(false);
    setIsCorrect(false);
    setAnsweredCount(0);
    setCorrectCount(0);
    setWrongCount(0);
    setWrongAnswers([]);
    setView("quiz");
  }, []);

  const selectAnswer = useCallback(
    (optionId: string) => {
      if (hasChecked) return;

      if (currentQuestion?.type === "single") {
        setSelectedAnswers([optionId]);
      } else {
        setSelectedAnswers((prev) =>
          prev.includes(optionId)
            ? prev.filter((id) => id !== optionId)
            : [...prev, optionId]
        );
      }
    },
    [hasChecked, currentQuestion?.type]
  );

  const checkAnswer = useCallback(() => {
    if (!currentQuestion || selectedAnswers.length === 0) return;

    const correct =
      selectedAnswers.length === currentQuestion.correctAnswers.length &&
      selectedAnswers.every((a) => currentQuestion.correctAnswers.includes(a));

    setIsCorrect(correct);
    setHasChecked(true);
    setAnsweredCount((c) => c + 1);

    if (correct) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((c) => c + 1);
      setWrongAnswers((prev) => [
        ...prev,
        { question: currentQuestion, selectedAnswers, isCorrect: false },
      ]);
    }
  }, [currentQuestion, selectedAnswers]);

  const nextQuestion = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= shuffledQuestions.length) {
      // Reshuffle and restart from beginning (endless loop)
      setShuffledQuestions(shuffle(allQuestions));
      setCurrentIndex(0);
    } else {
      setCurrentIndex(nextIdx);
    }
    setSelectedAnswers([]);
    setHasChecked(false);
    setIsCorrect(false);
  }, [currentIndex, shuffledQuestions.length]);

  const allAnswered = answeredCount >= allQuestions.length;

  const stopAndReview = useCallback(() => {
    setView("review");
  }, []);

  const resumeQuiz = useCallback(() => {
    setView("quiz");
  }, []);

  const startOver = useCallback(() => {
    startSession();
  }, [startSession]);

  return {
    view,
    currentQuestion,
    currentIndex,
    selectedAnswers,
    hasChecked,
    isCorrect,
    answeredCount,
    correctCount,
    wrongCount,
    wrongAnswers,
    allAnswered,
    totalQuestions: allQuestions.length,
    startSession,
    selectAnswer,
    checkAnswer,
    nextQuestion,
    stopAndReview,
    resumeQuiz,
    startOver,
  };
}
