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
        categoryStats={session.categoryStats}
        flaggedCount={session.flaggedQuestions.size}
        onResume={session.resumeQuiz}
        onStartOver={session.startOver}
        onRetryWrong={session.retryWrongAnswers}
        onRetryFlagged={session.retryFlaggedQuestions}
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
      flaggedQuestions={session.flaggedQuestions}
      isFlagged={session.currentQuestion ? session.flaggedQuestions.has(session.currentQuestion.id) : false}
      onToggleFlag={() => session.currentQuestion && session.toggleFlag(session.currentQuestion.id)}
      onSelectAnswer={session.selectAnswer}
      onCheckAnswer={session.checkAnswer}
      onClearAnswer={session.clearAnswer}
      onNextQuestion={session.nextQuestion}
      onStopAndReview={session.stopAndReview}
      onJumpToQuestion={session.jumpToQuestion}
    />
  );
}
