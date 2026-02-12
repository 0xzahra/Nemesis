export interface AnalysisResult {
  oofScore: number;
  roast: string;
  cringeClock: number;
  innocenceIssues: string[];
  brandSuicideScore: number;
  lethalErrors: string[];
  pivotOptions: string[];
  cleanVersion: string;
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  TEASE = 'TEASE', // The "Sneak Peek"
  PAYWALL = 'PAYWALL',
  DASHBOARD = 'DASHBOARD', // The "Rescue Mission" complete
}

export interface UserContent {
  text: string;
  image?: string; // Base64
  mimeType?: string;
}
