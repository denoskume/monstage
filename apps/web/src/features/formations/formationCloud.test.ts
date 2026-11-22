import { afterEach,describe,expect,it,vi } from 'vitest';
import { formationsCloudRequest } from './formationCloud';
import { ApiAuthError } from '../../api/authClient';
vi.mock('../../api/authClient',()=>({
  apiBaseUrl:()=> 'https://gateway.example.test',
  ApiAuthError: class ApiAuthError extends Error { status:number; constructor(status:number){super('Unauthorized');this.status=status;} }
}));
const backup={format:'monstage-formations-v3',date:'2026-11-19',completed:['data-analyst:sql'],notes:{},topics:{'data-analyst:sql':[1]},codeDrafts:{}};
afterEach(()=>vi.unstubAllGlobals());
describe('authenticated formation cloud sync',()=>{
  it('refuses requests without an authenticated user token',async()=>{
    await expect(formationsCloudRequest(null,{action:'load'})).rejects.toBeInstanceOf(ApiAuthError);
  });
  it('loads a strictly validated backup and revision',async()=>{
    const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify({state:backup,revision:'123'}),{status:200}));
    vi.stubGlobal('fetch',fetcher);
    const loaded=await formationsCloudRequest('user-token',{action:'load'});
    expect(loaded.state?.completed).toEqual(['data-analyst:sql']);
    expect(loaded.revision).toBe('123');
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({action:'load',course:'formations'});
  });
  it('rejects conflicting saves without treating them as successes',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({error:'Conflit'}),{status:409})));
    await expect(formationsCloudRequest('user-token',{action:'save',revision:'stale',state:backup as never})).rejects.toThrow('Conflit');
  });
});
