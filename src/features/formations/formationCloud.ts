import { apiBaseUrl, ApiAuthError } from '../../api/authClient';
import { validateFormationBackup, type FormationBackup } from './formationBackup';

export async function formationsCloudRequest(token:string|null, body:{action:'load'|'save';revision?:string|null;state?:FormationBackup}):Promise<{state:FormationBackup|null;revision:string|null}> {
  if(!token)throw new ApiAuthError(401);
  const response=await fetch(apiBaseUrl()+'/api/training',{
    method:'POST',
    headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
    cache:'no-store',
    body:JSON.stringify({...body,course:'formations'})
  });
  if(response.status===401||response.status===403)throw new ApiAuthError(response.status);
  const result=await response.json() as {state?:unknown;revision?:string|null;error?:string};
  if(!response.ok)throw new Error(result.error||'Espace privé indisponible.');
  return {
    state:result.state?validateFormationBackup(result.state):null,
    revision:result.revision??null
  };
}
