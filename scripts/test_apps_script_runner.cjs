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
    insertRowsAfter() {},
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
assert.equal(new Set(sheet.rows.slice(1).map(r=>r[0])).size,61);
const zero=context.upsertRunnerOfferRows_(sheet,[]);
assert.equal(zero.appended,0);
assert.equal(sheet.rows.length,62);
console.log('ATS incremental upserts: 61 preserved, idempotent, saved applications unchanged');
