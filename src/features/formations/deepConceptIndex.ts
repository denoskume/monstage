import type {DeepConceptArticle} from './deepConceptTypes';
import {pythonConceptBasics} from './pythonConceptBasics';
import {pythonConceptCollections} from './pythonConceptCollections';
import {pythonConceptLogic} from './pythonConceptLogic';
import {pythonConceptFiles} from './pythonConceptFiles';
import {numpyConceptArticles} from './numpyConceptArticles';
import {pandasConceptArticles} from './pandasConceptArticles';

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
 return [];
}
