/** Geographic reference points for plotting named French cities only.
 * Coordinates are approximate city centres. No inferred location for unknown cities.
 * Simplified outline is decorative; pins use the same longitude/latitude projection.
 */
const cityCenters: Record<string, [number, number]> = {
  paris:[2.35,48.86], nantes:[-1.55,47.22], lille:[3.06,50.63],
  lyon:[4.84,45.76], villeurbanne:[4.88,45.77], toulouse:[1.44,43.60],
  blagnac:[1.39,43.64], bordeaux:[-0.58,44.84], rennes:[-1.68,48.11],
  grenoble:[5.72,45.19], marseille:[5.37,43.30], nice:[7.26,43.70],
  cannes:[7.02,43.55], sophiaantipolis:[7.05,43.62], valbonne:[7.01,43.64],
  tarnos:[-1.46,43.54], saintdenis:[2.36,48.94], saintouen:[2.33,48.91],
  courbevoie:[2.25,48.90], puteaux:[2.24,48.88], nanterre:[2.21,48.89],
  massy:[2.27,48.73], versailles:[2.13,48.80], palaiseau:[2.25,48.72],
  velizyvillacoublay:[2.18,48.78], boulognebillancourt:[2.24,48.84],
  meudon:[2.23,48.82], issylesmoulineaux:[2.27,48.82], creteil:[2.46,48.79],
  carquefou:[-1.49,47.30], saintnazaire:[-2.21,47.27], chambery:[5.92,45.56],
  annecy:[6.13,45.90], angers:[-0.55,47.47], tours:[0.69,47.39],
  reims:[4.03,49.26], dijon:[5.04,47.32], metz:[6.18,49.12],
  strasbourg:[7.75,48.58], colmar:[7.36,48.08], clermontferrand:[3.08,45.78],
  vannes:[-2.76,47.66], brest:[-4.49,48.39], lorient:[-3.37,47.75],
  larochelle:[-1.15,46.16], montpellier:[3.88,43.61], valence:[4.89,44.93],
  aixenprovence:[5.45,43.53], vitrolles:[5.26,43.46], pau:[-0.37,43.30],
  bayonne:[-1.47,43.49], biarritz:[-1.56,43.48], toulon:[5.93,43.12],
  rouen:[1.10,49.44], caen:[-0.37,49.18], limoges:[1.26,45.83],
  orleans:[1.90,47.90], besancon:[6.02,47.24], nancy:[6.18,48.69],
  le mans:[0.20,48.00], lemans:[0.20,48.00], saintetienne:[4.39,45.44],
  poitiers:[0.34,46.58], mulhouse:[7.34,47.75], evry:[2.43,48.63],
  cergy:[2.07,49.04], dunkerque:[2.38,51.03], cholet:[-0.88,47.06],
  tassinlademilune:[4.78,45.76], guyancourt:[2.07,48.77],
  lebourget:[2.43,48.94], bobigny:[2.44,48.91], compiegne:[2.83,49.42],
  saintquentin:[3.29,49.85], lillelesquin:[3.12,50.57],
};
export function cityKey(city: string) {
  return city.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'');
}
export function cityPoint(city: string) {
  const key=cityKey(city);
  // Exact city mapping first. No generic fuzzy geocoding for user-provided place names.
  const center=cityCenters[key];
  return center ? { lon:center[0], lat:center[1] } : null;
}
export function pointXY(lon: number, lat: number) {
  return {x:50+(lon+5.5)/15*520, y:18+(51.2-lat)/10*390};
}
const franceOutline:[number,number][]=[
  [-4.8,48.6],[-4.5,48.4],[-4.5,48.2],[-4.0,48.3],[-3.6,48.1],
  [-3.2,47.9],[-2.5,47.8],[-2.0,47.5],[-1.6,47.0],[-1.6,46.4],
  [-1.2,45.7],[-1.1,45.0],[-1.2,44.3],[-1.6,43.5],[-1.5,43.4],
  [-1.0,43.1],[0.2,42.9],[1.2,42.7],[1.8,42.6],[2.5,42.4],
  [3.1,42.4],[3.0,42.9],[3.3,43.2],[4.1,43.4],[4.9,43.3],
  [5.5,43.1],[6.1,43.0],[6.7,43.2],[7.4,43.7],[7.5,44.2],
  [6.7,44.7],[6.7,45.3],[7.1,45.8],[6.8,46.5],[6.1,46.7],
  [6.0,47.2],[7.0,47.5],[7.6,48.1],[8.1,48.9],[7.5,49.0],
  [7.0,49.2],[6.1,49.5],[5.2,49.5],[4.9,50.0],[4.2,50.0],
  [3.5,50.5],[2.7,50.7],[2.5,51.0],[1.6,50.9],[1.3,50.5],
  [1.0,50.0],[0.1,49.7],[-0.8,49.4],[-1.5,49.6],[-1.9,49.7],
  [-2.0,49.1],[-2.6,48.8],[-3.2,48.7],[-4.0,48.7],[-4.8,48.6],
];
export const francePath=franceOutline.map(([lon,lat],i)=>{
  const point=pointXY(lon,lat);
  return (i===0?'M':'L')+point.x.toFixed(1)+' '+point.y.toFixed(1);
}).join(' ')+' Z';
