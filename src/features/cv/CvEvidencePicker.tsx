import { useEffect, useMemo, useState } from 'react';
import type { CvDraft, CvLanguage } from './cvStorage';
import { certificateCatalog, curricula, cvPresets, cvProjectLibrary, projectKindLabels, selectedCertifications, selectedProjects, type ProjectKind } from './cvEvidenceCatalog';

type PresetName = keyof typeof cvPresets;
type PickerFilter = 'all' | ProjectKind;
interface Props { draft: CvDraft; onChange: (draft:CvDraft) => void; offerId?: string | null }

function coursesFromDraft(draft:CvDraft) {
  return Object.fromEntries(curricula.map(program => [
    program.educationId,
    (draft.education.find(entry => entry.id === program.educationId)?.keyCourses || '')
      .split(/\s*[·•]\s*/).map(course => course.trim()).filter(Boolean),
  ])) as Record<string,string[]>;
}
export function CvEvidencePicker({ draft, onChange, offerId }: Props) {
  const language: CvLanguage = draft.language;
  const [activeFilter, setActiveFilter] = useState<PickerFilter>('all');
  const [search, setSearch] = useState('');
  const [projectIds, setProjectIds] = useState<string[]>(() => draft.projects.map(p => p.id));
  const [certificateIds, setCertificateIds] = useState<string[]>(() => (draft.certifications || []).map(c => c.id));
  const [courseSelections, setCourseSelections] = useState<Record<string,string[]>>(() => coursesFromDraft(draft));
  const [message, setMessage] = useState('');
  useEffect(() => {
    setProjectIds(draft.projects.map(p => p.id));
    setCertificateIds((draft.certifications || []).map(c => c.id));
    setCourseSelections(coursesFromDraft(draft));
    setMessage('');
  }, [draft.language, offerId]);

  const filtered = useMemo(() => {
    const query = search.toLocaleLowerCase('fr-FR').trim();
    return cvProjectLibrary.filter(entry =>
      (activeFilter === 'all' || entry.kind === activeFilter)
      && (!query || [entry.cv[language].name, entry.tags.join(' '), entry.kind].join(' ').toLocaleLowerCase('fr-FR').includes(query))
    );
  }, [activeFilter, search, language]);

  function usePreset(preset:PresetName) {
    const selected = cvPresets[preset];
    setProjectIds([...selected.projects]);
    setCertificateIds([...selected.certificates]);
    setCourseSelections({ ecn:[...selected.ecn], kju:[...selected.kju] });
    setMessage(language === 'FR' ? 'Sélection proposée. Clique sur « Appliquer au CV » pour l’utiliser.' : 'Suggested selection. Click Apply to CV to use it.');
  }
  function toggleProject(id:string, checked:boolean) {
    setMessage('');
    setProjectIds(existing => checked ? existing.includes(id) ? existing : existing.length >= 3 ? existing : [...existing,id] : existing.filter(x=>x!==id));
  }
  function toggleCourse(school:string, course:string, checked:boolean) {
    setMessage('');
    setCourseSelections(existing => ({
      ...existing, [school]: checked
        ? [...new Set([...(existing[school]||[]),course])]
        : (existing[school]||[]).filter(item=>item!==course),
    }));
  }
  function toggleCertificate(id:string, checked:boolean) {
    setMessage('');
    setCertificateIds(existing => checked ? [...new Set([...existing,id])] : existing.filter(item=>item!==id));
  }

  function apply() {
    const chosen = selectedProjects(projectIds, language);
    const unknownPreviouslySelected = draft.projects.filter(p => !cvProjectLibrary.some(e=>e.id===p.id));
    const projects = chosen.length ? chosen : unknownPreviouslySelected.slice(0,3);
    const mapped = draft.education.map(education => ({
      ...education,
      keyCourses: (courseSelections[education.id] || []).join(' · '),
    }));
    const certifications = selectedCertifications(certificateIds);
    const sectionOrder = draft.sectionOrder.includes('certifications')
      ? draft.sectionOrder
      : [...draft.sectionOrder.slice(0, draft.sectionOrder.indexOf('languages') >= 0 ? draft.sectionOrder.indexOf('languages') : draft.sectionOrder.length),
         'certifications' as const,
         ...draft.sectionOrder.slice(draft.sectionOrder.indexOf('languages') >= 0 ? draft.sectionOrder.indexOf('languages') : draft.sectionOrder.length)];
    onChange({ ...draft, education: mapped, projects, certifications, sectionOrder });
    setMessage(language === 'FR' ? 'Sélection appliquée au brouillon. Clique sur Enregistrer pour la conserver.' : 'Selection added to your draft. Click Save to keep it.');
  }

  const types:PickerFilter[]=['all','academic-m1','academic-coursework','personal','case-study'];
  return (
    <section className="cv-editor-section" aria-label="Bibliothèque de preuves du CV">
      <div className="cv-editor-section__header">
        <h2>{language === 'FR' ? 'Bibliothèque du parcours · Sélection rapide' : 'Evidence library · Quick selection'}</h2>
      </div>
      <p className="cv-editor-hint">{language === 'FR'
        ? 'Tous les cours, projets et certificats sont conservés ici. Seuls les éléments cochés passent dans le CV. Les données du master et des autres offres restent intactes.'
        : 'All courses, projects and credentials stay in this library. Only selected items go into the CV. Other application drafts remain untouched.'}</p>
      <div className="cv-inline-actions" style={{flexWrap:'wrap', gap:6}}>
        <button className="button button--secondary" type="button" onClick={() => usePreset('A')}>Plan A · Vision</button>
        <button className="button button--secondary" type="button" onClick={() => usePreset('B')}>Plan B · Data</button>
        <button className="button button--secondary" type="button" onClick={() => usePreset('EDF')}>EDF · Prévision</button>
      </div>
      <h3>{language === 'FR' ? 'Cours pertinents (choix libre)' : 'Relevant courses (select freely)'}</h3>
      {curricula.map(school => (
        <details key={school.educationId} className="cv-editor-block">
          <summary><strong>{school.educationId === 'ecn' ? 'Centrale Nantes · MSc (2025–2027)' : 'Kristu Jayanti · BSc (2021–2025)'}</strong> — {(courseSelections[school.educationId]||[]).length} {language === 'FR' ? 'sélectionnés' : 'selected'}</summary>
          <p style={{fontSize:12,opacity:.8,marginTop:7}}>{school.description[language]}</p>
          {school.groups.map(group => (
            <div key={group.title} style={{paddingTop:8}}>
              <strong>{group.title}</strong>
              {group.courses.map(course => <label key={course} style={{display:'flex',gap:7,alignItems:'flex-start',padding:'3px 0'}}>
                <input style={{width:'auto',marginTop:3}} type="checkbox" checked={(courseSelections[school.educationId]||[]).includes(course)}
                  onChange={e=>toggleCourse(school.educationId,course,e.target.checked)}/>
                <span>{course}</span>
              </label>)}
            </div>
          ))}
        </details>
      ))}
      <h3>{language === 'FR' ? 'Projets et études de cas' : 'Projects and case studies'} ({projectIds.length}/3)</h3>
      <input aria-label={language === 'FR' ? 'Rechercher un projet' : 'Search projects'} placeholder={language === 'FR' ? 'Rechercher : Python, régression, vision, SQL…' : 'Search projects…'} value={search} onChange={e=>setSearch(e.target.value)}/>
      <div className="cv-inline-actions" style={{flexWrap:'wrap',gap:5,padding:'7px 0'}}>
        {types.map(id=><button key={id} type="button" className={'button '+(activeFilter===id?'button--primary':'button--secondary')} onClick={()=>setActiveFilter(id)}>{id==='all' ? language==='FR'?'Tous':'All' : projectKindLabels[id][language]}</button>)}
      </div>
      <div style={{maxHeight:290,overflow:'auto',border:'1px solid var(--border)',borderRadius:8,padding:'5px 10px'}}>
        {filtered.map(entry => {
          const chosen=projectIds.includes(entry.id);
          return <div key={entry.id} style={{padding:'8px 2px',borderBottom:'1px solid var(--border)'}}>
            <label style={{display:'flex',gap:8,alignItems:'flex-start'}}>
              <input type="checkbox" style={{width:'auto',marginTop:4}} checked={chosen} disabled={!chosen && projectIds.length>=3} onChange={e=>toggleProject(entry.id,e.target.checked)}/>
              <span><strong>{entry.cv[language].name}</strong><span style={{display:'block',fontSize:12,opacity:.75}}>{projectKindLabels[entry.kind][language]} · {entry.cv[language].period}</span></span>
            </label>
            {entry.sourceUrl ? <a href={entry.sourceUrl} target="_blank" rel="noreferrer" style={{fontSize:12,textDecoration:'underline',paddingLeft:23}}>GitHub ↗</a> : <span style={{fontSize:12,opacity:.7,paddingLeft:23}}>{language==='FR'?'Exercice simulé':'Simulated exercise'}</span>}
          </div>;
        })}
      </div>
      <h3>{language === 'FR' ? 'Certifications et formations' : 'Certifications and training'}</h3>
      {certificateCatalog.map(cert => (
        <label key={cert.id} style={{display:'flex',gap:8,padding:'4px 0',alignItems:'flex-start'}}>
          <input type="checkbox" style={{width:'auto',marginTop:4}} checked={certificateIds.includes(cert.id)} onChange={e=>toggleCertificate(cert.id,e.target.checked)}/>
          <span><strong>{cert.title}</strong> {cert.issuer ? '· '+cert.issuer : ''} {cert.date ? '· '+cert.date : ''}
            <small style={{display:'block',opacity:.7}}>{cert.category==='training' ? (language==='FR'?'Formation déclarée, émetteur à confirmer':'Reported training, issuer to confirm') : cert.notes}</small>
          </span>
        </label>
      ))}
      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginTop:10}}>
        <button type="button" className="button button--primary" onClick={apply}>{language==='FR'?'Appliquer au CV':'Apply to CV'}</button>
        <span role="status" style={{fontSize:12}}>{message}</span>
      </div>
    </section>
  );
}
