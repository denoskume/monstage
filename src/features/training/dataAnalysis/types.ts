export type CodeLanguage = 'python' | 'sql' | 'dax' | 'powerquery' | 'text';
export interface ProjectAction {
  id: string;
  title: string;
  request: string;
  expectedDeliverable: string;
  prerequisites: string[];
  reasoning: { title: string; explanation: string }[];
  guided: { instruction: string; language: CodeLanguage; code: string; explanation: string[]; expected: string };
  yourTurn: { instruction: string; constraints: string[]; checks: string[] };
  solution: { steps: string[]; language: CodeLanguage; code: string; explanation: string; verification: string[] };
  troubleshooting: { symptom: string; cause: string; fix: string }[];
  managerQuestions: { question: string; expected: string }[];
  changeRequest: string;
  reference: { title: string; url: string; when: string }[];
}
export interface ProjectMission { id: string; title: string; brief: string; deliverable: string; actionIds: string[]; }
