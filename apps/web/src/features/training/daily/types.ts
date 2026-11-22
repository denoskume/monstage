export interface DailyLesson {
  id: string;
  objective: string;
  prerequisites: string[];
  concepts: { title: string; explanation: string }[];
  demonstration: { title: string; instruction: string; code: string; explanation: string[]; expected: string };
  exercise: { brief: string; constraints: string[]; deliverables: string[]; acceptance: string[] };
  correction: { steps: string[]; code: string; explanation: string; verification: string[] };
  troubleshooting: { symptom: string; cause: string; fix: string }[];
  challenge: string;
  review: { question: string; expected: string }[];
  reading: { title: string; url: string; focus: string }[];
}
