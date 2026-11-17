import type { CvDraft } from './cvStorage';
import {
  cleanThierryText, thierryEducation, thierryEntries, thierryTools,
  thierryMethods, thierryAdvantages, thierrySoftSkills, thierrySkillGroups,
  type ThierryEntry,
} from './thierryTemplate';
import './design01.css';

function ReferenceEntry({ entry }: { entry: ThierryEntry }) {
  return <div className="design01-entry">
    <div className="design01-entry-title"><span className="design01-diamond" aria-hidden="true" />{entry.title}</div>
    {entry.period && <p className="design01-date">{entry.period}</p>}
    {entry.organization && <p><strong>{entry.organization}</strong></p>}
    {entry.mission && <p><strong>Mission :</strong> {entry.mission}</p>}
    {entry.acquired && <p><strong>Expériences acquises :</strong> {entry.acquired}</p>}
    {entry.results && <p><strong>Résultats :</strong> {entry.results}</p>}
  </div>;
}

function SideSection({ title, content, className = '' }: {title:string;content:string[];className?:string}) {
  return <section className={'design01-side-section '+className}>
    <h2>{title}</h2>
    <div className="design01-side-content">
      {content.filter(Boolean).map((line,index)=><p key={index}>{line}</p>)}
    </div>
  </section>;
}

export function Design01Preview({ draft }: {draft:CvDraft}) {
  const skills = thierrySkillGroups(draft);
  const contacts = [draft.location, draft.email, draft.phone].filter(Boolean);
  return <div className="design01-page" data-testid="design01-cv-preview">
    <header className="design01-header">
      <h1>{cleanThierryText(draft.name)}</h1>
      {draft.academicHeadline && <p className="design01-academic">{cleanThierryText(draft.academicHeadline)}</p>}
      <p className="design01-headline">{cleanThierryText(draft.headline)}</p>
      <p>{contacts.map(cleanThierryText).join(' | ')}</p>
      {(draft.linkedin || draft.github) && <p>{[draft.linkedin ? 'LinkedIn' : '', draft.github ? 'GitHub' : ''].filter(Boolean).join(' | ')}</p>}
    </header>
    <div className="design01-columns">
      <aside className="design01-sidebar">
        <SideSection title="DIPLÔMES / FORMATION" className="design01-formation" content={thierryEducation(draft).map(s=>'– '+s)} />
        <SideSection title="LANGUE" className="design01-language" content={cleanThierryText(draft.languages).split('|')} />
        <SideSection title="LOGICIELS / OUTILS" className="design01-tools" content={thierryTools(draft).map(s=>'– '+s)} />
        <SideSection title="Atouts" className="design01-atouts" content={thierryAdvantages(draft).map(s=>'– '+s)} />
        <SideSection title="Loisirs" className="design01-hobbies" content={cleanThierryText(draft.interests).split('|').map(s=>'– '+s)} />
        <SideSection title="Savoir-être" className="design01-softskills" content={thierrySoftSkills(draft).map(s=>'– '+s)} />
        {thierryMethods(draft).length>0 && <section className="design01-extra-methods" aria-label="Méthodes complémentaires">{thierryMethods(draft).join(' · ')}</section>}
      </aside>
      <main className="design01-main">
        <section className="design01-summary">
          <h2>PROFIL</h2>
          <p>{cleanThierryText(draft.summary)}</p>
        </section>
        <section className="design01-experiences">
          <h2>EXPÉRIENCE</h2>
          <div className="design01-list">
            {thierryEntries(draft).map(entry=><ReferenceEntry entry={entry} key={entry.id}/>)}
          </div>
        </section>
        <section className="design01-skills">
          <h2>COMPÉTENCES</h2>
          {skills.map((group,i)=><div className="design01-skill-group" key={i}>
            <p className="design01-skill-title"><span className="design01-diamond" aria-hidden="true" />{group.title}</p>
            {group.bullets.length ? <ul>{group.bullets.map((b,j)=><li key={j}>{b}</li>)}</ul> : null}
          </div>)}
        </section>
      </main>
    </div>
  </div>;
}
