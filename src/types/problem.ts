export type ProblemType = "multiple" | "short" | "essay" | "code";

export type ProblemCategory = "M1" | "M2" | "M3" | "M4" | "M5" | "M6" | "M7";

export interface ProblemExplanation {
  text: string;
  images?: string[];
}

export interface Problem {
  id: number;
  title: string;
  category: ProblemCategory;
  type: ProblemType;
  content?: string;
  imageUrl?: string;
  imageUrls?: string[];
  choices?: string[];
  answer?: string;
  explanation?: ProblemExplanation;
  displayNumber?: number;
  // 모의평가에서 1~50 표시용
  mockNumber?: number;
}
