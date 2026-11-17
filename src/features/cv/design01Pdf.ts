import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import type { CvDraft } from './cvStorage';
import { normalizeCvPdfText } from './cvPdfText';
import {
  cleanThierryText, thierryEducation, thierryEntries, thierryTools,
  thierryAdvantages, thierryMethods, thierrySoftSkills, thierrySkillGroups,
} from './thierryTemplate';
import { DESIGN01 } from './design01Template';

// The PDF is made of vector shapes and selectable text. No rasterized CV,
// canvas screenshot, or glyph-as-image is used. The source data remain editable.
const W=DESIGN01.pageWidth, H=DESIGN01.pageHeight;
const FONT_MIN=7.3;
const INK=rgb(0,0,0);
function color(hex:string) {
  return rgb(parseInt(hex.slice(1,3),16)/255,parseInt(hex.slice(3,5),16)/255,parseInt(hex.slice(5,7),16)/255);
}
const FRAME=color(DESIGN01.frameBlue);
const DIVIDER=color(DESIGN01.dividerBlue);
const BLUE=color(DESIGN01.darkBlue);
const GRAY=color(DESIGN01.railGray);
type Fonts={regular:PDFFont;bold:PDFFont};
type Painter={page:PDFPage;fonts:Fonts;draw:boolean};
function safe(value:string) { return normalizeCvPdfText(cleanThierryText(value)); }
function wrapped(value:string, font:PDFFont, size:number, width:number):string[] {
  const words=safe(value).split(/\s+/).filter(Boolean);
  const lines:string[]=[];let line='';
  for(const word of words) {
    // Overlong URLs are retained and wrapped by characters (never removed).
    const chunks:string[]=[];
    if(font.widthOfTextAtSize(word,size)>width) {
      let chunk='';
      for(const ch of word) {
        if(chunk && font.widthOfTextAtSize(chunk+ch,size)>width){chunks.push(chunk);chunk='';}
        chunk+=ch;
      }
      if(chunk)chunks.push(chunk);
    }else chunks.push(word);
    for(const chunk of chunks) {
      if(line && font.widthOfTextAtSize(line+' '+chunk,size)>width) {lines.push(line);line='';}
      line=line ? line+' '+chunk : chunk;
    }
  }
  if(line)lines.push(line);
  return lines;
}
type RichWord = { value:string; font:PDFFont };
function richWords(text:string, fonts:Fonts, alwaysBold=false):RichWord[] {
  return text.split(/(\*\*[^*]+\*\*)/g).flatMap(part=>{
    const marked = part.startsWith('**') && part.endsWith('**') && part.length > 4;
    return safe(marked ? part.slice(2,-2) : part)
      .split(/\s+/).filter(Boolean)
      .map(value=>({value,font:alwaysBold||marked?fonts.bold:fonts.regular}));
  });
}
function richRows(words:RichWord[], width:number, size:number, fonts:Fonts):RichWord[][] {
  const output:RichWord[][]=[];
  const spacer=fonts.regular.widthOfTextAtSize(' ',size);
  let row:RichWord[]=[];let used=0;
  for(const word of words){
    // Split very long URLs/identifiers without losing characters.
    const chunks:RichWord[]=[];
    if(word.font.widthOfTextAtSize(word.value,size)>width){
      let chunk='';
      for(const char of word.value){
        if(chunk && word.font.widthOfTextAtSize(chunk+char,size)>width){
          chunks.push({value:chunk,font:word.font});chunk='';
        }
        chunk+=char;
      }
      if(chunk)chunks.push({value:chunk,font:word.font});
    } else chunks.push(word);
    for(const candidate of chunks){
      const w=candidate.font.widthOfTextAtSize(candidate.value,size);
      if(row.length && used+spacer+w>width){output.push(row);row=[];used=0;}
      used+=(row.length?spacer:0)+w;
      row.push(candidate);
    }
  }
  if(row.length)output.push(row);
  return output;
}
function text(
  painter:Painter, value:string, x:number, top:number,
  width:number, size:number, opts?:{bold?:boolean;center?:boolean;fill?:ReturnType<typeof rgb>;leading?:number},
):number {
  const leading=opts?.leading??1.14;
  const lines=richRows(richWords(value,painter.fonts,Boolean(opts?.bold)),width,size,painter.fonts);
  if(painter.draw)lines.forEach((line,i)=>{
    const wordSpace=painter.fonts.regular.widthOfTextAtSize(' ',size);
    const lineWidth=line.reduce((total,t)=>total+t.font.widthOfTextAtSize(t.value,size),0)+
      Math.max(0,line.length-1)*wordSpace;
    let cursor=x+(opts?.center?(width-lineWidth)/2:0);
    for(const [j,token] of line.entries()){
      painter.page.drawText(token.value,{
        x:cursor,y:H-(top+i*size*leading)-size*0.90,
        size,font:token.font,color:opts?.fill??INK,
      });
      cursor+=token.font.widthOfTextAtSize(token.value,size)+(j<line.length-1?wordSpace:0);
    }
  });
  return top+size*leading*lines.length;
}
function labeled(p:Painter, label:string, value:string, x:number,top:number,width:number,size:number):number {
  if(!value.trim()) return top;
  return text(p,'**'+label+':** '+value,x,top,width,size,{leading:1.17});
}
function sectionTitle(p:Painter,title:string,x:number,top:number,size=11):number {
  const label=safe(title);
  if(p.draw){
    p.page.drawText(label,{x,y:H-top-size,font:p.fonts.bold,size,color:INK});
    const wd=p.fonts.bold.widthOfTextAtSize(label,size);
    p.page.drawLine({start:{x,y:H-top-size-1.3},end:{x:x+wd,y:H-top-size-1.3},color:INK,thickness:0.6});
  }
  return top+size*1.30;
}
function diamond(p:Painter,x:number,top:number,size:number) {
  if(!p.draw)return;
  const cy=H-top-size/2;
  // Pure vector blue diamond: ATS extractors never mistake it for a character.
  p.page.drawSvgPath('M0 5 L5 0 L10 5 L5 10 Z',{x,y:cy,scale:size/10,color:BLUE});
}
function rule(page:PDFPage,yTop:number){
  page.drawLine({start:{x:DESIGN01.railX+1.3,y:H-yTop},end:{x:DESIGN01.railRight-1.6,y:H-yTop},color:DIVIDER,thickness:0.35});
}
export async function buildDesign01CvPdfBytes(draft:CvDraft):Promise<Uint8Array> {
  const doc=await PDFDocument.create();
  const page=doc.addPage([W,H]);
  const fonts:Fonts={
    regular:await doc.embedFont(StandardFonts.Helvetica),
    bold:await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const p:Painter={page,fonts,draw:true};
  // Original thin cyan frame, gray sidebar, white main area and header rule.
  page.drawRectangle({x:DESIGN01.frameX,y:H-(DESIGN01.frameY+DESIGN01.frameHeight),width:DESIGN01.frameWidth,height:DESIGN01.frameHeight,borderColor:FRAME,borderWidth:1.5});
  page.drawRectangle({x:DESIGN01.railX,y:H-DESIGN01.railBottom,width:DESIGN01.railRight-DESIGN01.railX,height:DESIGN01.railBottom-DESIGN01.headerBottom,color:GRAY});
  page.drawLine({start:{x:183.8,y:H-103.5},end:{x:586.5,y:H-103.5},thickness:0.4,color:DIVIDER});
  for(const at of DESIGN01.sidebarRules)rule(page,at);
  // The full-width header comes first in PDF text extraction.
  const headWidth=554,headX=20.7;
  const fitHeader=(value:string,maxSize:number)=> {
    let s=maxSize;
    while(s>7.4 && fonts.bold.widthOfTextAtSize(safe(value),s)>headWidth)s-=0.2;
    return s;
  };
  text(p,draft.name,headX,9.6,headWidth,fitHeader(draft.name,20),{bold:true,center:true,fill:BLUE});
  if(draft.academicHeadline)text(p,draft.academicHeadline,headX,37.9,headWidth,11.52,{center:true});
  text(p,draft.headline,headX,54.2,headWidth,fitHeader(draft.headline,12.96),{bold:true,center:true});
  const contact=[draft.location,draft.email,draft.phone].filter(Boolean).join(' | ');
  let contactSize=9.96;
  while(contactSize>8.0&&fonts.regular.widthOfTextAtSize(safe(contact),contactSize)>headWidth)contactSize-=0.2;
  text(p,contact,headX,70.0,headWidth,contactSize,{center:true});
  const links=[draft.linkedin?'LinkedIn':'',draft.github?'GitHub':''].filter(Boolean).join(' | ');
  if(links)text(p,links,headX,82.3,headWidth,9.96,{center:true});

  const sideX=13.7,sideWidth=161.6;
  const sideBlocks:{title:string;content:string[];titleTop:number;bodyTop:number;end:number;accent?:boolean;align?:boolean}[]=[
    {title:'DIPLÔMES / FORMATION',content:thierryEducation(draft).map(s=>'- '+s),titleTop:115.4,bodyTop:139,end:369.7,align:false},
    {title:'LANGUE',content:safe(draft.languages).split('|'),titleTop:389.9,bodyTop:413,end:453.7,align:true},
    {title:'LOGICIELS / OUTILS',content:[...thierryTools(draft),...thierryMethods(draft).map(s=>'Méthode : '+s)].map(s=>'- '+s),titleTop:489.9,bodyTop:514,end:600.0,align:true},
    {title:'Atouts',content:thierryAdvantages(draft).map(s=>'- '+s),titleTop:604.3,bodyTop:627,end:678.0,accent:true,align:true},
    {title:'Loisirs',content:safe(draft.interests).split('|').map(s=>'- '+s),titleTop:682.6,bodyTop:702,end:729.0,accent:true,align:true},
    {title:'Savoir-être',content:thierrySoftSkills(draft).map(s=>'- '+s),titleTop:735.3,bodyTop:760,end:829.0,accent:true,align:true},
  ];
  const paintSidebar=(fontScale:number,draw:boolean)=>{
    const q:Painter={...p,draw};
    for(const b of sideBlocks) {
      text(q,b.title,sideX,b.titleTop,sideWidth,12*fontScale,{bold:b.title.startsWith('DIPL')||b.accent,center:!!b.align,fill:b.accent?BLUE:INK});
      let cursor=b.bodyTop;
      for(const line of b.content.map(safe).filter(Boolean))cursor=text(q,line,sideX,cursor,sideWidth,9.4*fontScale,{leading:1.14})+4*fontScale;
      if(cursor>b.end) return false;
    }
    return true;
  };
  let sideScale=1;
  while(sideScale>0.68 && !paintSidebar(sideScale,false))sideScale-=0.025;
  if(!paintSidebar(sideScale,false))throw new Error('CV DESIGN 01 : la colonne gauche est trop chargée. Réduisez le texte des formations ou des outils.');
  paintSidebar(sideScale,true);

  // Main content extraction and paint: summary -> experience -> skills.
  // Every heading and field is selectable, not a rendered screenshot.
  const mainX=DESIGN01.mainX, mainW=DESIGN01.mainWidth;
  const entries=thierryEntries(draft);
  const skillGroups=thierrySkillGroups(draft);
  const paintMain=(scale:number,draw:boolean)=>{
    const q:Painter={...p,draw};
    let top=105.5;
    // The original template uses "Message..." at this location. We render
    // the actual profile under a semantic title for reliable ATS recognition.
    top=text(q,'PROFIL',mainX,top,mainW,8.3*scale,{bold:true})+3*scale;
    top=text(q,draft.summary,mainX,top,mainW,9.5*scale,{leading:1.17});
    top=Math.max(180,top+6*scale);
    top=sectionTitle(q,'EXPÉRIENCE',mainX,top,14.04*scale)+5*scale;
    for(const e of entries){
      diamond(q,mainX+12,top+0.5,9.5*scale);
      top=text(q,e.title,mainX+27,top,mainW-27,10.9*scale,{bold:true,fill:BLUE,leading:1.14})+1.3*scale;
      if(e.period)top=text(q,e.period,mainX,top,mainW,9.5*scale,{leading:1.13})+0.6*scale;
      if(e.organization)top=text(q,e.organization,mainX,top,mainW,9.5*scale,{bold:true,leading:1.13})+0.6*scale;
      if(e.mission)top=labeled(q,'Mission',e.mission,mainX,top,mainW,9.35*scale)+1*scale;
      if(e.acquired)top=labeled(q,'Expériences acquises',e.acquired,mainX,top,mainW,9.35*scale)+1*scale;
      if(e.results)top=labeled(q,'Résultats',e.results,mainX,top,mainW,9.35*scale)+1*scale;
      top+=8.5*scale;
    }
    top=Math.max(656,top+3*scale);
    if(skillGroups.length) {
      top=sectionTitle(q,'COMPÉTENCES',mainX,top,14.04*scale)+7*scale;
      for(const g of skillGroups) {
        diamond(q,mainX+12,top,9.5*scale);
        top=text(q,g.title,mainX+27,top,mainW-27,10.7*scale,{bold:true,fill:BLUE})+3*scale;
        for(const bullet of g.bullets) {
          top=text(q,'• '+bullet,mainX+28,top,mainW-28,9.1*scale,{leading:1.16})+2*scale;
        }
        top+=4*scale;
      }
    }
    return top;
  };
  let scale=1;
  while(scale>=0.76 && paintMain(scale,false)>826)scale-=0.02;
  if(paintMain(scale,false)>826) {
    throw new Error('CV DESIGN 01 : contenu trop long pour une page A4 lisible. Raccourcissez les expériences ou les compétences (aucun texte ne sera tronqué).');
  }
  paintMain(scale,true);

  doc.setTitle('CV '+safe(draft.name)+' - CV DESIGN 01');
  doc.setAuthor(safe(draft.name));
  doc.setSubject('CV professionnel compatible ATS, texte sélectionnable');
  return doc.save();
}
