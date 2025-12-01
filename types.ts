export type CellValue = string;

// A single 3x3 grid (9 cells)
export type GridBlock = CellValue[];

// The entire Mandalart board (9 blocks of 9 cells)
export type MandalartData = GridBlock[];

export interface AnnualPlan {
  thisYearMe: string;
  monthly: string[]; // 0 = Jan, 11 = Dec
}

export interface AppState {
  mandalart: MandalartData;
  annualPlan: AnnualPlan;
}

export interface GenerateResponse {
    subGoals: string[];
    tasks: string[][]; // 8 arrays of 8 tasks (excluding center)
}

export interface SavedProject {
  id: string;
  title: string;
  mandalart: MandalartData;
  annualPlan: AnnualPlan;
  lastUpdated: string;
}
