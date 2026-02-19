import { User } from "firebase/auth";

interface LandingViewProps {
  totalQuestions: number;
  hasSavedSession: boolean;
  onStart: () => void;
  onContinue: () => void;
  user: User | null;
  showAuth: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function LandingView({
  totalQuestions,
  hasSavedSession,
  onStart,
  onContinue,
  user,
  showAuth,
  onSignIn,
  onSignOut,
}: LandingViewProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* User info bar */}
      {showAuth && user && (
        <div className="flex w-full items-center justify-end gap-2 mb-2">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt=""
              className="h-7 w-7 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <span className="text-sm text-gray-600 truncate max-w-[160px]">
            {user.displayName || user.email}
          </span>
          <button
            onClick={onSignOut}
            className="text-sm text-gray-400 underline hover:text-gray-600"
          >
            Sign out
          </button>
        </div>
      )}

      <div className="mb-6 mt-8">
        <div className="mb-4 text-5xl">&#9729;&#65039;</div>
        <h1 className="mb-2 text-3xl font-bold text-aws-dark">
          AWS Certification
        </h1>
        <h2 className="text-xl font-semibold text-aws-orange">
          Practice Quiz
        </h2>
      </div>

      <p className="mb-6 text-gray-600">{totalQuestions} questions</p>

      <div className="flex w-full flex-col gap-3">
        {hasSavedSession && (
          <button
            onClick={onContinue}
            className="min-h-[48px] w-full rounded-xl bg-aws-orange px-8 py-4 text-lg font-bold text-aws-dark shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.98]"
          >
            Continue Previous Session
          </button>
        )}
        <button
          onClick={onStart}
          className={`min-h-[48px] w-full rounded-xl px-8 py-4 text-lg font-bold shadow-md transition-all hover:shadow-lg active:scale-[0.98] ${
            hasSavedSession
              ? "bg-gray-200 text-aws-dark hover:bg-gray-300"
              : "bg-aws-orange text-aws-dark hover:brightness-105"
          }`}
        >
          {hasSavedSession ? "Start New Session" : "Start Practicing"}
        </button>

        {/* Sign in with Google */}
        {showAuth && !user && (
          <button
            onClick={onSignIn}
            className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
}
