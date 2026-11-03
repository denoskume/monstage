import { expect, it } from 'vitest';
import { emptyDataStage, validateDataStage, dataProgress } from './state';
it('keeps this project separate from the Computer Vision state', () => {
  expect(emptyDataStage().course).toBe('data-analysis');
  expect(() => validateDataStage({ version:1,startDate:'',tasks:{},logs:{},mastered:{} })).toThrow();
  expect(dataProgress(emptyDataStage()).completed).toBe(0);
  expect(dataProgress({...emptyDataStage(),tasks:{a01:true,w1d1t1:true}}).completed).toBe(1);
});
it('round trips the project state without changing notes', () => {
  const state = { ...emptyDataStage(),logs:{a01:{minutes:30,notes:'Question du responsable',blocker:'',evidence:'commit abc',date:''}} };
  expect(validateDataStage(JSON.parse(JSON.stringify(state)))).toEqual(state);
});
