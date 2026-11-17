import { describe, expect, test } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { freshCvDraft, type CvDraft } from './cvStorage';
import {
  CvLiveEditingProvider, CvLiveText, CvLiveBullets,
  updateCvLiveTarget, updateCvLiveBullets, createCvLiveEntry,
} from './cvLiveEditing';
import { ThierryCvPreview } from './ThierryCvPreview';
import { Design01Preview } from './Design01Preview';

function LiveHarness({ custom }: { custom?: 'thierry' | 'design01' }) {
  const [draft,setDraft] = useState<CvDraft>(() => {
    const d = freshCvDraft('FR','B');
    d.name = 'Candidat Test';
    d.summary = 'Mon profil initial';
    d.experience = [{id:'test',role:'Analyste',company:'Entreprise',location:'Nantes',period:'2026',bullets:['Analyse SQL']}];
    d.projects = [];
    d.certifications = [];
    return d;
  });
  return <CvLiveEditingProvider value={{
    draft,
    update:(target,value)=>setDraft(current=>updateCvLiveTarget(current,target,value)),
    updateBullets:(scope,id,values)=>setDraft(current=>updateCvLiveBullets(current,scope,id,values)),
    addEntry:scope=>setDraft(current=>createCvLiveEntry(current,scope,'new')),
  }}>
    {custom === 'thierry' ? <ThierryCvPreview draft={draft} />
      : custom === 'design01' ? <Design01Preview draft={draft} />
      : <div>
        <h1><CvLiveText value={draft.name} target={{scope:'draft',field:'name'}} label="Nom" /></h1>
        <p><CvLiveText value={draft.summary} target={{scope:'draft',field:'summary'}} label="Profil" multiline /></p>
        <CvLiveBullets scope="experience" id="test" bullets={draft.experience[0].bullets} label="Expérience" />
      </div>}
    <output data-testid="live-draft">{JSON.stringify(draft)}</output>
  </CvLiveEditingProvider>;
}

describe('édition directement dans le CV', () => {
  test('clic sur heading, saisie immédiate et sauvegarde dans le draft', async () => {
    const user = userEvent.setup();
    render(<LiveHarness />);
    await user.click(screen.getByRole('button',{name:/Nom — cliquer/}));
    const field=screen.getByRole('textbox',{name:'Nom'});
    await user.clear(field);
    await user.type(field,'Nouveau Profil{Enter}');
    expect(screen.getByRole('heading',{name:'Nouveau Profil'})).toBeTruthy();
    expect(JSON.parse(screen.getByTestId('live-draft').textContent!).name).toBe('Nouveau Profil');
  });

  test('**texte** affiche du gras et reste conservé dans les données', async () => {
    const user=userEvent.setup();
    const {container}=render(<LiveHarness />);
    await user.click(screen.getByRole('button',{name:/Profil — cliquer/}));
    const field=screen.getByRole('textbox',{name:'Profil'});
    await user.clear(field);
    await user.type(field,'Je maîtrise **Python** et SQL.');
    await user.tab();
    const strong=Array.from(container.querySelectorAll('strong')).find(node=>node.textContent==='Python');
    expect(strong).toBeDefined();
    expect(JSON.parse(screen.getByTestId('live-draft').textContent!).summary).toContain('**Python**');
  });

  test('Entrée crée une puce sur le CV et le caractère • ne duplique pas le marqueur', async () => {
    const user=userEvent.setup();
    render(<LiveHarness />);
    await user.click(screen.getByRole('button',{name:/Expérience 1 — cliquer/}));
    const first=screen.getByRole('textbox',{name:'Expérience 1'});
    await user.type(first,'{End}{Enter}');
    const draft=JSON.parse(screen.getByTestId('live-draft').textContent!);
    expect(draft.experience[0].bullets).toHaveLength(2);
    expect(draft.experience[0].bullets[0]).toBe('Analyse SQL');
    expect(screen.getByRole('button',{name:/Ajouter une puce/})).toBeTruthy();
  });

  test.each(['thierry','design01'] as const)('%s : heading editable sur le CV même', async kind => {
    const user=userEvent.setup();
    render(<LiveHarness custom={kind} />);
    const preview=screen.getByTestId(kind==='thierry'?'thierry-cv-preview':'design01-cv-preview');
    await user.click(within(preview).getByRole('button',{name:/Nom — cliquer/}));
    const input=within(preview).getByRole('textbox',{name:'Nom'});
    await user.clear(input);
    await user.type(input,'Candidat Modifié{Enter}');
    expect(JSON.parse(screen.getByTestId('live-draft').textContent!).name).toBe('Candidat Modifié');
    expect(within(preview).getByRole('heading',{name:'Candidat Modifié'})).toBeTruthy();
  });
});
