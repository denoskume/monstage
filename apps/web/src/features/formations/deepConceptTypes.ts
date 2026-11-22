import type { CourseArticleData, ArticleSection } from './courseArticleContent';

export type DeepConceptArticle = {
  slug:string;
  pointIndex:number;
  article:CourseArticleData;
};

export function concept(
 slug:string, pointIndex:number, title:string,
 introduction:[string,string],
 summary:[string,string,string],
 sections:ArticleSection[],
 mistakes:string[],
 conclusion:[string,string],
 faqs:{question:string;answer:string}[],
 category='PYTHON · FONDAMENTAUX'
):DeepConceptArticle {
 return {
  slug, pointIndex,
  article:{
   eyebrow:category,
   title,
   author:'MonStage Learning',
   intro:introduction,
   tldr:summary,
   sections,
   mistakes,
   conclusion,
   faq:faqs
  }
 };
}
export function section(id:string,title:string,paragraphs:[string,string],extras:Partial<ArticleSection>={}):ArticleSection {
  return {id,title,paragraphs,...extras};
}
export function faq(question:string,answer:string){return {question,answer};}
