import type {DeepConceptArticle} from './deepConceptTypes';
import {pythonConceptBasics} from './pythonConceptBasics';
import {pythonConceptCollections} from './pythonConceptCollections';
import {pythonConceptLogic} from './pythonConceptLogic';
import {pythonConceptFiles} from './pythonConceptFiles';
import {numpyConceptArticles} from './numpyConceptArticles';
import {pandasConceptArticles} from './pandasConceptArticles';
import {opencvConceptBasics} from './opencvConceptBasics';
import {opencvConceptColors} from './opencvConceptColors';
import {pixelConceptArticlesPart1} from './pixelConceptArticlesPart1';
import {pixelConceptArticlesPart2} from './pixelConceptArticlesPart2';
import {pythonImageConceptArticles} from './pythonImageConceptArticles';

export const pythonConceptArticles:DeepConceptArticle[]=[
 ...pythonConceptBasics.filter(a=>a.slug==='python-introduction'||a.slug==='jupyter-notebook'),
 ...pythonConceptBasics.filter(a=>a.slug==='python-variables'||a.slug==='python-data-types'||a.slug==='python-operators'),
 ...pythonConceptCollections,
 ...pythonConceptLogic.filter(a=>a.slug==='python-conditions'||a.slug==='python-loops'||a.slug==='python-builtins'||a.slug==='python-user-defined-functions'),
 ...pythonConceptFiles
];

export function deepConceptsFor(moduleId:string):DeepConceptArticle[]{
 if(moduleId==='python')return pythonConceptArticles;
 if(moduleId==='pandas-numpy')return [...numpyConceptArticles,...pandasConceptArticles];
 if(moduleId==='opencv-couleurs')return [...opencvConceptBasics,...opencvConceptColors];
 if(moduleId==='images-pixels')return [...pixelConceptArticlesPart1,...pixelConceptArticlesPart2];
 if(moduleId==='python-images')return [
   pythonConceptArticles.find(a=>a.slug==='jupyter-notebook')!,
   numpyConceptArticles.find(a=>a.slug==='numpy-shape-dtype')!,
   ...pythonImageConceptArticles
 ];
 return [];
}
