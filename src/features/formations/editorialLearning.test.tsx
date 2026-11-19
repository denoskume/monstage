import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonChapter } from './LessonChapter';
import { getLessonExample } from './lessonExamples';
import { topicGuide } from './TopicLessons';
import { dataAnalystTrack } from './dataAnalystTrack';
import { imageProcessingTrack } from './imageProcessingTrack';
import { computerVisionTrack } from './computerVisionTrack';

const tracks=[dataAnalystTrack,imageProcessingTrack,computerVisionTrack];
describe('Reference-style editorial learning',()=>{
  it('gives every one of the 205 concepts a short relevant snippet, explanation and expected result',()=>{
    let total=0;
    for(const track of tracks)for(const module of track.modules)
      for(const [index,topic] of module.points.entries()){
        const example=getLessonExample(topic,module,index);
        expect(example.code.length, module.id+': '+topic).toBeGreaterThan(20);
        expect(example.meaning.length,module.id+': '+topic).toBeGreaterThan(40);
        expect(example.output.length,module.id+': '+topic).toBeGreaterThan(9);
        expect(example.challenge.length,module.id+': '+topic).toBeGreaterThan(20);
        expect(example.meaning).not.toContain('Ce court extrait appartient au projet réel du module');
        total++;
      }
    expect(total).toBe(205);
  });
  it('renders a concise article with TLDR, interactive picture, code, expected output and FAQs',async()=>{
    const module=imageProcessingTrack.modules[0];
    const topic=module.points[0];
    const user=userEvent.setup();
    render(<LessonChapter module={module} topic={topic} index={0} guide={topicGuide(topic,module)}/>);
    expect(screen.getByText('À comprendre en 30 secondes')).toBeInTheDocument();
    expect(screen.getByRole('navigation',{name:'Sommaire de cette leçon'})).toBeInTheDocument();
    expect(screen.getByRole('group',{name:'Image 5 par 5 pixels'})).toBeInTheDocument();
    expect(screen.getByText('RÉSULTAT ATTENDU OU À OBSERVER')).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Questions fréquentes'})).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:'Pixel ligne 0 colonne 0 intensité 5'}));
    expect(screen.getByText('I(0, 0) = 5')).toBeInTheDocument();
  });
  it('explains a first Data Analyst lesson using real rows and calculated bars',()=>{
    const module=dataAnalystTrack.modules[0],topic=module.points[0];
    render(<LessonChapter module={module} topic={topic} index={0} guide={topicGuide(topic,module)}/>);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('combobox',{name:'Indicateur graphique'})).toBeInTheDocument();
  });
  it('explains supervised classification with explicit training and test sets',()=>{
    const module=computerVisionTrack.modules[0],topic=module.points[0];
    render(<LessonChapter module={module} topic={topic} index={0} guide={topicGuide(topic,module)}/>);
    expect(screen.getByText(/Train 80%/)).toBeInTheDocument();
    expect(screen.getByText(/Test 20%/)).toBeInTheDocument();
  });
});
