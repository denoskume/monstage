import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import type { CvDraft } from './cvStorage';
import {
  cleanThierryText, thierryAdvantages, thierryEducation, thierryEntries,
  thierryMethods, thierrySoftSkills, thierryTools, thierrySkillGroups, THIERRY_STYLE,
} from './thierryTemplate';
import { normalizeCvPdfText } from './cvPdfText';

// Values are measured directly from the original single-page A4 PDF.
const W = THIERRY_STYLE.pageWidth;
const H = THIERRY_STYLE.pageHeight;
const BLUE = rgb(0, 112 / 255, 192 / 255);
const GREY = rgb(191 / 255, 191 / 255, 191 / 255);
const BLACK = rgb(0, 0, 0);
const MAIN_X = 174.5;
const MAIN_W = 410;
const BOTTOM = 831;

type Token = { text: string; font: PDFFont };
type Painter = { page: PDFPage; regular: PDFFont; bold: PDFFont };

function safe(text: string): string {
  return normalizeCvPdfText(cleanThierryText(text));
}
function segments(regular: PDFFont, bold: PDFFont, pieces: [string, boolean][]): Token[] {
  return pieces.flatMap(([value, alwaysBold]) =>
    value.split(/(\*\*[^*]+\*\*)/g).flatMap(part => {
      const marked = part.startsWith('**') && part.endsWith('**') && part.length > 4;
      const text = safe(marked ? part.slice(2, -2) : part);
      return text.split(/\s+/).filter(Boolean)
        .map(word => ({ text: word, font: alwaysBold || marked ? bold : regular }));
    })
  );
}
function wrap(tokens: Token[], max: number, size: number, spaceFont: PDFFont): Token[][] {
  const lines: Token[][] = [];
  const space = spaceFont.widthOfTextAtSize(' ', size);
  let row: Token[] = [];
  let width = 0;
  for (const token of tokens) {
    const w = token.font.widthOfTextAtSize(token.text, size);
    if (row.length && width + space + w > max) { lines.push(row); row = []; width = 0; }
    width += (row.length ? space : 0) + w;
    row.push(token);
  }
  if (row.length) lines.push(row);
  return lines;
}
function paragraph(
  painter: Painter,
  pieces: [string, boolean][],
  x: number, top: number, maxWidth: number, size: number,
  lineHeight = 1.22, shouldDraw = true, align: 'left' | 'center' = 'left',
  color = BLACK,
): number {
  const {page, regular, bold} = painter;
  const rows = wrap(segments(regular,bold,pieces),maxWidth,size,regular);
  for (const [index, row] of rows.entries()) {
    const total = row.reduce((s,t)=>s+t.font.widthOfTextAtSize(t.text,size),0) +
      Math.max(0,row.length-1)*regular.widthOfTextAtSize(' ',size);
    let cx = align === 'center' ? x + (maxWidth - total)/2 : x;
    const baseline = H - top - size * (0.95 + index*lineHeight);
    for (const [j, token] of row.entries()) {
      if (shouldDraw) page.drawText(token.text, {x:cx,y:baseline,font:token.font,size,color});
      cx += token.font.widthOfTextAtSize(token.text,size);
      if (j<row.length-1) cx += regular.widthOfTextAtSize(' ',size);
    }
  }
  return top + rows.length*size*lineHeight;
}
function heading(p: Painter, label:string, x:number, top:number, size:number, draw:boolean):number {
  const txt=safe(label);
  if(draw){
    p.page.drawText(txt,{x,y:H-top-size*0.95,font:p.bold,size,color:BLACK});
    const width=p.bold.widthOfTextAtSize(txt,size);
    p.page.drawLine({start:{x,y:H-top-size*1.10},end:{x:x+width,y:H-top-size*1.10},thickness:0.7,color:BLACK});
  }
  return top+size*1.42;
}
function diamond(page:PDFPage,x:number,top:number,size:number,draw:boolean) {
  if(!draw)return;
  const half=size*0.40, cy=H-top-size*0.57;
  page.drawSvgPath('M 0 4 L 4 0 L 8 4 L 4 8 Z', {
    x:x-half, y:cy-half,
    scale:half/4, color:BLUE,
  });
}
function rule(page:PDFPage,top:number) {
  page.drawLine({start:{x:THIERRY_STYLE.leftBorder,y:H-top},end:{x:THIERRY_STYLE.splitX,y:H-top},thickness:0.48,color:BLUE});
}
export async function buildThierryCvPdfBytes(draft:CvDraft):Promise<Uint8Array> {
  const pdf=await PDFDocument.create();
  const page=pdf.addPage([W,H]);
  const regular=await pdf.embedFont(StandardFonts.TimesRoman);
  const bold=await pdf.embedFont(StandardFonts.TimesRomanBold);
  const painter={page,regular,bold};
  const sideX=11.3, sideWidth=138.2;
  // Original narrow gray rail with hairline blue framing.
  page.drawRectangle({x:6.12,y:H-834.84,width:149.06,height:827.28,color:GREY});
  page.drawRectangle({x:THIERRY_STYLE.leftBorder,y:H-834.84,width:THIERRY_STYLE.rightBorder-THIERRY_STYLE.leftBorder,height:834.84-THIERRY_STYLE.topBorder,borderWidth:0.48,borderColor:BLUE});
  page.drawLine({start:{x:THIERRY_STYLE.splitX,y:H-834.84},end:{x:THIERRY_STYLE.splitX,y:H-THIERRY_STYLE.topBorder},thickness:0.48,color:BLUE});

  function paintSide(scale:number,draw:boolean):number {
    let top=10;
    top=paragraph(painter,[[draft.name,true]],sideX,top,sideWidth,11.04*scale,1.13,draw,'center')+4;
    top=paragraph(painter,[[draft.headline,true]],sideX,top,sideWidth,12*scale,1.12,draw,'center',BLUE)+7;
    if(draw) rule(page,top); top+=7;
    top=paragraph(painter,[[draft.location,false]],sideX,top,sideWidth,9.7*scale,1.2,draw,'center')+6;
    if(draw)rule(page,top);top+=7;
    for(const s of [draft.email,draft.phone,draft.thierryAge??''].filter(Boolean)) {
      top=paragraph(painter,[[s,false]],sideX,top,sideWidth,9.0*scale,1.15,draw,'center')+2;
    }
    top+=4;
    if(draw)rule(page,top);top+=7;
    const blocks:[string,string[],boolean][]=[
      ['DIPLOMES / FORMATION',thierryEducation(draft).map(s=>'- '+s),true],
      ['LANGUE',safe(draft.languages).split('|'),false],
      ['LOGICIELS / OUTILS',thierryTools(draft).map(s=>'- '+s),false],
      ['NORMES',thierryMethods(draft).map(s=>'- '+s),false],
      ['Atouts',thierryAdvantages(draft).map(s=>'- '+s),false],
      ['Loisirs',safe(draft.interests).split('|').map(s=>'- '+s),false],
      ['Savoir-être',thierrySoftSkills(draft).map(s=>'- '+s),false],
    ];
    for(const [title,lines,leftAligned] of blocks) {
      if(!lines.filter(Boolean).length && !['NORMES','Atouts','Savoir-être'].includes(title))continue;
      const accent=['Atouts','Loisirs','Savoir-être'].includes(title);
      top=paragraph(painter,[[title,leftAligned]],sideX,top,sideWidth,10.15*scale,1.12,draw,leftAligned?'left':'center',accent?BLUE:BLACK)+4;
      for(const line of lines.filter(Boolean)) top=paragraph(painter,[[line,false]],sideX,top,sideWidth,9.15*scale,1.2,draw)+4;
      top+=4;if(draw)rule(page,top);top+=7;
    }
    return top;
  }
  let sideScale=1;
  while (sideScale>0.52 && paintSide(sideScale,false)>BOTTOM) sideScale-=0.025;
  paintSide(sideScale,true);

  const entries=thierryEntries(draft);
  const skillGroups=thierrySkillGroups(draft);
  function paintMain(scale:number,draw:boolean):number {
    let top=14;
    const s=9.96*scale;
    if(draft.thierryShowProfile!==false && draft.summary.trim()) {
      top=heading(painter,'PROFIL',MAIN_X,top,9.96*scale,draw)+1;
      top=paragraph(painter,[[draft.summary,false]],MAIN_X,top,MAIN_W,s,1.25,draw)+8*scale;
    }
    top=heading(painter,'EXPERIENCES',MAIN_X,top,9.96*scale,draw);
    for(const e of entries) {
      const titleSize=11.04*scale;
      diamond(page,192.5,top,titleSize,draw);
      top=paragraph(painter,[[e.title,true]],210.53,top,MAIN_W-(210.53-MAIN_X),titleSize,1.12,draw,'left',BLUE)+1.5*scale;
      if(e.period) top=paragraph(painter,[[e.period,false]],MAIN_X,top,MAIN_W,s,1.19,draw)+1*scale;
      if(e.organization) top=paragraph(painter,[[e.organization,true]],MAIN_X,top,MAIN_W,s,1.19,draw)+0.8*scale;
      if(e.mission) top=paragraph(painter,[['Mission :',true],[e.mission,false]],MAIN_X,top,MAIN_W,s,1.20,draw)+1*scale;
      if(e.acquired) top=paragraph(painter,[['Expériences acquises :',true],[e.acquired,false]],MAIN_X,top,MAIN_W,s,1.20,draw)+1*scale;
      if(e.results) top=paragraph(painter,[['Résultats :',true],[e.results,false]],MAIN_X,top,MAIN_W,s,1.20,draw)+1*scale;
      top+=9*scale;
    }
    if(skillGroups.length) {
      top=heading(painter,'COMPETENCES',MAIN_X,top,9.96*scale,draw)+3*scale;
      for(const group of skillGroups){
        diamond(page,192.5,top,9.6*scale,draw);
        top=paragraph(painter,[[group.title,true]],210.53,top,MAIN_W-(210.53-MAIN_X),9.3*scale,1.17,draw,'left',BLUE)+2*scale;
        for(const bullet of group.bullets){
          top=paragraph(painter,[['• '+bullet,false]],210.53,top,MAIN_W-(210.53-MAIN_X),9.0*scale,1.15,draw)+2*scale;
        }
        top+=2*scale;
      }
    }
    return top;
  }
  let mainScale=1;
  while(mainScale>0.51 && paintMain(mainScale,false)>BOTTOM)mainScale-=0.025;
  paintMain(mainScale,true);
  // PDF is always a single page; long input is compacted proportionally rather than clipped.
  pdf.setTitle('CV – ' + safe(draft.name) + ' – Modèle Thierry KUME');
  pdf.setAuthor(safe(draft.name));
  return pdf.save();
}
