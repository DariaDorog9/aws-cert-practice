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
        hasSavedSession={session.hasSavedSession}
        onStart={() => session.startSession()}
        onContinue={session.resumeSavedSession}
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
      shuffledQuestions={session.shuffledQuestions}
      questionStatusMap={session.questionStatusMap}
      onSelectAnswer={session.selectAnswer}
      onCheckAnswer={session.checkAnswer}
      onNextQuestion={session.nextQuestion}
      onStopAndReview={session.stopAndReview}
      onJumpToQuestion={session.jumpToQuestion}
    />
  );
}
