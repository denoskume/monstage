import { describe, expect, it } from 'vitest';
import { dataAnalystTrack } from './dataAnalystTrack';
import { imageProcessingTrack } from './imageProcessingTrack';
import { computerVisionTrack } from './computerVisionTrack';

const tracks=[dataAnalystTrack,imageProcessingTrack,computerVisionTrack];

describe('MonStage formation curricula',()=>{
  it('contains the three agreed learning paths and 34 modules',()=>{
    expect(dataAnalystTrack.modules).toHaveLength(12);
    expect(imageProcessingTrack.modules).toHaveLength(14);
    expect(computerVisionTrack.modules).toHaveLength(8);
    expect(new Set(tracks.map(t=>t.id)).size).toBe(3);
    expect(tracks.reduce((sum,t)=>sum+t.modules.length,0)).toBe(34);
  });
  it('has actionable content, independent examples and valid quizzes for every module',()=>{
    for (const track of tracks) {
      expect(track.objective.length).toBeGreaterThan(35);
      expect(track.modules.length).toBeGreaterThan(0);
      expect(new Set(track.modules.map(m=>m.id)).size).toBe(track.modules.length);
      for(const module of track.modules) {
        expect(module.objective.length).toBeGreaterThan(25);
        expect(module.concept.length).toBeGreaterThan(100);
        expect(module.points.length).toBeGreaterThanOrEqual(5);
        expect(module.example.length).toBeGreaterThan(40);
        expect(module.code.length).toBeGreaterThan(50);
        expect(module.result.length).toBeGreaterThan(50);
        expect(module.instructions.length).toBeGreaterThan(40);
        expect(module.mission.length).toBeGreaterThan(50);
        expect(module.validation.length).toBeGreaterThan(40);
        expect(module.quiz.options).toHaveLength(3);
        expect(module.quiz.correct).toBeGreaterThanOrEqual(0);
        expect(module.quiz.correct).toBeLessThan(3);
        expect(module.quiz.explanation.length).toBeGreaterThan(30);
      }
    }
  });
});
