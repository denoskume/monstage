import { describe, expect, it } from 'vitest';
import { dataAnalystTrack } from './dataAnalystTrack';
import { imageProcessingTrack } from './imageProcessingTrack';
import { computerVisionTrack } from './computerVisionTrack';
import { allTopics, topicById, topicProgressKey, lessonNotebook } from './detailedLessons';

const tracks=[dataAnalystTrack,imageProcessingTrack,computerVisionTrack];

describe('205 individual topic lessons',()=>{
  it('has a complete lesson, teaching note, exercise, pitfall and graded quiz for every module subtopic',()=>{
    const lessons=tracks.flatMap(track=>track.modules.flatMap(module=>allTopics(track,module)));
    expect(lessons).toHaveLength(205);
    expect(new Set(lessons.map(t=>topicProgressKey(t))).size).toBe(205);
    for(const topic of lessons){
      expect(topic.title.length).toBeGreaterThan(6);
      expect(topic.concept.length).toBeGreaterThan(100);
      expect(topic.exercise.length).toBeGreaterThan(40);
      expect(topic.pitfall.length).toBeGreaterThan(50);
      expect(topic.code.length).toBeGreaterThan(50);
      expect(topic.focusCode.length).toBeGreaterThan(35);
      expect(topic.focusLanguage.length).toBeGreaterThan(0);
      expect(topic.quiz.options).toHaveLength(3);
      expect(topic.quiz.options[topic.quiz.correct]).toBe(topic.pitfall);
      expect(new Set(topic.quiz.options).size).toBe(3);
    }
  });
  it('provides independently addressable lessons and valid Jupyter notebook structures',()=>{
    for(const track of tracks){
      for(const module of track.modules){
        const topics=allTopics(track,module);
        expect(topics.map(t=>t.id)).toEqual(module.points.map((_,i)=>'lecon-'+(i+1)));
        for(const topic of topics){
          expect(topicById(track,module,topic.id)).toBeDefined();
          const notebook=JSON.parse(lessonNotebook(track,module,topic));
          expect(notebook.nbformat).toBe(4);
          expect(notebook.cells.some((cell:{cell_type:string})=>cell.cell_type==='markdown')).toBe(true);
          expect(notebook.cells.some((cell:{source:string})=>cell.source.includes(topic.title))).toBe(true);
          expect(notebook.cells.some((cell:{source:string})=>cell.source.includes(topic.exercise))).toBe(true);
          expect(notebook.cells.some((cell:{source:string})=>cell.source.includes(topic.pitfall))).toBe(true);
          expect(notebook.cells.some((cell:{source:string})=>cell.source.includes(topic.focusCode))).toBe(true);
        }
      }
    }
  });
});
