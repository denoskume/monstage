import { describe,expect,it } from 'vitest';
import { parseCsv } from './DataWorkbench';
import { processImage } from './ImageWorkbench';
import { validateFormationBackup } from './formationBackup';
import { dataAnalystTrack } from './dataAnalystTrack';
import { imageProcessingTrack } from './imageProcessingTrack';
import { computerVisionTrack } from './computerVisionTrack';
describe('Data workbench',()=>{
  it('parses quoted comma fields and escaped quotes',()=>{
    const data=parseCsv('Name,Value\n"Paris, Nord",100\n"dit ""oui""",200\n');
    expect(data.rows).toHaveLength(2);
    expect(data.rows[0].Name).toBe('Paris, Nord');
    expect(data.rows[1].Name).toBe('dit "oui"');
  });
  it('rejects malformed rows and incomplete quoted fields',()=>{
    expect(()=>parseCsv('a,b\n1\n')).toThrow();
    expect(()=>parseCsv('a,b\n"not closed,1')).toThrow();
  });
});
describe('Image processing calculations',()=>{
  const image={width:3,height:3,pixels:new Uint8ClampedArray([0,0,0,0,255,0,0,0,0])};
  it('keeps output dimensions and thresholds consistently',()=>{
    expect(processImage(image,'threshold',128)).toEqual(image.pixels);
    expect(processImage(image,'invert',128)[4]).toBe(0);
    expect(processImage(image,'gaussian',128)[4]).toBe(64);
    expect(processImage(image,'median',128)[4]).toBe(0);
  });
  it('preserves an all-zero image under morphology',()=>{
    const blank={width:4,height:4,pixels:new Uint8ClampedArray(16)};
    expect(processImage(blank,'morphology',1).every(v=>v===0)).toBe(true);
  });
});
describe('Formation learning assets and recoverability',()=>{
  it('provides 205 individually navigable learning topics',()=>{
    const tracks=[dataAnalystTrack,imageProcessingTrack,computerVisionTrack];
    expect(tracks.reduce((n,t)=>n+t.modules.reduce((k,m)=>k+m.points.length,0),0)).toBe(205);
    expect(tracks.every(t=>t.modules.every(m=>m.points.length>=5))).toBe(true);
  });
  it('accepts a valid progress backup and rejects unsafe structures',()=>{
    const backup={format:'monstage-formations-v3',date:'2026-11-19',completed:['traitement-images:images-pixels'],notes:{},topics:{'traitement-images:images-pixels':[0,1]},codeDrafts:{}};
    expect(validateFormationBackup(backup).topics['traitement-images:images-pixels']).toEqual([0,1]);
    expect(()=>validateFormationBackup({...backup,topics:{'a':[999]}})).toThrow();
    expect(()=>validateFormationBackup({...backup,format:'unknown'})).toThrow();
  });
});
