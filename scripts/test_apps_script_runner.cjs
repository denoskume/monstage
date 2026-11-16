/* Regression for runner UPSERT: do not replace the complete source sheet or
 * lose applications when ATS batches arrive separately. Run with Node.js.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function makeSheet(width) {
  const values = [Array.from({length:width}, (_, i) => i === 0 ? 'ID' : 'field ' + i)];
  const sheet = {
    rows: values,
    clearContents() { throw new Error('Destructive clear forbidden for ATS runner'); },
    setFrozenRows() {},
    getLastRow() { return this.rows.length; },
    getMaxRows() { return Math.max(this.rows.length, 100); },
    getMaxColumns() { return Math.max(width, this.rows[0].length); },
    insertRowsAfter() {},
    insertColumnsAfter(start, count) { this.rows.forEach(row => row.splice(start, 0, ...Array(count).fill(''))); },
    getRange(row, col, height=1, columns=1) {
      return {
        getDisplayValues: () => Array.from({length:height}, (_, i) =>
          Array.from({length:columns}, (_, j) => String((values[row+i-1] || [])[col+j-1] ?? ''))),
        setValues: input => {
          assert.equal(input.length, height);
          for (let i=0;i<height;i++) {
            assert.equal(input[i].length, columns);
            while (values.length < row+i) values.push(Array(width).fill(''));
            const dest = values[row+i-1];
            for (let j=0;j<columns;j++) dest[col+j-1] = input[i][j];
          }
        }
      };
    }
  };
  return sheet;
}
const lock = { waitLock() {}, releaseLock() {} };
const context = vm.createContext({
  console,
  LockService: {getScriptLock:()=>lock},
  SpreadsheetApp: {flush() {}},
});
vm.runInContext(
  fs.readFileSync(path.join(__dirname, '../apps-script/Code.gs'), 'utf8'), context,
  {filename:'Code.gs'}
);
context.strictEligible_ = () => true;
context.publicationDateScore_ = (value) => value.publishedAt ? 1 : 0;
const cols=context.EXTERNAL_SOURCE_HEADERS_.length;
const sheet=makeSheet(cols);
const rows=(first,count)=>Array.from({length:count},(_,i)=>{
  const row=Array(cols).fill('');
  row[0]='workday:thales:job'+String(first+i);
  row[1]='Thales';row[2]='Stage Data Analyst';row[3]='Data Analyst / Business Intelligence';
  row[13]='À candidater';row[24]='2026-11-15T09:00:00Z';return row;
});
const first=context.upsertRunnerOfferRows_(sheet,rows(0,30));
assert.equal(first.appended,30);
assert.equal(sheet.rows.length,31);
assert.match(sheet.rows[5][cols-2], /^2026-11-16|^2026-\d{2}-\d{2}/);
const firstAddedAt = sheet.rows[5][cols-2];
sheet.rows[5][13]='Entretien';
sheet.rows[5][16]='TRUE';
sheet.rows[5][11]='2026-11-10';
const second=context.upsertRunnerOfferRows_(sheet,rows(30,30));
assert.equal(second.appended,30);
assert.equal(sheet.rows.length,61);
const third=context.upsertRunnerOfferRows_(sheet,[...rows(4,1),...rows(60,1)]);
assert.equal(third.updated,1);
assert.equal(third.appended,1);
assert.equal(sheet.rows.length,62);
assert.equal(sheet.rows[5][13],'Entretien','Manually tracked application must survive ATS upsert');
assert.equal(sheet.rows[5][16],'TRUE','Saved shortlist must survive ATS upsert');
assert.equal(sheet.rows[5][11],'2026-11-10','Known publication date must survive missing new date');
assert.equal(sheet.rows[5][cols-2], firstAddedAt, 'First insertion date must survive ATS upsert');
assert.ok(sheet.rows[5][cols-1], 'Last meaningful update must be recorded');
assert.equal(new Set(sheet.rows.slice(1).map(r=>r[0])).size,61);
const zero=context.upsertRunnerOfferRows_(sheet,[]);
assert.equal(zero.appended,0);
assert.equal(sheet.rows.length,62);
assert.equal(context.clearlyIneligibleStageSchedule_(
  '4-MONTH INTERNSHIP - Starting January 2027 - Data Analyst & Visualisation'), true);
assert.equal(context.clearlyIneligibleStageSchedule_(
  'Stage 5 mois Data Analyst'), true);
assert.equal(context.clearlyIneligibleStageSchedule_(
  'Stage 6 mois - Starting February 2027 - Data Analyst'), false);
assert.equal(context.clearlyIneligibleStageSchedule_(
  'Stage Data Analyst - dates à confirmer'), false);
// Legacy imported candidate remains archived in Sheets but is not presented
// as a matching stage unless the user explicitly tracks that candidature.
const januaryOld = {id:'official:loreal:legacy2026',title:
  '4-MONTH INTERNSHIP - Starting January 2027 – Data Analyst & Visualisation',
  applicationStatus:'À candidater',shortlist:false,appliedAt:'',followUpAt:null};
assert.equal(context.showSavedOfferInFeed_(januaryOld), false);
assert.equal(context.showSavedOfferInFeed_({...januaryOld, shortlist:true}), true);
assert.equal(context.showSavedOfferInFeed_({...januaryOld, applicationStatus:'Entretien'}), true);
assert.equal(context.showSavedOfferInFeed_({...januaryOld, appliedAt:'2026-11-14'}), true);
assert.equal(context.showSavedOfferInFeed_({...januaryOld, id:'manual:legacy'}), true);
assert.equal(context.showSavedOfferInFeed_({...januaryOld,
  title:'Stage 6 mois Data Analyst – Février 2027'}), true);
// Keep the user's non-finance analyst target roles: incidental collaboration
// with a finance team must not erase a Power BI/SQL internship.
assert.equal(context.strictRelevant_(
  'Stage Data Analyst RH Power BI',
  'Analyser les données des RH, achats et finances avec Python et SQL'), true);
assert.equal(context.strictRelevant_(
  'Stage Data Analyst Audit Interne',
  'Exploiter Python, SQL et les tableaux de bord pour différents systèmes du groupe dont la finance et les RH'), true);
// Exclude genuine finance roles as originally requested.
assert.equal(context.strictRelevant_(
  'Stage Data Analyst Finance',
  'Analyser les coûts financiers avec Power BI'), false);
assert.equal(context.strictRelevant_(
  'Stage Data Analyst',
  'Finance Department. Financial reports et consolidation comptable'), false);
assert.equal(context.strictRelevant_(
  'Stage Data Scientist',
  'Python et tableaux de bord'), false);
console.log('ATS incremental upserts: 61 preserved, idempotent, saved applications unchanged');
