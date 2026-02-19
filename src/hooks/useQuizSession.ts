"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Question, ViewState, AnsweredQuestion } from "@/types";
import { shuffle } from "@/lib/shuffle";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
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
  flaggedQuestions: number[];
}

// --- localStorage helpers (guest mode) ---

function saveSessionLocal(data: SavedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage might be full or unavailable
  }
}

function loadSessionLocal(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedSession;
  } catch {
    return null;
  }
}

function clearSessionLocal() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// --- Firestore helpers (logged-in mode) ---

function sessionDocRef(userId: string) {
  if (!db) return null;
  return doc(db, "users", userId, "sessions", "current");
}

async function saveSessionFirestore(userId: string, data: SavedSession) {
  const ref = sessionDocRef(userId);
  if (!ref) return;
  try {
    await setDoc(ref, data);
  } catch {
    // Firestore write failed — silently degrade
  }
}

async function loadSessionFirestore(
  userId: string
): Promise<SavedSession | null> {
  const ref = sessionDocRef(userId);
  if (!ref) return null;
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as SavedSession;
  } catch {
    return null;
  }
}

async function clearSessionFirestore(userId: string) {
  const ref = sessionDocRef(userId);
  if (!ref) return;
  try {
    await deleteDoc(ref);
  } catch {
    // ignore
  }
}

const questionsById = new Map(allQuestions.map((q) => [q.id, q]));

/** Shuffle questions within each category, categories sorted alphabetically */
function shuffleByCategorySorted(questions: Question[]): Question[] {
  const groups = new Map<string, Question[]>();
  for (const q of questions) {
    const cat = q.category || "Uncategorized";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(q);
  }
  const sortedCategories = [...groups.keys()].sort((a, b) =>
    a.localeCompare(b)
  );
  const result: Question[] = [];
  for (const cat of sortedCategories) {
    result.push(...shuffle(groups.get(cat)!));
  }
  return result;
}

function restoreSession(saved: SavedSession) {
  const questions = saved.questionOrder
    .map((id) => questionsById.get(id))
    .filter((q): q is Question => q !== undefined);

  const wrongAnswerObjects = saved.wrongAnswers
    .map((wa) => {
      const q = questionsById.get(wa.questionId);
      if (!q) return null;
      return {
        question: q,
        selectedAnswers: wa.selectedAnswers,
        isCorrect: false,
      };
    })
    .filter((wa): wa is AnsweredQuestion => wa !== null);

  return { questions, wrongAnswerObjects };
}

export type CategoryStats = Record<
  string,
  { total: number; correct: number; wrong: number }
>;

export function useQuizSession() {
  const { user } = useAuth();
  const userId = user?.uid ?? null;

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
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [clearedQuestions, setClearedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [sessionLoading, setSessionLoading] = useState(false);

  // Track the userId used for the last session check to re-check on auth change
  const lastCheckedUserId = useRef<string | null | undefined>(undefined);

  // Check for saved session on mount and when auth state changes
  useEffect(() => {
    // Skip if we already checked for this user
    if (lastCheckedUserId.current === userId) return;
    lastCheckedUserId.current = userId;

    if (userId) {
      // Logged in — check Firestore
      setSessionLoading(true);
      loadSessionFirestore(userId).then((saved) => {
        if (saved && saved.questionOrder.length > 0) {
          setHasSavedSession(true);
        } else {
          // Fall back to checking localStorage
          const local = loadSessionLocal();
          setHasSavedSession(!!local && local.questionOrder.length > 0);
        }
        setSessionLoading(false);
      });
    } else {
      // Guest — check localStorage
      const saved = loadSessionLocal();
      setHasSavedSession(!!saved && saved.questionOrder.length > 0);
    }
  }, [userId]);

  const currentQuestion = shuffledQuestions[currentIndex] ?? null;

  // Build session data for saving
  const buildSessionData = useCallback((): SavedSession => {
    return {
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
      flaggedQuestions: Array.from(flaggedQuestions),
    };
  }, [
    shuffledQuestions,
    currentIndex,
    answeredCount,
    correctCount,
    wrongCount,
    questionStatusMap,
    wrongAnswers,
    flaggedQuestions,
  ]);

  // Save progress whenever relevant state changes
  useEffect(() => {
    if (view !== "quiz" && view !== "review") return;
    if (shuffledQuestions.length === 0) return;

    const data = buildSessionData();

    if (userId) {
      saveSessionFirestore(userId, data);
    }
    // Always save to localStorage as fallback
    saveSessionLocal(data);
  }, [view, buildSessionData, userId]);

  const toggleFlag = useCallback((questionId: number) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  // Compute category stats from questionStatusMap + shuffledQuestions
  const categoryStats = useMemo<CategoryStats>(() => {
    const stats: CategoryStats = {};
    for (const q of shuffledQuestions) {
      const cat = q.category || "Uncategorized";
      if (!stats[cat]) {
        stats[cat] = { total: 0, correct: 0, wrong: 0 };
      }
      stats[cat].total++;
      const status = questionStatusMap[q.id];
      if (status === "correct") stats[cat].correct++;
      else if (status === "wrong") stats[cat].wrong++;
    }
    return stats;
  }, [shuffledQuestions, questionStatusMap]);

  const applySession = useCallback((saved: SavedSession) => {
    const { questions, wrongAnswerObjects } = restoreSession(saved);
    if (questions.length === 0) return;

    setShuffledQuestions(questions);
    setCurrentIndex(saved.currentIndex);
    setAnsweredCount(saved.answeredCount);
    setCorrectCount(saved.correctCount);
    setWrongCount(saved.wrongCount);
    setQuestionStatusMap(saved.questionStatusMap);
    setWrongAnswers(wrongAnswerObjects);
    setFlaggedQuestions(new Set(saved.flaggedQuestions ?? []));
    setSelectedAnswers([]);
    setHasChecked(false);
    setIsCorrect(false);
    setView("quiz");
  }, []);

  const resumeSavedSession = useCallback(async () => {
    if (userId) {
      // Try Firestore first (cloud is source of truth)
      const cloudSession = await loadSessionFirestore(userId);
      if (cloudSession) {
        applySession(cloudSession);
        return;
      }
    }
    // Fall back to localStorage
    const local = loadSessionLocal();
    if (local) {
      applySession(local);
    }
  }, [userId, applySession]);

  const startSession = useCallback(() => {
    setShuffledQuestions(shuffleByCategorySorted([...allQuestions]));
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setHasChecked(false);
    setIsCorrect(false);
    setAnsweredCount(0);
    setCorrectCount(0);
    setWrongCount(0);
    setWrongAnswers([]);
    setQuestionStatusMap({});
    setFlaggedQuestions(new Set());
    setClearedQuestions(new Set());
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

    const previousStatus = questionStatusMap[currentQuestion.id];

    setIsCorrect(correct);
    setHasChecked(true);

    // Remove from cleared set so jumping back shows the new result
    setClearedQuestions((prev) => {
      if (!prev.has(currentQuestion.id)) return prev;
      const next = new Set(prev);
      next.delete(currentQuestion.id);
      return next;
    });

    if (previousStatus === "wrong") {
      // Re-attempt: question was already counted
      if (correct) {
        // Flip from wrong to correct
        setQuestionStatusMap((prev) => ({
          ...prev,
          [currentQuestion.id]: "correct",
        }));
        setCorrectCount((c) => c + 1);
        setWrongCount((c) => c - 1);
        setWrongAnswers((prev) =>
          prev.filter((wa) => wa.question.id !== currentQuestion.id)
        );
      }
      // If wrong again, nothing changes — status stays "wrong", counts unchanged
    } else {
      // First attempt
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
    }
  }, [currentQuestion, selectedAnswers, questionStatusMap]);

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

  const clearAnswer = useCallback(() => {
    if (currentQuestion) {
      setClearedQuestions((prev) => {
        const next = new Set(prev);
        next.add(currentQuestion.id);
        return next;
      });
    }
    setSelectedAnswers([]);
    setHasChecked(false);
    setIsCorrect(false);
  }, [currentQuestion]);

  const allAnswered = answeredCount >= shuffledQuestions.length;

  const stopAndReview = useCallback(() => {
    setView("review");
  }, []);

  const jumpToQuestion = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      const q = shuffledQuestions[index];
      if (!q) return;

      const status = questionStatusMap[q.id];
      if (status === "wrong" && !clearedQuestions.has(q.id)) {
        // Restore checked state so correct answers stay visible
        const wa = wrongAnswers.find((w) => w.question.id === q.id);
        setSelectedAnswers(wa ? wa.selectedAnswers : []);
        setHasChecked(true);
        setIsCorrect(false);
      } else if (status === "correct") {
        setSelectedAnswers(q.correctAnswers);
        setHasChecked(true);
        setIsCorrect(true);
      } else {
        setSelectedAnswers([]);
        setHasChecked(false);
        setIsCorrect(false);
      }
    },
    [shuffledQuestions, questionStatusMap, wrongAnswers, clearedQuestions]
  );

  const resumeQuiz = useCallback(() => {
    setView("quiz");
  }, []);

  const startOver = useCallback(() => {
    clearSessionLocal();
    if (userId) {
      clearSessionFirestore(userId);
    }
    setHasSavedSession(false);
    startSession();
  }, [startSession, userId]);

  const retryWrongAnswers = useCallback(() => {
    const wrongQuestions = wrongAnswers.map((wa) => wa.question);
    if (wrongQuestions.length === 0) return;

    setShuffledQuestions(shuffle([...wrongQuestions]));
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setHasChecked(false);
    setIsCorrect(false);
    setAnsweredCount(0);
    setCorrectCount(0);
    setWrongCount(0);
    setWrongAnswers([]);
    setQuestionStatusMap({});
    setClearedQuestions(new Set());
    setView("quiz");
  }, [wrongAnswers]);

  const retryFlaggedQuestions = useCallback(() => {
    const flaggedQs = allQuestions.filter((q) => flaggedQuestions.has(q.id));
    if (flaggedQs.length === 0) return;

    setShuffledQuestions(shuffle([...flaggedQs]));
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setHasChecked(false);
    setIsCorrect(false);
    setAnsweredCount(0);
    setCorrectCount(0);
    setWrongCount(0);
    setWrongAnswers([]);
    setQuestionStatusMap({});
    setClearedQuestions(new Set());
    setView("quiz");
  }, [flaggedQuestions]);

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
    flaggedQuestions,
    categoryStats,
    sessionLoading,
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
    toggleFlag,
    clearAnswer,
    retryWrongAnswers,
    retryFlaggedQuestions,
  };
}
