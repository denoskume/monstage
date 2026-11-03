"""Synthetic industrial learning data. No real company or personal records.
Run: python starter_data_analysis.py --output data
All timestamps are UTC; one intervention per row, asset-month in planned_hours.
"""
import argparse
import calendar
import csv
import json
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path


def generate_rows():
    assets = [{'asset_id': f'A{i:02}', 'site': ['Nantes', 'Lyon', 'Lille'][i % 3],
               'asset_type': ['pompe', 'moteur'][i % 2]} for i in range(1, 13)]
    interventions, planned = [], []
    for month in range(1, 7):
        for ai, asset in enumerate(assets):
            planned.append({'asset_id': asset['asset_id'], 'month': f'2026-{month:02}',
                            'planned_hours': calendar.monthrange(2026, month)[1] * 24})
            for slot, day in enumerate([2, 12, 22]):
                n = len(interventions) + 1
                opened = datetime(2026, month, day, 9, tzinfo=timezone.utc)
                status = 'open' if month == 6 and n % 7 == 0 else 'cancelled' if n % 17 == 0 else 'closed'
                minutes = 30 + ((ai * 13 + month * 7 + slot * 19) % 151)
                closed = opened + timedelta(minutes=minutes)
                interventions.append({
                    'intervention_id': f'I{n:04}', 'asset_id': asset['asset_id'],
                    'opened_at': opened.isoformat(),
                    'closed_at': closed.isoformat() if status == 'closed' else '',
                    'status': status, 'intervention_type': 'preventive' if slot == 0 else 'corrective',
                    'downtime_min': minutes if status == 'closed' else 0 if status == 'cancelled' else '',
                    'repair_cost_eur': round(minutes * 2.5 + (ai % 4) * 25, 2) if status == 'closed' else 0 if status == 'cancelled' else '',
                })
    dirty = [dict(row) for row in interventions]
    dirty.append(dict(interventions[0]))
    dirty[1]['asset_id'] = 'UNKNOWN'
    dirty[2]['downtime_min'] = -5
    dirty[3]['repair_cost_eur'] = '1 200,50'
    dirty[4]['downtime_min'] = ''
    return {'assets': assets, 'interventions': interventions, 'planned_hours': planned, 'interventions_dirty': dirty}


def write_dataset(output='data'):
    output = Path(output); output.mkdir(parents=True, exist_ok=True)
    data = generate_rows()
    for table, rows in data.items():
        with (output / f'{table}.csv').open('w', encoding='utf-8', newline='') as stream:
            writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
            writer.writeheader(); writer.writerows(rows)
    confirmed = [
        {'intervention_id': data['interventions'][1]['intervention_id'], 'field': 'asset_id', 'confirmed_value': data['interventions'][1]['asset_id'], 'reason': 'Référence équipement confirmée après revue'},
        {'intervention_id': data['interventions'][2]['intervention_id'], 'field': 'downtime_min', 'confirmed_value': data['interventions'][2]['downtime_min'], 'reason': 'Durée négative corrigée par le propriétaire'},
        {'intervention_id': data['interventions'][4]['intervention_id'], 'field': 'downtime_min', 'confirmed_value': data['interventions'][4]['downtime_min'], 'reason': 'Durée manquante confirmée par le propriétaire'},
    ]
    with (output / 'owner_response_after_review.csv').open('w', encoding='utf-8', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=list(confirmed[0])); writer.writeheader(); writer.writerows(confirmed)
    with sqlite3.connect(output / 'atelier.db') as connection:
        connection.executescript('DROP TABLE IF EXISTS assets; DROP TABLE IF EXISTS interventions; DROP TABLE IF EXISTS planned_hours;'
            'CREATE TABLE assets(asset_id TEXT PRIMARY KEY,site TEXT,asset_type TEXT);'
            'CREATE TABLE interventions(intervention_id TEXT PRIMARY KEY,asset_id TEXT,opened_at TEXT,closed_at TEXT,status TEXT,intervention_type TEXT,downtime_min REAL,repair_cost_eur REAL);'
            'CREATE TABLE planned_hours(asset_id TEXT,month TEXT,planned_hours REAL,PRIMARY KEY(asset_id,month));')
        for table in ['assets', 'interventions', 'planned_hours']:
            rows = data[table]
            values = [[None if v == '' else v for v in row.values()] for row in rows]
            marks = ','.join('?' for _ in rows[0])
            connection.executemany(f'INSERT INTO {table} VALUES ({marks})', values)
    metadata = {'synthetic': True, 'timezone': 'UTC', 'window': '2026-01-01 inclusive to 2026-07-01 exclusive',
                'grain': {'assets': 'one row per asset', 'interventions': 'one row per intervention', 'planned_hours': 'one row per asset-month'},
                'units': {'downtime_min': 'minutes, actual known for closed interventions', 'repair_cost_eur': 'EUR, known actual for closed interventions', 'planned_hours': 'hours of exposure'},
                'unknown': 'Empty duration/cost for open interventions is unknown, not zero.',
                'counts': {k: len(v) for k, v in data.items()}}
    (output / 'dictionary.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
    return output


def load_data(directory='data'):
    """Load prepared CSVs. Requires pandas; no silent regeneration of edited files."""
    import pandas as pd
    root = Path(directory)
    return {name: pd.read_csv(root / f'{name}.csv') for name in generate_rows()}


def prepare_validated_data(directory='data', output='outputs', approved=False):
    """Apply the simulated owner's reply after the first review, never the clean witness."""
    if not approved:
        raise ValueError('Attendre et examiner la réponse du propriétaire avant application.')
    import pandas as pd
    root, out = Path(directory), Path(output)
    raw = pd.read_csv(root / 'interventions_dirty.csv', dtype=str, keep_default_na=False)
    assets = pd.read_csv(root / 'assets.csv')
    changes = pd.read_csv(root / 'owner_response_after_review.csv', dtype=str)
    frame = raw.copy()
    allowed = {'asset_id', 'downtime_min'}
    for row in changes.to_dict('records'):
        if row['field'] not in allowed:
            raise ValueError('Correction non prévue dans la réponse')
        selected = frame.intervention_id.eq(row['intervention_id'])
        if selected.sum() != 1:
            raise ValueError('Correction ambiguë ou identifiant absent')
        frame[row['field']] = frame[row['field']].astype(object)
        frame.loc[selected, row['field']] = row['confirmed_value']
    before = len(frame)
    frame = frame.drop_duplicates().copy()  # Copies strictement identiques, règle approuvée.
    duplicate_copies = before - len(frame)
    conversion_errors = pd.Series(False, index=frame.index)
    for col in ['downtime_min', 'repair_cost_eur']:
        text = frame[col].astype(str).str.replace(' ', '', regex=False).str.replace(',', '.', regex=False)
        parsed = pd.to_numeric(text, errors='coerce')
        conversion_errors |= text.ne('') & parsed.isna()
        frame[col] = parsed
    invalid = frame.intervention_id.duplicated(keep=False) | ~frame.asset_id.isin(assets.asset_id)
    invalid |= ~frame.status.isin(['closed', 'open', 'cancelled'])
    invalid |= conversion_errors
    invalid |= frame.downtime_min.lt(0) | frame.repair_cost_eur.lt(0)
    invalid |= frame.status.eq('closed') & (frame.downtime_min.isna() | frame.repair_cost_eur.isna())
    opened = pd.to_datetime(frame.opened_at, utc=True, errors='coerce')
    closed = pd.to_datetime(frame.closed_at, utc=True, errors='coerce')
    invalid |= opened.isna() | (frame.closed_at.astype(str).str.strip().ne('') & closed.isna())
    invalid |= frame.status.eq('open') & closed.notna()
    invalid |= frame.status.eq('closed') & (closed.isna() | closed.lt(opened))
    out.mkdir(parents=True, exist_ok=True)
    valid, rejected = frame.loc[~invalid].copy(), frame.loc[invalid].copy()
    valid.to_csv(out / 'interventions_validated.csv', index=False)
    rejected.to_csv(out / 'rejects.csv', index=False)
    changes.to_csv(out / 'applied_owner_corrections.csv', index=False)
    summary = {'synthetic': True, 'input': len(raw), 'accepted': len(valid), 'rejected': len(rejected), 'identical_duplicate_copies': duplicate_copies, 'source': str(root / 'interventions_dirty.csv'), 'approved_response': str(root / 'owner_response_after_review.csv')}
    assert summary['input'] == summary['accepted'] + summary['rejected'] + summary['identical_duplicate_copies']
    (out / 'quality_summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
    return valid


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', default='data')
    arguments = parser.parse_args()
    print('Synthetic learning data written to', write_dataset(arguments.output))
