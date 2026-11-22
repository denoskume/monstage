import { emptyTraining, validateTraining, type TrainingState } from '../training';
export interface DataStageState extends TrainingState { course: 'data-analysis'; }
export const emptyDataStage = (): DataStageState => ({ ...emptyTraining(), course: 'data-analysis' });
export function validateDataStage(value: unknown): DataStageState {
  if (!value || typeof value !== 'object' || (value as {course?:unknown}).course !== 'data-analysis') throw new Error('Ce fichier ne correspond pas au stage Data Analysis.');
  const state = validateTraining(value) as DataStageState;
  const known = new Set(Array.from({length:40},(_,i)=>`a${String(i+1).padStart(2,'0')}`));
  for (const field of [state.tasks,state.logs,state.dailyStudy??{},state.dailyReviews??{}]) {
    if (Object.keys(field).some(id => !known.has(id))) throw new Error('Le dossier contient un travail inconnu de ce projet.');
  }
  return state;
}
export function dataProgress(state: DataStageState, ids: string[] = Array.from({length:40},(_,i)=>`a${String(i+1).padStart(2,'0')}`)) {
  const completed = ids.filter(id => state.tasks[id] === true).length;
  return { completed, total: ids.length, percent: ids.length ? Math.round(100 * completed / ids.length) : 0 };
}
