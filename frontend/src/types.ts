export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface SectionScores {
  content: number;
  skills: number;
  experience: number;
  education: number;
  formatting: number;
}

export interface AnalysisResult {
  id?: string;
  _id?: string;
  overallScore: number;
  atsScore: number;
  sectionScores: SectionScores;
  skills: string[];
  strengths: string[];
  suggestions: string[];
  createdAt: string;
}

export interface Resume {
  id: string;
  _id: string;
  userId: string;
  originalFileName: string;
  filePath: string;
  extractedText?: string;
  uploadedAt: string;
  analysisResult?: AnalysisResult;
}
