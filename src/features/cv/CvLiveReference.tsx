import type { CvDraft } from './cvStorage';
import type { ThierryEntry } from './thierryTemplate';
import { CvLiveBullets, CvLiveText, CvLiveAddEntry, useCvLiveEditing, CvLiveDraftLine } from './cvLiveEditing';

export function CvLiveReferenceEntry({ draft, entry, kind }: {
  draft: CvDraft; entry: ThierryEntry; kind: 'thierry' | 'design01';
}) {
  const project = draft.projects.find(item => item.id === entry.id);
  const exp = draft.experience.find(item => item.id === entry.id);
  const scope = project ? 'projects' : 'experience';
  const item = project ?? exp;
  if (!item) return null;
  const titleField = project ? 'name' : 'role';
  const titleClass = kind === 'thierry' ? 'thierry-entry-title' : 'design01-entry-title';
  const wrap = kind === 'thierry' ? 'thierry-entry' : 'design01-entry';
  return <div className={wrap}>
    <div className={titleClass}>
      <span className={kind === 'thierry' ? 'thierry-diamond' : 'design01-diamond'} aria-hidden="true">{kind === 'thierry' ? '❖' : ''}</span>
      <strong><CvLiveText value={entry.title} target={{scope,id:entry.id,field:titleField}} placeholder="Intitulé du poste / projet" /></strong>
    </div>
    <p className={kind === 'thierry' ? 'thierry-entry-period' : 'design01-date'}>
      <CvLiveText value={entry.period} target={{scope,id:entry.id,field:'period'}} placeholder="Période" />
    </p>
    <p className={kind === 'thierry' ? 'thierry-entry-org' : ''}>
      {exp
        ? <strong><CvLiveText value={exp.company} target={{scope,id:entry.id,field:'company'}} placeholder="Entreprise" /> — <CvLiveText value={exp.location} target={{scope,id:entry.id,field:'location'}} placeholder="Localisation" /></strong>
        : <strong><CvLiveText value={entry.organization} target={{scope:'projects',id:entry.id,field:'description'}} placeholder="Contexte du projet" multiline /></strong>}
    </p>
    {(['mission','results','acquired'] as const).map(key => {
      const label = key === 'mission' ? 'Mission' : key === 'acquired' ? 'Expériences acquises' : 'Résultats';
      return <p key={key} className="cv-live-reference-narrative">
        <strong>{label} : </strong>
        <CvLiveText value={entry[key]} target={{scope,id:entry.id,field:key}} placeholder={'+ ' + label} multiline />
      </p>;
    })}
    <details className="cv-live-reference-bullet-details">
      <summary>Éditer les puces</summary>
      <CvLiveBullets scope={scope} id={entry.id} bullets={item.bullets} label={entry.title} />
    </details>
  </div>;
}

export function CvLiveReferenceEducation({ draft }: {draft:CvDraft}) {
  return <>
    {draft.education.map(item => <p key={item.id} className="cv-live-reference-education">
      – <CvLiveText value={item.period} target={{scope:'education',id:item.id,field:'period'}} placeholder="Année" />
      {' : '}<CvLiveText value={item.degree} target={{scope:'education',id:item.id,field:'degree'}} placeholder="Diplôme" />
      {' — '}<CvLiveText value={item.school} target={{scope:'education',id:item.id,field:'school'}} placeholder="Établissement" />
    </p>)}
    {(draft.certifications ?? []).filter(item => item.visible !== false).map(item => <p key={item.id}>
      – <CvLiveText value={item.date} target={{scope:'certifications',id:item.id,field:'date'}} placeholder="Date" />
      {' : '}<CvLiveText value={item.title} target={{scope:'certifications',id:item.id,field:'title'}} placeholder="Certification" />
      {' — '}<CvLiveText value={item.issuer} target={{scope:'certifications',id:item.id,field:'issuer'}} placeholder="Organisme" />
    </p>)}
    <CvLiveAddEntry scope="education" label="Formation" />
    <CvLiveAddEntry scope="certifications" label="Certification" />
  </>;
}

export function CvLiveReferenceSkills({draft,kind}: {draft:CvDraft;kind:'thierry'|'design01'}) {
  const ctx = useCvLiveEditing();
  const lines = draft.skills.split('\n').filter(Boolean);
  const name = kind === 'thierry' ? 'thierry' : 'design01';
  return <>
    {lines.map((line,i) => {
      const richCategory=line.match(/^\*\*(.+?):\*\*\s*(.*)$/);
      const separator=line.indexOf(':');
      const title=richCategory ? richCategory[1].trim() : separator<0?line:line.slice(0,separator).trim();
      const detail=richCategory ? richCategory[2].trim() : separator<0?'':line.slice(separator+1).trim();
      const changePart=(part:'title'|'detail', next:string)=>{
        if(!ctx) return;
        const updated=ctx.draft.skills.split('\n');
        const newTitle=part==='title'?next:title;
        const newDetail=part==='detail'?next:detail;
        updated[i]=richCategory ? '**'+newTitle+':** '+newDetail : newTitle+': '+newDetail;
        ctx.update({scope:'draft',field:'skills'},updated.join('\n'));
      };
      return <div className={name + '-skill-group'} key={i}>
        <p className={name === 'thierry' ? 'thierry-skill' : 'design01-skill-title'}>
          {name === 'thierry' ? '❖  ' : <span className="design01-diamond" aria-hidden="true" />}
          <CvLiveText value={title} onChange={next=>changePart('title',next)} label="Catégorie de compétences" />
        </p>
        {detail ? <ul><li><CvLiveText value={detail} onChange={next=>changePart('detail',next)} label="Compétences détaillées" multiline /></li></ul>
          : <ul><li><CvLiveText value="" onChange={next=>changePart('detail',next)} placeholder="Ajouter des compétences" /></li></ul>}
      </div>;
    })}
    {ctx && <button className="cv-live-add cv-live-add--entry" type="button" onClick={() =>
      ctx.update({scope:'draft',field:'skills'},ctx.draft.skills + '\nNouvelle catégorie: Compétences')
    }>+ Compétence</button>}
  </>;
}

export function CvLiveReferenceLines({field,value,placeholder}: {
  field:'languages'|'interests'|'thierryTools'|'thierryStandards'|'thierryAdvantages'|'thierrySoftSkills';
  value:string;placeholder?:string;
}) {
  return <CvLiveText value={value} target={{scope:'draft',field}} placeholder={placeholder ?? 'Modifier'} multiline />;
}
