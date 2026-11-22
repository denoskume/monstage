export type FormationQuiz = {
  question: string;
  options: [string, string, string];
  correct: number;
  explanation: string;
};

export type FormationModule = {
  id: string;
  title: string;
  objective: string;
  concept: string;
  points: string[];
  example: string;
  code: string;
  codeLanguage?: 'python' | 'sql' | 'excel' | 'dax';
  result: string;
  instructions: string;
  mission: string;
  validation: string;
  quiz: FormationQuiz;
};

export type FormationTrack = {
  id: string;
  plan: 'Plan A' | 'Plan B';
  title: string;
  subtitle: string;
  weeks: string;
  level: string;
  tools: string[];
  objective: string;
  project: string;
  modules: FormationModule[];
};
