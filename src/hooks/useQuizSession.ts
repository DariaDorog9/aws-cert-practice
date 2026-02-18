"use client";

import { useState, useCallback, useEffect } from "react";
import { Question, ViewState, AnsweredQuestion } from "@/types";
import { shuffle } from "@/lib/shuffle";
import questionsData from "@/data/questions.json";

const allQuestions = questionsData as Question[];

const STORAGE_KEY = "aws-quiz-session";

interface SavedSession {
  questionOrder: number[]; // question IDs in shuffled order
  currentIndex: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  questionStatusMap: Record<number, "correct" | "wrong">;
  wrongAnswers: { questionId: number; selectedAnswers: string[] }[];
}

function saveSession(data: SavedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be full or unavailable
  }
}

function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSession;
  } catch {
    return null;
  }
}

function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const questionsById = new Map(allQuestions.map((q) => [q.id, q]));

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
  const [questionStatusMap, setQuestionStatusMap] = useState<
    Record<number, "correct" | "wrong">
  >({});
  const [hasSavedSession, setHasSavedSession] = useState(false);

  // Check for saved session on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.questionOrder.length > 0) {
      setHasSavedSession(true);
    }
  }, []);

  const currentQuestion = shuffledQuestions[currentIndex] ?? null;

  // Save progress whenever relevant state changes
  useEffect(() => {
    if (view !== "quiz" && view !== "review") return;
    if (shuffledQuestions.length === 0) return;

    saveSession({
      questionOrder: shuffledQuestions.map((q) => q.id),
      currentIndex,
      answeredCount,
      correctCount,
      wrongCount,
      questionStatusMap,
      wrongAnswers: wrongAnswers.map((wa) => ({
        questionId: wa.question.id,
        selectedAnswers: wa.selectedAnswers,
      })),
    });
  }, [
    view,
    shuffledQuestions,
    currentIndex,
    answeredCount,
    correctCount,
    wrongCount,
    questionStatusMap,
    wrongAnswers,
  ]);

  const resumeSavedSession = useCallback(() => {
    const saved = loadSession();
    if (!saved) return;

    const questions = saved.questionOrder
      .map((id) => questionsById.get(id))
      .filter((q): q is Question => q !== undefined);

    if (questions.length === 0) return;

    setShuffledQuestions(questions);
    setCurrentIndex(saved.currentIndex);
    setAnsweredCount(saved.answeredCount);
    setCorrectCount(saved.correctCount);
    setWrongCount(saved.wrongCount);
    setQuestionStatusMap(saved.questionStatusMap);
    setWrongAnswers(
      saved.wrongAnswers
        .map((wa) => {
          const q = questionsById.get(wa.questionId);
          if (!q) return null;
          return {
            question: q,
            selectedAnswers: wa.selectedAnswers,
            isCorrect: false,
          };
        })
        .filter((wa): wa is AnsweredQuestion => wa !== null)
    );
    setSelectedAnswers([]);
    setHasChecked(false);
    setIsCorrect(false);
    setView("quiz");
  }, []);

  const startSession = useCallback(() => {
    setShuffledQuestions(shuffle([...allQuestions]));
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setHasChecked(false);
    setIsCorrect(false);
    setAnsweredCount(0);
    setCorrectCount(0);
    setWrongCount(0);
    setWrongAnswers([]);
    setQuestionStatusMap({});
    setHasSavedSession(false);
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

    setQuestionStatusMap((prev) => ({
      ...prev,
      [currentQuestion.id]: correct ? "correct" : "wrong",
    }));

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
    const current = shuffledQuestions[currentIndex];
    const category = current?.category;

    // Try to find next unanswered question in the same category
    if (category) {
      for (let i = 0; i < shuffledQuestions.length; i++) {
        const idx = (currentIndex + 1 + i) % shuffledQuestions.length;
        const q = shuffledQuestions[idx];
        if (q.category === category && !questionStatusMap[q.id]) {
          setCurrentIndex(idx);
          setSelectedAnswers([]);
          setHasChecked(false);
          setIsCorrect(false);
          return;
        }
      }
    }

    // No unanswered in same category — find next unanswered in any category
    for (let i = 0; i < shuffledQuestions.length; i++) {
      const idx = (currentIndex + 1 + i) % shuffledQuestions.length;
      if (!questionStatusMap[shuffledQuestions[idx].id]) {
        setCurrentIndex(idx);
        setSelectedAnswers([]);
        setHasChecked(false);
        setIsCorrect(false);
        return;
      }
    }

    // All answered — just go to next (endless loop)
    const nextIdx = currentIndex + 1;
    if (nextIdx >= shuffledQuestions.length) {
      setShuffledQuestions(shuffle([...shuffledQuestions]));
      setCurrentIndex(0);
    } else {
      setCurrentIndex(nextIdx);
    }
    setSelectedAnswers([]);
    setHasChecked(false);
    setIsCorrect(false);
  }, [currentIndex, shuffledQuestions, questionStatusMap]);

  const allAnswered = answeredCount >= shuffledQuestions.length;

  const stopAndReview = useCallback(() => {
    setView("review");
  }, []);

  const jumpToQuestion = useCallback((index: number) => {
    setCurrentIndex(index);
    setSelectedAnswers([]);
    setHasChecked(false);
    setIsCorrect(false);
  }, []);

  const resumeQuiz = useCallback(() => {
    setView("quiz");
  }, []);

  const startOver = useCallback(() => {
    clearSession();
    setHasSavedSession(false);
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
    shuffledQuestions,
    questionStatusMap,
    hasSavedSession,
    totalQuestions: allQuestions.length,
    startSession,
    resumeSavedSession,
    selectAnswer,
    checkAnswer,
    nextQuestion,
    jumpToQuestion,
    stopAndReview,
    resumeQuiz,
    startOver,
  };
}
