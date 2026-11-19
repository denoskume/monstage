import {beforeEach,describe,expect,it} from 'vitest';
import {backupModel,importBackup} from './FormationBackup';
import {dataAnalystTrack} from './dataAnalystTrack';
import {imageProcessingTrack} from './imageProcessingTrack';
import {computerVisionTrack} from './computerVisionTrack';
const tracks=[dataAnalystTrack,imageProcessingTrack,computerVisionTrack];

describe('Formation progress backup',()=>{
 beforeEach(()=>localStorage.clear());
 it('exports locally saved learning progress without touching other MonStage state',()=>{
  localStorage.setItem('monstage:formations:topic-completed:v1',JSON.stringify(['traitement-images:images-pixels:lecon-1']));
  localStorage.setItem('monstage:other-app',{value:1} as unknown as string);
  const b=backupModel();
  expect(b.version).toBe(1);
  expect(b.topics).toContain('traitement-images:images-pixels:lecon-1');
  expect(localStorage.getItem('monstage:other-app')).not.toBeNull();
 });
 it('restores only known module, topic and project keys while retaining existing values',()=>{
  localStorage.setItem('monstage:formations:completed:v2',JSON.stringify(['traitement-images:images-pixels']));
  const data={
   version:1,kind:'monstage-learning',date:'2026-11-19',
   modules:['data-analyst:sql','unknown:module'],
   topics:['data-analyst:sql:lecon-1','wrong'],
   notes:{'data-analyst:sql:lecon-1':'Une note utile','unknown':'private'},
   projects:{'data-analyst:sales':[true,false,false,false],'other':[true]}
  };
  const imported=importBackup(data,tracks);
  expect(imported.modules).toContain('traitement-images:images-pixels');
  expect(imported.modules).toContain('data-analyst:sql');
  expect(imported.modules).not.toContain('unknown:module');
  expect(imported.topics).toEqual(['data-analyst:sql:lecon-1']);
  expect(imported.notes.unknown).toBeUndefined();
  expect(imported.projects['data-analyst:sales'][0]).toBe(true);
  expect(imported.projects.other).toBeUndefined();
 });
 it('rejects malformed progress files',()=>{
  expect(()=>importBackup({version:999},tracks)).toThrow(/sauvegarde/);
 });
});
