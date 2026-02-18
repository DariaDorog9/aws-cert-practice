"use client";

import { useQuizSession } from "@/hooks/useQuizSession";
import { LandingView } from "@/components/LandingView";
import { QuizView } from "@/components/QuizView";
import { ReviewView } from "@/components/ReviewView";

export default function Home() {
  const session = useQuizSession();

  if (session.view === "landing") {
    return (
      <LandingView
        totalQuestions={session.totalQuestions}
        onStart={session.startSession}
      />
    );
  }

  if (session.view === "review") {
    return (
      <ReviewView
        answeredCount={session.answeredCount}
        correctCount={session.correctCount}
        wrongCount={session.wrongCount}
        wrongAnswers={session.wrongAnswers}
        allAnswered={session.allAnswered}
        onResume={session.resumeQuiz}
        onStartOver={session.startOver}
      />
    );
  }

  if (!session.currentQuestion) return null;

  return (
    <QuizView
      currentQuestion={session.currentQuestion}
      currentIndex={session.currentIndex}
      totalQuestions={session.totalQuestions}
      selectedAnswers={session.selectedAnswers}
      hasChecked={session.hasChecked}
      isCorrect={session.isCorrect}
      answeredCount={session.answeredCount}
      correctCount={session.correctCount}
      wrongCount={session.wrongCount}
      onSelectAnswer={session.selectAnswer}
      onCheckAnswer={session.checkAnswer}
      onNextQuestion={session.nextQuestion}
      onStopAndReview={session.stopAndReview}
    />
  );
}
