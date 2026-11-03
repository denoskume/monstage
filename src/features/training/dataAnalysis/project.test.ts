import {expect,it} from 'vitest';
import {actions,missions} from './project';
it('covers one continuous project with forty complete work requests',()=>{
 expect(actions).toHaveLength(40);
 expect(new Set(actions.map(a=>a.id)).size).toBe(40);
 expect(missions.flatMap(m=>m.actionIds)).toEqual(actions.map(a=>a.id));
 for(const action of actions){
  expect(action.yourTurn.checks.length).toBeGreaterThanOrEqual(3);
  expect(action.solution.steps.length).toBeGreaterThanOrEqual(3);
  expect(action.managerQuestions.length).toBeGreaterThanOrEqual(2);
  expect(action.guided.code.length).toBeGreaterThan(80);
  expect(action.solution.code.length).toBeGreaterThan(80);
 }
});
