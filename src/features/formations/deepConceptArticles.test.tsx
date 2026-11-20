import {describe,expect,it} from 'vitest';
import {render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {pythonConceptArticles,deepConceptsFor} from './deepConceptIndex';
import {CourseArticle} from './CourseArticle';
import {dataAnalystTrack} from './dataAnalystTrack';
import {conceptNotebookSource} from './conceptNotebook';
import {imageProcessingTrack} from './imageProcessingTrack';

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
          expect(part.output?.length,entry.slug+' '+part.id).toBeGreaterThan(0);
          expect(part.interpretation?.length,entry.slug+' '+part.id).toBeGreaterThan(35);
        }
      }
      expect(article.mistakes.length,entry.slug).toBeGreaterThanOrEqual(5);
      expect(article.faq.length,entry.slug).toBeGreaterThanOrEqual(5);
      expect(article.conclusion.length,entry.slug).toBeGreaterThanOrEqual(2);
    }
  });
  it('exports the entire lesson to an executable Jupyter notebook, not a single code cell',()=>{
    for(const item of pythonConceptArticles){
      const notebook=JSON.parse(conceptNotebookSource(item)) as {
        nbformat:number;cells:Array<{cell_type:string;source:string}>;
      };
      expect(notebook.nbformat).toBe(4);
      expect(notebook.cells.filter(c=>c.cell_type==='code').length,item.slug).toBeGreaterThanOrEqual(6);
      expect(notebook.cells.filter(c=>c.cell_type==='markdown').length,item.slug).toBeGreaterThanOrEqual(12);
      expect(notebook.cells[0].source).toContain(item.article.title);
      expect(notebook.cells.some(c=>c.source.includes('Common Mistakes'))).toBe(true);
      expect(notebook.cells.some(c=>c.source.includes('FAQs'))).toBe(true);
    }
  });
  it('maintains 39 independently authored, inspectable tutorials across Python, NumPy, Pandas, images and OpenCV',()=>{
    const all=[
      ...deepConceptsFor('python'),
      ...deepConceptsFor('pandas-numpy'),
      ...deepConceptsFor('opencv-couleurs'),
      ...deepConceptsFor('images-pixels')
    ];
    expect(all).toHaveLength(39);
    expect(new Set(all.map(a=>a.slug)).size).toBe(33);
    for(const {slug,article} of all){
      expect(article.intro.length,slug).toBeGreaterThanOrEqual(2);
      expect(article.sections.length,slug).toBeGreaterThanOrEqual(6);
      expect(article.sections.filter(s=>s.language==='python'&&s.code).length,slug).toBeGreaterThanOrEqual(5);
      expect(article.sections.every(s=>s.paragraphs.length>=2),slug).toBe(true);
      expect(article.sections.every(s=>Boolean(s.output&&s.interpretation)),slug).toBe(true);
      expect(article.mistakes.length,slug).toBeGreaterThanOrEqual(5);
      expect(article.faq.length,slug).toBeGreaterThanOrEqual(5);
      const notebook=JSON.parse(conceptNotebookSource({slug,pointIndex:0,article})) as {cells:{cell_type:string}[]};
      expect(notebook.cells.filter(c=>c.cell_type==='code').length,slug).toBeGreaterThanOrEqual(6);
    }
  });
  it('opens OpenCV colour and Pandas GroupBy as independent lesson pages',async()=>{
    const user=userEvent.setup();
    const opencv=imageProcessingTrack.modules.find(m=>m.id==='opencv-couleurs')!;
    const {unmount}=render(<CourseArticle track={imageProcessingTrack} module={opencv} learned={[]}
      onToggle={()=>{}} onPractice={()=>{}} onValidate={()=>{}}/>);
    let nav=screen.getByRole('navigation',{name:'Articles complets du module'});
    await user.click(within(nav).getByRole('button',{name:/HSV Colour Space/}));
    expect(screen.getByRole('heading',{name:'HSV Colour Space in OpenCV: A Complete Beginner’s Guide'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'OpenCV HSV Channel Ranges'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:/Hue, Saturation and Value Explained/})).toBeInTheDocument();
    unmount();
    const pandas=dataAnalystTrack.modules.find(m=>m.id==='pandas-numpy')!;
    render(<CourseArticle track={dataAnalystTrack} module={pandas} learned={[]}
      onToggle={()=>{}} onPractice={()=>{}} onValidate={()=>{}}/>);
    nav=screen.getByRole('navigation',{name:'Articles complets du module'});
    await user.click(within(nav).getByRole('button',{name:/GroupBy, Aggregation and Pivot Tables/}));
    expect(screen.getByRole('heading',{name:'Pandas GroupBy, Aggregation and Pivot Tables: A Beginner’s Guide'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Calculate Several Indicators with agg'})).toBeInTheDocument();
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
    await user.click(within(screen.getByRole('navigation',{name:'Articles complets du module'})).getByRole('button',{name:/Built-in Functions in Python/}));
    expect(screen.getByRole('heading',{name:'Built-in Functions in Python: A Complete Beginner’s Guide'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Table of contents'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Numeric Built-ins: sum, min, max and abs'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'Common Mistakes Beginners Make'})).toBeInTheDocument();
    expect(screen.getByRole('heading',{name:'FAQs'})).toBeInTheDocument();
    await user.click(within(screen.getByRole('navigation',{name:'Articles complets du module'})).getByRole('button',{name:/User-defined Functions in Python/}));
    expect(screen.getByRole('heading',{name:'The Difference Between return and print'})).toBeInTheDocument();
  });
});
