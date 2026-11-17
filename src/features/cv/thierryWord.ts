import type { CvDraft } from './cvStorage';
import {
  cleanThierryText, thierryEducation, thierryEntries, thierryTools,
  thierryMethods, thierryAdvantages, thierrySoftSkills, thierrySkillGroups,
} from './thierryTemplate';

// True editable DOCX, generated entirely client-side with OpenXML and an
// uncompressed ZIP package (no browser print, HTML masquerading as Word,
// remote service or image snapshot). Word preserves the table columns.
const esc=(raw:string)=>cleanThierryText(raw).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;');
type Run={text:string;bold?:boolean;color?:string;size?:number};
function run(r:Run):string {
  if(!r.text.trim())return '';
  const font=r.size??17;
  return '<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>'
    +(r.bold?'<w:b/>':'')+(r.color?'<w:color w:val="'+r.color+'"/>':'')
    +'<w:sz w:val="'+font+'"/></w:rPr><w:t xml:space="preserve">'+esc(r.text)+'</w:t></w:r>';
}
function para(runs:Run[],opts:{after?:number;before?:number;align?:'center'|'left'|'both';indent?:number}={}):string {
  const align=opts.align??'left';
  return '<w:p><w:pPr><w:spacing w:before="'+(opts.before??0)+'" w:after="'+(opts.after??30)+'" w:line="225" w:lineRule="auto"/>'
    +(opts.indent?'<w:ind w:left="'+opts.indent+'"/>':'')
    +'<w:jc w:val="'+align+'"/></w:pPr>'+runs.map(run).join('')+'</w:p>';
}
const p=(text:string,options:Parameters<typeof para>[1]={},style:Partial<Run>={})=>
  para([{text,...style}],options);
const label=(name:string,value:string)=>para([{text:name+' : ',bold:true},{text:value}],{after:22,align:'both'});
function header(text:string,after=90):string {
  return para([{text,bold:true,size:19}],{after});
}
function sideTitle(title:string,blue=false):string {
  return para([{text:title,bold:true,color:blue?'0070C0':undefined,size:18}],{before:105,after:42,align:'center'});
}
function xmlDocument(draft:CvDraft):string {
  const left:string[]=[];
  const right:string[]=[];
  left.push(p(draft.name,{align:'center',after:85},{bold:true,size:20}));
  left.push(p(draft.headline,{align:'center',after:145},{bold:true,color:'0070C0',size:20}));
  for(const text of [draft.location,draft.email,draft.phone,draft.linkedin,draft.github])
    if(text?.trim())left.push(p(text,{align:'center',after:36},{size:15}));
  left.push(sideTitle('DIPLÔMES / FORMATION'));
  for(const entry of thierryEducation(draft))left.push(p('– '+entry,{after:96},{size:16}));
  left.push(sideTitle('LANGUE'));
  for(const entry of draft.languages.split('|').map(cleanThierryText).filter(Boolean))
    left.push(p(entry,{after:30},{size:16}));
  left.push(sideTitle('LOGICIELS / OUTILS'));
  for(const entry of thierryTools(draft))left.push(p('– '+entry,{after:26},{size:16}));
  const methods=thierryMethods(draft);
  if(methods.length){left.push(sideTitle('NORMES / MÉTHODES'));for(const e of methods)left.push(p('– '+e,{after:25},{size:16}));}
  const advantages=thierryAdvantages(draft);
  if(advantages.length){left.push(sideTitle('Atouts',true));for(const e of advantages)left.push(p('– '+e,{after:24},{size:16}));}
  if(draft.interests.trim()){left.push(sideTitle('Loisirs',true));for(const e of draft.interests.split('|').filter(Boolean))left.push(p('– '+e,{after:24},{size:16}));}
  const soft=thierrySoftSkills(draft);
  if(soft.length){left.push(sideTitle('Savoir-être',true));for(const e of soft)left.push(p('– '+e,{after:25},{size:16}));}

  right.push(header('EXPERIENCES',75));
  for(const e of thierryEntries(draft)){
    right.push(para([{text:'❖  ',color:'0070C0',bold:true,size:17},{text:e.title,color:'0070C0',bold:true,size:19}],{before:85,after:27}));
    if(e.period.trim())right.push(p(e.period,{after:15},{size:17}));
    if(e.organization.trim())right.push(p(e.organization,{after:27},{size:17,bold:true}));
    if(e.mission.trim())right.push(label('Mission',e.mission));
    if(e.results.trim())right.push(label('Résultats',e.results));
    if(e.acquired.trim())right.push(label('Expériences acquises',e.acquired));
    for(const b of e.extraBullets.filter(Boolean))right.push(p('• '+b,{indent:150,after:16},{size:16}));
  }
  right.push(header('COMPETENCES',40));
  for(const group of thierrySkillGroups(draft)){
    right.push(para([{text:'❖  ',color:'0070C0',bold:true},{text:group.title,color:'0070C0',bold:true}],{before:85,after:22}));
    for(const b of group.bullets)right.push(p('• '+b,{indent:180,after:22},{size:16}));
  }
  const borders='<w:tblBorders>'+['top','left','bottom','right','insideV'].map(edge=>
    '<w:'+edge+' w:val="single" w:sz="5" w:color="0070C0"/>').join('')+'</w:tblBorders>';
  const cell=(width:number,content:string[],gray:boolean)=>
    '<w:tc><w:tcPr><w:tcW w:w="'+width+'" w:type="dxa"/>'
    +(gray?'<w:shd w:fill="BFBFBF"/>':'')
    +'<w:tcMar><w:top w:w="68" w:type="dxa"/><w:left w:w="90" w:type="dxa"/>'
    +'<w:bottom w:w="50" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tcMar></w:tcPr>'
    +content.join('')+'</w:tc>';
  const table='<w:tbl><w:tblPr><w:tblW w:w="11560" w:type="dxa"/>'
    +'<w:tblLayout w:type="fixed"/>'+borders+'</w:tblPr>'
    +'<w:tblGrid><w:gridCol w:w="2960"/><w:gridCol w:w="8600"/></w:tblGrid>'
    +'<w:tr>'+cell(2960,left,true)+cell(8600,right,false)+'</w:tr></w:tbl>';
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
    +'<w:body>'+table
    +'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
    +'<w:pgMar w:top="110" w:right="170" w:bottom="110" w:left="170" w:header="0" w:footer="0" w:gutter="0"/>'
    +'</w:sectPr></w:body></w:document>';
}

// Minimal ZIP-store writer; produces a standards-compliant .docx package.
function crc32(bytes:Uint8Array):number {
  let c=0xffffffff;
  for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}
  return (c^0xffffffff)>>>0;
}
function zipStore(files:{name:string;content:string}[]):Uint8Array {
  const encoder=new TextEncoder();
  const sections:Uint8Array[]=[];
  const central:Uint8Array[]=[];
  let offset=0;
  function write16(v:DataView,o:number,n:number){v.setUint16(o,n,true);}
  function write32(v:DataView,o:number,n:number){v.setUint32(o,n>>>0,true);}
  for(const {name,content} of files){
    const filename=encoder.encode(name),data=encoder.encode(content);
    const crc=crc32(data);
    const local=new Uint8Array(30+filename.length);
    const lv=new DataView(local.buffer);
    write32(lv,0,0x04034b50);write16(lv,4,20);write16(lv,6,0x0800);
    write16(lv,8,0);write16(lv,10,0);write16(lv,12,0);
    write32(lv,14,crc);write32(lv,18,data.length);write32(lv,22,data.length);
    write16(lv,26,filename.length);write16(lv,28,0);
    local.set(filename,30);
    sections.push(local,data);
    const ch=new Uint8Array(46+filename.length),cv=new DataView(ch.buffer);
    write32(cv,0,0x02014b50);write16(cv,4,20);write16(cv,6,20);
    write16(cv,8,0x0800);write16(cv,10,0);write16(cv,12,0);write16(cv,14,0);
    write32(cv,16,crc);write32(cv,20,data.length);write32(cv,24,data.length);
    write16(cv,28,filename.length);write16(cv,30,0);write16(cv,32,0);
    write16(cv,34,0);write16(cv,36,0);write32(cv,38,0);write32(cv,42,offset);
    ch.set(filename,46);central.push(ch);
    offset+=local.length+data.length;
  }
  const centralSize=central.reduce((sum,x)=>sum+x.length,0);
  const end=new Uint8Array(22),ev=new DataView(end.buffer);
  write32(ev,0,0x06054b50);write16(ev,4,0);write16(ev,6,0);
  write16(ev,8,files.length);write16(ev,10,files.length);
  write32(ev,12,centralSize);write32(ev,16,offset);write16(ev,20,0);
  const total=offset+centralSize+end.length;
  const out=new Uint8Array(total);let pos=0;
  for(const part of [...sections,...central,end]){out.set(part,pos);pos+=part.length;}
  return out;
}
export function buildThierryWordBytes(draft:CvDraft):Uint8Array {
  return zipStore([
    {name:'[Content_Types].xml',content:'<?xml version="1.0" encoding="UTF-8"?>'
      +'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      +'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
      +'<Default Extension="xml" ContentType="application/xml"/>'
      +'<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
      +'</Types>'},
    {name:'_rels/.rels',content:'<?xml version="1.0" encoding="UTF-8"?>'
      +'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      +'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
      +'</Relationships>'},
    {name:'word/document.xml',content:xmlDocument(draft)},
  ]);
}
