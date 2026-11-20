import type {DeepConceptArticle} from './deepConceptTypes';

export function conceptNotebookSource(item:DeepConceptArticle):string{
 const a=item.article;
 const markdown=(source:string)=>({cell_type:'markdown' as const,metadata:{},source});
 const code=(source:string)=>({cell_type:'code' as const,metadata:{},source,execution_count:null,outputs:[]});
 const cells:Array<ReturnType<typeof markdown>|ReturnType<typeof code>>=[
  markdown('# '+a.title+'\n\n**'+a.eyebrow+'**\n\n'+a.intro.join('\n\n')),
  markdown('## TL;DR Summary\n\n'+a.tldr.join('\n\n'))
 ];
 for(const s of a.sections){
  cells.push(markdown('## '+s.title+'\n\n'+s.paragraphs.join('\n\n')));
  if(s.code&&(!s.language||s.language==='python')){
   cells.push(code(s.code));
  }else if(s.code){
   cells.push(markdown('### Exemple '+(s.language||'')+'\n\n```'+(s.language||'')+'\n'+s.code+'\n```'));
  }
  if(s.output)cells.push(markdown('**Résultat attendu**\n\n```text\n'+s.output+'\n```'));
  if(s.interpretation)cells.push(markdown('**Interprétation**\n\n'+s.interpretation));
 }
 cells.push(markdown('## Common Mistakes Beginners Make\n\n'+a.mistakes.map(x=>'- '+x).join('\n')));
 cells.push(markdown('## Conclusion\n\n'+a.conclusion.join('\n\n')));
 cells.push(markdown('## FAQs\n\n'+a.faq.map(q=>'**'+q.question+'**\n\n'+q.answer).join('\n\n')));
 cells.push(markdown('## Ma pratique\n\n1. Exécute chaque exemple dans l’ordre.\n2. Change un paramètre et prédis le résultat.\n3. Refais un exemple sans copier.\n4. Explique les erreurs et les limites des données.'));
 cells.push(code('# Mon exercice personnel\n'));
 return JSON.stringify({
  nbformat:4,nbformat_minor:5,
  metadata:{kernelspec:{display_name:'Python 3',language:'python',name:'python3'},language_info:{name:'python'}},
  cells
 },null,2);
}
export function downloadConceptNotebook(item:DeepConceptArticle){
 const blob=new Blob([conceptNotebookSource(item)],{type:'application/x-ipynb+json'});
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement('a');
 anchor.href=url;
 anchor.download=item.slug+'.ipynb';
 document.body.appendChild(anchor);
 anchor.click();
 anchor.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
