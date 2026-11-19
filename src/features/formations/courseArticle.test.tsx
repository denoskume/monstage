import {describe,expect,it} from 'vitest';
import {render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {articleFor,CourseArticle} from './CourseArticle';
import {dataAnalystTrack} from './dataAnalystTrack';
import {imageProcessingTrack} from './imageProcessingTrack';
import {computerVisionTrack} from './computerVisionTrack';

const tracks=[dataAnalystTrack,imageProcessingTrack,computerVisionTrack];
function showArticle(track:typeof tracks[number],id:string){
 const module=track.modules.find(m=>m.id===id)!;
 return render(<CourseArticle track={track} module={module} learned={[]}
   onToggle={()=>{}} onPractice={()=>{}} onValidate={()=>{}}/>);
}
describe('GUVI-reference complete article layout',()=>{
 it('provides a complete continuous article for every one of the 34 modules',()=>{
  let count=0;
  for(const track of tracks)for(const module of track.modules){
   const article=articleFor(track,module);
   expect(article.title).toContain('Beginner');
   expect(article.intro.length).toBeGreaterThanOrEqual(2);
   expect(article.tldr.length).toBeGreaterThanOrEqual(2);
   expect(article.sections.length).toBeGreaterThanOrEqual(5);
   expect(article.sections.some(s=>s.code)).toBe(true);
   expect(article.sections.every(s=>s.paragraphs.length>0)).toBe(true);
   expect(article.mistakes.length).toBeGreaterThanOrEqual(4);
   expect(article.faq.length).toBeGreaterThanOrEqual(4);
   count++;
  }
  expect(count).toBe(34);
 });
 it('reproduces the OpenCV reference article hierarchy and seven FAQs',()=>{
  const module=imageProcessingTrack.modules.find(m=>m.id==='opencv-couleurs')!;
  const a=articleFor(imageProcessingTrack,module);
  expect(a.sections.map(s=>s.title)).toEqual([
   'What is OpenCV?','Installing OpenCV','How OpenCV Sees Images',
   'Colour Spaces and Conversions','Core Image Operations',
   'Resizing and Blurring','Edge Detection with Canny',
   'Processing Video and Webcam Feeds'
  ]);
  expect(a.faq).toHaveLength(7);
  showArticle(imageProcessingTrack,'opencv-couleurs');
  expect(screen.getByRole('heading',{name:'Table of contents'})).toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'TL;DR Summary'})).toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'Common Mistakes Beginners Make'})).toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'Conclusion'})).toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'FAQs'})).toBeInTheDocument();
  expect(screen.getByText('OpenCV: The Foundation of Computer Vision')).toBeInTheDocument();
 });
 it('teaches NumPy and Pandas separately within the shared unit',()=>{
  const a=articleFor(dataAnalystTrack,dataAnalystTrack.modules.find(m=>m.id==='pandas-numpy')!);
  expect(a.sections.map(s=>s.title)).toContain('What is NumPy?');
  expect(a.sections.map(s=>s.title)).toContain('What is Pandas?');
  expect(a.sections.map(s=>s.title)).toContain('Cleaning Missing and Duplicate Values');
  showArticle(dataAnalystTrack,'pandas-numpy');
  expect(screen.queryByText(/Une ligne est une campagne/)).not.toBeInTheDocument();
  expect(screen.getByRole('heading',{name:'Understanding Series and DataFrames'})).toBeInTheDocument();
 });
 it('renders a readable article TOC with scroll controls',async()=>{
  const user=userEvent.setup();
  showArticle(dataAnalystTrack,'python');
  const catalog=screen.getByRole('navigation',{name:'Articles complets du module'});
  expect(catalog.querySelectorAll('button')).toHaveLength(15);
  await user.click(within(catalog).getByRole('button',{name:/Jupyter Notebook and Markdown Cells/}));
  const toc=screen.getByRole('navigation',{name:'Table of contents'});
  expect(toc.querySelectorAll('button').length).toBeGreaterThan(6);
  await user.click(screen.getByRole('button',{name:/Installer et ouvrir JupyterLab/}));
  expect(screen.getByRole('heading',{name:'Installer et ouvrir JupyterLab'})).toBeInTheDocument();
 });
});
