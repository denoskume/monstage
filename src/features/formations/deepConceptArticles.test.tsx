import {describe,expect,it} from 'vitest';
import {render,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {pythonConceptArticles,deepConceptsFor} from './deepConceptIndex';
import {CourseArticle} from './CourseArticle';
import {dataAnalystTrack} from './dataAnalystTrack';

describe('complete individual notion articles',()=>{
  it('does not hide brief one-paragraph definitions behind full article titles',()=>{
    expect(pythonConceptArticles).toHaveLength(15);
    expect(new Set(pythonConceptArticles.map(c=>c.slug)).size).toBe(15);
    for(const entry of pythonConceptArticles){
      const article=entry.article;
      expect(article.intro.length,entry.slug).toBeGreaterThanOrEqual(2);
      expect(article.tldr.length,entry.slug).toBeGreaterThanOrEqual(3);
      expect(article.sections.length,entry.slug).toBeGreaterThanOrEqual(6);
      expect(article.sections.filter(s=>s.code).length,entry.slug).toBeGreaterThanOrEqual(5);
      for(const part of article.sections){
        expect(part.paragraphs.length,entry.slug+' '+part.id).toBeGreaterThanOrEqual(2);
        expect(part.paragraphs.join(' ').length,entry.slug+' '+part.id).toBeGreaterThan(125);
        if(part.code){
          expect(part.output?.length,entry.slug+' '+part.id).toBeGreaterThan(2);
          expect(part.interpretation?.length,entry.slug+' '+part.id).toBeGreaterThan(35);
        }
      }
      expect(article.mistakes.length,entry.slug).toBeGreaterThanOrEqual(5);
      expect(article.faq.length,entry.slug).toBeGreaterThanOrEqual(5);
      expect(article.conclusion.length,entry.slug).toBeGreaterThanOrEqual(2);
    }
  });
  it('separates variables, data types, built-in functions and user-defined functions',()=>{
    const articles=deepConceptsFor('python');
    expect(articles.find(a=>a.slug==='python-variables')?.article.sections.some(s=>s.title.includes('Assignment'))).toBe(true);
    expect(articles.find(a=>a.slug==='python-data-types')?.article.sections.some(s=>s.title.includes('Type Conversion'))).toBe(true);
    expect(articles.find(a=>a.slug==='python-builtins')?.article.sections.some(s=>s.title.includes('range, enumerate and zip'))).toBe(true);
    expect(articles.find(a=>a.slug==='python-user-defined-functions')?.article.sections.some(s=>s.title.includes('return and print'))).toBe(true);
  });
  it('allows opening a specific course with its own table of contents, code and FAQs',async()=>{
    const module=dataAnalystTrack.modules.find(m=>m.id==='python')!;
    const user=userEvent.setup();
    render(<CourseArticle track={dataAnalystTrack} module={module} learned={[]} onToggle={()=>{}} onPractice={()=>{}} onValidate={()=>{}}/>);
    expect(screen.getByRole('navigation',{name:'Articles complets du module'})).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:/Built-in Functions in Python/}));
    expect(screen.getByRole('heading',{name:'Built-in Functions in Python: A Complete Beginner’s Guide'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Table of contents'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Numeric Built-ins: sum, min, max and abs'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Common Mistakes Beginners Make'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'FAQs'})).toBeInTheDocument();
    await user.click(screen.getByRole('button',{name:/User-defined Functions in Python/}));
    expect(screen.getByRole('heading',{name:'The Difference Between return and print'})).toBeInTheDocument();
  });
});
