import { useMemo, useState, type ChangeEvent } from 'react';

type RecordRow = Record<string,string>;
type Parsed = {headers:string[]; rows:RecordRow[]};
const demoCsv=`Magasin,Mois,Ventes,Depenses
Nantes,Janvier,12000,8100
Nantes,Fevrier,15000,10400
Paris,Janvier,20000,14900
Paris,Fevrier,18000,13000
Lyon,Janvier,9000,6800
Lyon,Fevrier,11000,7900`;
export function parseCsv(input:string):Parsed {
  const matrix:string[][]=[];
  let field='',row:string[]=[],quoted=false;
  for(let i=0;i<input.length;i++){
    const c=input[i];
    if(c==='"') {
      if(quoted&&input[i+1]==='"'){field+='"';i++;}
      else quoted=!quoted;
    } else if(c===','&&!quoted){row.push(field);field='';}
    else if((c==='\n'||c==='\r')&&!quoted){
      if(c==='\r'&&input[i+1]==='\n')i++;
      row.push(field);field='';
      if(row.some(x=>x.trim()))matrix.push(row);
      row=[];
    } else field+=c;
  }
  if(quoted)throw Error('Guillemets non fermés dans le CSV.');
  row.push(field);
  if(row.some(x=>x.trim()))matrix.push(row);
  if(matrix.length<2)throw Error('Le CSV doit contenir une ligne d’en-têtes et au moins une ligne de données.');
  const headers=matrix[0].map(x=>x.trim());
  if(headers.some(h=>!h)||new Set(headers).size!==headers.length)throw Error('Les noms de colonnes doivent être renseignés et uniques.');
  if(matrix.some(x=>x.length!==headers.length))throw Error('Une ligne ne possède pas le même nombre de colonnes que l’en-tête.');
  return {headers,rows:matrix.slice(1).map(cols=>Object.fromEntries(headers.map((h,i)=>[h,cols[i]])))};
}
function toNumber(s:string){
  const v=s.trim().replace(/\s/g,'').replace(/€/g,'').replace(',','.');
  if(!v||!Number.isFinite(Number(v)))return null;
  return Number(v);
}
const currency=(n:number)=>n.toLocaleString('fr-FR',{maximumFractionDigits:2});
export function DataWorkbench(){
  const [text,setText]=useState(demoCsv);
  const [error,setError]=useState('');
  const [data,setData]=useState<Parsed>(()=>parseCsv(demoCsv));
  const [category,setCategory]=useState('Magasin');
  const [metric,setMetric]=useState('Ventes');
  const [filter,setFilter]=useState('');
  const numeric=useMemo(()=>data.headers.filter(h=>data.rows.some(r=>toNumber(r[h])!==null)),[data]);
  const visible=useMemo(()=>data.rows.filter(r=>Object.values(r).some(v=>v.toLocaleLowerCase('fr').includes(filter.toLocaleLowerCase('fr')))),[data,filter]);
  const missing=useMemo(()=>data.rows.reduce((n,r)=>n+data.headers.filter(h=>!r[h].trim()).length,0),[data]);
  const duplicates=useMemo(()=>{
    const seen=new Set<string>();let count=0;
    for(const r of data.rows){const key=JSON.stringify(data.headers.map(h=>r[h]));if(seen.has(key))count++;else seen.add(key);}
    return count;
  },[data]);
  const groups=useMemo(()=>{
    const sums=new Map<string,{total:number,count:number}>();
    for(const r of visible){
      const val=toNumber(r[metric]);if(val===null)continue;
      const k=r[category]||'(valeur manquante)',old=sums.get(k)||{total:0,count:0};
      sums.set(k,{total:old.total+val,count:old.count+1});
    }
    return [...sums.entries()].map(([label,v])=>({label,total:v.total,count:v.count})).sort((a,b)=>b.total-a.total).slice(0,15);
  },[visible,category,metric]);
  const max=Math.max(1,...groups.map(g=>Math.max(0,g.total)));
  function parseAndSet(input:string){
    try{
      const parsed=parseCsv(input);
      setData(parsed);
      setCategory(parsed.headers[0]);
      setMetric(parsed.headers.find(h=>parsed.rows.some(row=>toNumber(row[h])!==null))||parsed.headers[0]);
      setError('');
    }catch(e){setError(e instanceof Error?e.message:'CSV non reconnu');}
  }
  function upload(e:ChangeEvent<HTMLInputElement>){
    const f=e.target.files?.[0];if(!f)return;
    if(f.size>2_000_000){setError('La taille maximale du fichier est de 2 Mo.');return;}
    const reader=new FileReader();
    reader.onload=()=>{const value=String(reader.result||'');setText(value);parseAndSet(value);};
    reader.onerror=()=>setError('Lecture du fichier impossible.');
    reader.readAsText(f,'utf-8');e.target.value='';
  }
  function exportCsv(){
    const lines=[data.headers,...visible.map(r=>data.headers.map(h=>r[h]))];
    const csv=lines.map(row=>row.map(v=>/["\n,]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='monstage-donnees-filtrees.csv';a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  return <section className="formation-data-workbench" aria-label="Laboratoire Data Analyst">
    <div className="formation-lab__header"><div><strong>Laboratoire Data Analyst</strong><p>Importe, inspecte, filtre et agrège un vrai tableau dans MonStage.</p></div>
      <label className="formation-workbench-upload">Importer un fichier CSV<input type="file" accept=".csv,text/csv" onChange={upload}/></label>
    </div>
    <details className="formation-data-source"><summary>Voir ou modifier les données CSV</summary><textarea aria-label="Texte CSV" rows={7} value={text} onChange={e=>setText(e.target.value)}/><button className="formation-secondary-action" onClick={()=>parseAndSet(text)}>Actualiser l’analyse</button></details>
    {error&&<p role="alert">{error}</p>}
    <div className="formation-workbench-metrics">
      <span>Lignes <strong>{data.rows.length}</strong></span><span>Colonnes <strong>{data.headers.length}</strong></span>
      <span>Valeurs manquantes <strong>{missing}</strong></span><span>Doublons exacts <strong>{duplicates}</strong></span>
    </div>
    <div className="formation-workbench-controls">
      <label>Regrouper par <select aria-label="Regrouper par" value={category} onChange={e=>setCategory(e.target.value)}>{data.headers.map(h=><option key={h}>{h}</option>)}</select></label>
      <label>Somme de <select aria-label="Somme de" value={metric} onChange={e=>setMetric(e.target.value)}>{numeric.map(h=><option key={h}>{h}</option>)}</select></label>
      <label>Filtre texte <input aria-label="Filtrer les lignes" type="search" placeholder="Filtrer les données…" value={filter} onChange={e=>setFilter(e.target.value)}/></label>
    </div>
    <div className="formation-data-plot" role="img" aria-label={groups.map(g=>g.label+' : '+currency(g.total)).join(', ')}>
      <div className="formation-data-plot__axis">Total de {metric} par {category}</div>
      {groups.map(g=><div className="formation-data-bar" key={g.label}><span title={g.label}>{g.label}</span><div><i style={{width:Math.max(0,g.total)/max*100+'%'}}/></div><strong>{currency(g.total)}</strong></div>)}
      {groups.length===0&&<p>Aucune donnée numérique disponible avec ce filtre.</p>}
      <small>Valeurs agrégées sur {visible.length} lignes après filtre. Une somme négative ne produit pas de barre ; son montant reste affiché.</small>
    </div>
    <div className="formation-data-table-wrap"><table><thead><tr>{data.headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{visible.slice(0,12).map((r,i)=><tr key={i}>{data.headers.map(h=><td key={h}>{r[h]}</td>)}</tr>)}</tbody></table><small>Aperçu de {Math.min(12,visible.length)} sur {visible.length} lignes filtrées.</small></div>
    <button className="formation-secondary-action" type="button" onClick={exportCsv}>↓ Exporter les lignes filtrées (.csv)</button>
    <p className="formation-lab__hint">Données traitées localement dans ce navigateur. Les montants ne suffisent pas à établir une rentabilité sans connaître les coûts et le contexte.</p>
  </section>;
}
