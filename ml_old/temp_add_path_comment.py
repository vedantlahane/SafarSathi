from pathlib import Path

model_dir = Path('model')
py_files = sorted(model_dir.glob('*.py'))
for p in py_files:
    text = p.read_text(encoding='utf-8')
    lines = text.splitlines(keepends=True)
    target = f'# path: model/{p.name}\n'
    if lines and lines[0].startswith('# path: model/'):
        if lines[0] != target:
            lines[0] = target
            p.write_text(''.join(lines), encoding='utf-8')
    else:
        p.write_text(target + text, encoding='utf-8')
    print('updated', p)
