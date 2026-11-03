"""Regression checks for the synthetic case's approved validation pipeline."""
import importlib.util
import tempfile
import unittest
from pathlib import Path
import pandas as pd
SOURCE=Path(__file__).resolve().parents[1]/'src/features/training/dataAnalysis/starter_data_analysis.py'
spec=importlib.util.spec_from_file_location('data_starter',SOURCE)
starter=importlib.util.module_from_spec(spec);spec.loader.exec_module(starter)
class StarterTests(unittest.TestCase):
    def test_nonblank_malformed_open_cost_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);starter.write_dataset(root/'data')
            path=root/'data/interventions_dirty.csv'
            frame=pd.read_csv(path,dtype=str,keep_default_na=False)
            id=frame.loc[frame.status.eq('open'),'intervention_id'].iloc[0]
            frame.loc[frame.intervention_id.eq(id),'repair_cost_eur']='NOT_A_NUMBER'
            frame.to_csv(path,index=False)
            valid=starter.prepare_validated_data(root/'data',root/'outputs',approved=True)
            self.assertNotIn(id,set(valid.intervention_id))
            rejects=pd.read_csv(root/'outputs/rejects.csv')
            self.assertIn(id,set(rejects.intervention_id))
    def test_original_open_blanks_remain_unknown(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);starter.write_dataset(root/'data')
            valid=starter.prepare_validated_data(root/'data',root/'outputs',approved=True)
            self.assertEqual(len(valid),216)
            self.assertTrue(valid.loc[valid.status.eq('open'),'repair_cost_eur'].isna().all())
    def test_regeneration_preserves_witness_and_invalidates_final_proof(self):
        import json, subprocess, sys, os
        source=SOURCE.parent/'actions21to40.ts'
        actions=json.loads(source.read_text().split(' = ',1)[1].strip().removesuffix(';'))
        action=next(a for a in actions if a['id']=='a36')
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);starter.write_dataset(root/'data');(root/'outputs').mkdir()
            witness=root/'outputs/monthly_report.csv';witness.write_text('reference witness')
            proof=root/'outputs/reconciliation_validated.csv';proof.write_text('stale evidence')
            script=root/'prepare.py';script.write_text(action['solution']['code'])
            env={**os.environ,'PYTHONPATH':str(SOURCE.parent)}
            result=subprocess.run([sys.executable,str(script)],cwd=root,env=env,capture_output=True,text=True)
            self.assertEqual(result.returncode,0,result.stderr)
            self.assertEqual(witness.read_text(),'reference witness')
            self.assertFalse(proof.exists())
            self.assertTrue((root/'outputs/monthly_report_validated.csv').is_file())
            self.assertTrue((root/'outputs/validated_analysis.db').is_file())
if __name__=='__main__': unittest.main()
