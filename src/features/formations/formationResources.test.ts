import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { dataAnalystTrack } from './dataAnalystTrack';
import { imageProcessingTrack } from './imageProcessingTrack';
import { computerVisionTrack } from './computerVisionTrack';
import { allTopics } from './detailedLessons';
import { formationProjects } from './formationProjects';

const tracks=[dataAnalystTrack,imageProcessingTrack,computerVisionTrack];

describe('Training resource quality',()=>{
 it('has all eleven portfolio projects with genuine briefs, steps, starter codes and checks',()=>{
  expect(formationProjects['data-analyst']).toHaveLength(4);
  expect(formationProjects['traitement-images']).toHaveLength(4);
  expect(formationProjects['computer-vision']).toHaveLength(3);
  for(const [track,projects] of Object.entries(formationProjects)){
   expect(new Set(projects.map(p=>p.id)).size).toBe(projects.length);
   for(const project of projects){
    expect(track.length).toBeGreaterThan(5);
    expect(project.brief.length).toBeGreaterThan(100);
    expect(project.steps.length).toBeGreaterThanOrEqual(5);
    expect(project.deliverables.length).toBeGreaterThanOrEqual(4);
    expect(project.acceptance.length).toBeGreaterThanOrEqual(4);
    expect(project.starterCode).toContain('TODO');
   }
  }
 });
 it('provides specific focus examples rather than only module-level recycled code',()=>{
  for(const track of tracks) for(const module of track.modules){
   const topics=allTopics(track,module);
   expect(new Set(topics.map(topic=>topic.focusCode)).size).toBe(topics.length);
   for(const topic of topics){
    expect(topic.focusCode).not.toBe(module.code);
    expect(topic.focusCode.length).toBeGreaterThan(35);
   }
  }
 });
 it('parses all Python reference and focused cells before delivery',()=>{
  const scripts=tracks.flatMap(track=>track.modules.flatMap(module=>{
    const topics=allTopics(track,module);
    return [
     ...(module.codeLanguage==='python'?[{id:track.id+'/'+module.id+'/baseline',source:module.code}]:[]),
     ...topics.filter(t=>t.focusLanguage==='python').map(t=>({id:track.id+'/'+module.id+'/'+t.id,source:t.focusCode}))
    ];
  }));
  const py=`import ast,json,sys
scripts=json.loads(sys.stdin.read())
failed=[]
for item in scripts:
 try: ast.parse(item['source'],filename=item['id'])
 except SyntaxError as e: failed.append((item['id'],str(e)))
print(json.dumps(failed))
sys.exit(1 if failed else 0)`;
  const proc=spawnSync('python3',['-c',py],{input:JSON.stringify(scripts),encoding:'utf-8',maxBuffer:3*1024*1024});
  if(proc.error)throw proc.error;
  expect(proc.status,proc.stderr+'\n'+proc.stdout).toBe(0);
 });
});
