import type { ReactNode } from 'react';
import type { CvDraft } from './cvStorage';
import { thierryEntries, thierryTools } from './thierryTemplate';
import { CvLiveText, CvLiveAddEntry } from './cvLiveEditing';
import {
  CvLiveReferenceEntry, CvLiveReferenceEducation, CvLiveReferenceSkills, CvLiveReferenceLines,
} from './CvLiveReference';
import './thierryCv.css';

function SideBlock({ heading, children, className = '' }: {heading:string;children:ReactNode;className?:string}) {
  return <section className={'thierry-side-block ' + className}>
    <h2>{heading}</h2>
    <div className="thierry-side-line">{children}</div>
  </section>;
}

export function ThierryCvPreview({ draft }: { draft: CvDraft }) {
  return <div className="thierry-page" data-testid="thierry-cv-preview">
    <aside className="thierry-rail">
      <div className="thierry-identity">
        <h1><CvLiveText value={draft.name} target={{scope:'draft',field:'name'}} label="Nom" /></h1>
        <p><CvLiveText value={draft.headline} target={{scope:'draft',field:'headline'}} label="Titre du CV" multiline /></p>
      </div>
      <div className="thierry-location"><p>
        <CvLiveText value={draft.location} target={{scope:'draft',field:'location'}} placeholder="Localisation" />
      </p></div>
      <div className="thierry-contact">
        <p><CvLiveText value={draft.email} target={{scope:'draft',field:'email'}} placeholder="Email" /></p>
        <p><CvLiveText value={draft.phone} target={{scope:'draft',field:'phone'}} placeholder="Téléphone" /></p>
        <p><CvLiveText value={draft.thierryAge ?? ''} target={{scope:'draft',field:'thierryAge'}} placeholder="Âge (facultatif)" /></p>
      </div>
      <SideBlock heading="DIPLÔMES / FORMATION" className="thierry-education">
        <CvLiveReferenceEducation draft={draft} />
      </SideBlock>
      <SideBlock heading="LANGUE"><CvLiveReferenceLines field="languages" value={draft.languages} /></SideBlock>
      <SideBlock heading="LOGICIELS / OUTILS">
        <CvLiveReferenceLines field="thierryTools" value={draft.thierryTools?.trim() ? draft.thierryTools : thierryTools(draft).join('\n')} placeholder="Outils et logiciels" />
      </SideBlock>
      <SideBlock heading="NORMES">
        <CvLiveReferenceLines field="thierryStandards" value={draft.thierryStandards ?? ''} placeholder="Normes / méthodes" />
      </SideBlock>
      <SideBlock heading="Atouts" className="thierry-accent">
        <CvLiveReferenceLines field="thierryAdvantages" value={draft.thierryAdvantages ?? ''} placeholder="Atouts" />
      </SideBlock>
      <SideBlock heading="Loisirs" className="thierry-accent">
        <CvLiveReferenceLines field="interests" value={draft.interests} placeholder="Loisirs" />
      </SideBlock>
      <SideBlock heading="Savoir-être" className="thierry-accent">
        <CvLiveReferenceLines field="thierrySoftSkills" value={draft.thierrySoftSkills ?? ''} placeholder="Savoir-être" />
      </SideBlock>
    </aside>
    <main className="thierry-main">
      {draft.thierryShowProfile !== false ? <section className="thierry-summary">
        <h2>PROFIL</h2><p><CvLiveText value={draft.summary} target={{scope:'draft',field:'summary'}} placeholder="Profil" multiline /></p>
      </section> : null}
      <section className="thierry-experience">
        <h2>EXPERIENCES</h2>
        {thierryEntries(draft).map(entry => <CvLiveReferenceEntry draft={draft} kind="thierry" entry={entry} key={entry.id} />)}
        <CvLiveAddEntry scope="experience" label="Expérience" />
        <CvLiveAddEntry scope="projects" label="Projet" />
      </section>
      <section className="thierry-competences">
        <h2>COMPETENCES</h2>
        <CvLiveReferenceSkills draft={draft} kind="thierry" />
      </section>
    </main>
  </div>;
}
