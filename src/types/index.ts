export interface Option {
  id: string;
  text: string;
}

export type Category =
  | "Cloud Concepts"
  | "Security & Compliance"
  | "Compute"
  | "Storage"
  | "Networking"
  | "Databases"
  | "Management & Governance"
  | "Billing & Pricing"
  | "Machine Learning & AI"
  | "Migration & Transfer";

export interface Question {
  id: number;
  category: Category;
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
