export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  question: string;
  type: "single" | "multiple";
  options: Option[];
  correctAnswers: string[];
  explanation?: string;
}

export type ViewState = "landing" | "quiz" | "review";

export interface AnsweredQuestion {
  question: Question;
  selectedAnswers: string[];
  isCorrect: boolean;
}
