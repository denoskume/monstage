"""Validate the 40 daily lessons and Python syntax without running model training."""
import ast
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'src/features/training/daily'
lessons = []
for name in ['weeks1to4.ts', 'weeks5to8.ts']:
    text = (root / name).read_text(encoding='utf-8')
    lessons.extend(json.loads(text.split(' = ', 1)[1].strip().removesuffix(';')))
expected = {f'w{week}d{day}' for week in range(1, 9) for day in range(1, 6)}
assert len(lessons) == 40 and {lesson['id'] for lesson in lessons} == expected
for lesson in lessons:
    for key in ['demonstration', 'correction']:
        ast.parse(lesson[key]['code'], filename=f"{lesson['id']}-{key}.py")
    assert len(lesson['exercise']['acceptance']) >= 3, lesson['id']
    assert len(lesson['review']) >= 2, lesson['id']
print('40 daily lessons, 80 Python snippets: structure and syntax valid.')

# The second stage is a continuous enterprise project, with language-aware blocks.
import importlib.util
import sqlite3
import tempfile
project_root = root.parent / 'dataAnalysis'
project_actions = []
for name in ['actions1to20.ts', 'actions21to40.ts']:
    source = (project_root / name).read_text(encoding='utf-8')
    project_actions.extend(json.loads(source.split(' = ', 1)[1].strip().removesuffix(';')))
assert len(project_actions) == 40
assert [a['id'] for a in project_actions] == [f'a{i:02}' for i in range(1, 41)]
spec = importlib.util.spec_from_file_location('data_stage_starter', project_root / 'starter_data_analysis.py')
starter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(starter)
python_count = sql_count = native_count = 0
with tempfile.TemporaryDirectory(prefix='monstage-data-content-') as temporary:
    starter.write_dataset(temporary)
    for action in project_actions:
        assert len(action['yourTurn']['checks']) >= 3
        for kind in ['guided', 'solution']:
            block = action[kind]
            if block['language'] == 'python':
                ast.parse(block['code'], filename=action['id'] + '-' + kind + '.py')
                python_count += 1
            elif block['language'] == 'sql':
                with sqlite3.connect(Path(temporary) / 'atelier.db') as connection:
                    connection.executescript(block['code'])
                sql_count += 1
            else:
                native_count += 1
print(f'Data Analysis: 40 project actions; {python_count} Python syntax checks; {sql_count} SQL blocks executed; {native_count} native-tool/text blocks require their documented tools.')
