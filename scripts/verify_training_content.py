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
