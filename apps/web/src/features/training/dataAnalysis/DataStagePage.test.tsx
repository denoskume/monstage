import { render,screen,waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach,expect,test,vi } from 'vitest';
import { AuthContext,type AuthContextValue } from '../../../auth/useAuth';
import { trainingRequest } from '../trainingApi';
import DataStagePage from './DataStagePage';
vi.mock('../trainingApi',()=>({trainingRequest:vi.fn()}));
const auth={token:'test',user:{email:'owner@example.test'},invalidateSession:vi.fn()} as unknown as AuthContextValue;
beforeEach(()=>{localStorage.clear();vi.mocked(trainingRequest).mockReset().mockResolvedValue({state:null,revision:null});});
function mount(){return render(<MemoryRouter><AuthContext.Provider value={auth}><DataStagePage/></AuthContext.Provider></MemoryRouter>);}
test('opens a project request and saves a Data Analysis task without touching CV state',async()=>{
 const user=userEvent.setup();mount();
 await screen.findByText('Dossier Data Analysis chargé');
 expect(trainingRequest).toHaveBeenCalledWith('test',{action:'load',course:'data-analysis'});
 expect(screen.getByRole('heading',{name:'Piloter l’activité maintenance'})).toBeInTheDocument();
 await user.click(screen.getByRole('button',{name:'Prendre en charge la demande'}));
 expect(screen.getByRole('heading',{name:'Comment on s’y prend'})).toBeInTheDocument();
 await user.click(screen.getByLabelText('Mon livrable est prêt à être présenté pour revue.'));
 await user.type(screen.getByLabelText('Ce que j’ai fait et pourquoi'),'J’ai reformulé la demande et identifié le périmètre.');
 await user.click(screen.getAllByRole('button',{name:'Enregistrer le dossier'})[0]);
 await waitFor(()=>expect(trainingRequest).toHaveBeenLastCalledWith('test',expect.objectContaining({action:'save',course:'data-analysis',state:expect.objectContaining({course:'data-analysis',tasks:{a01:true}})})));
});
test('keeps saving disabled when the project backend cannot be read',async()=>{
 vi.mocked(trainingRequest).mockRejectedValue(new Error('Lecture impossible'));mount();
 await screen.findByText('Lecture impossible');
 expect(screen.getByRole('button',{name:'Enregistrer le dossier'})).toBeDisabled();
});
