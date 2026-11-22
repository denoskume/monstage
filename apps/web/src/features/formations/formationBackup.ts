export type FormationBackup = {
  format: 'monstage-formations-v3';
  date: string;
  completed: string[];
  notes: Record<string,string>;
  topics: Record<string,number[]>;
  codeDrafts: Record<string,string>;
};

function dictionary(input:unknown, maxLength:number) {
  if(!input || typeof input!=='object' || Array.isArray(input))throw Error('Le format des notes ou du code est invalide.');
  const result:Record<string,string>={};
  for(const [key,value] of Object.entries(input)){
    if(key.length>150||typeof value!=='string'||value.length>maxLength)throw Error('Une entrée sauvegardée dépasse les limites autorisées.');
    result[key]=value;
  }
  return result;
}
export function validateFormationBackup(input:unknown):FormationBackup {
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Le fichier ne contient pas de sauvegarde MonStage.');
  const data=input as Record<string,unknown>;
  if(data.format!=='monstage-formations-v3')throw Error('Version de sauvegarde non reconnue.');
  if(!Array.isArray(data.completed)||data.completed.length>200||!data.completed.every(x=>typeof x==='string'&&x.length<=150))throw Error('Liste de modules invalide.');
  if(!data.topics||typeof data.topics!=='object'||Array.isArray(data.topics))throw Error('Progression des leçons invalide.');
  const topics:Record<string,number[]>={};
  for(const [key,arr] of Object.entries(data.topics)){
    if(key.length>150||!Array.isArray(arr)||arr.length>50||!arr.every(x=>Number.isInteger(x)&&x>=0&&x<50))throw Error('Progression des leçons invalide.');
    topics[key]=[...new Set(arr)];
  }
  return {
    format:'monstage-formations-v3',
    date:typeof data.date==='string'?data.date:'',
    completed:[...new Set(data.completed)],
    notes:dictionary(data.notes,10000),
    topics,
    codeDrafts:dictionary(data.codeDrafts,50000)
  };
}
