"""Extract McConnachie (2012) CDS J/AJ/144/4 tables 1–3 (pipe-delimited).
Usage: python3 scripts/prepare-local-group.py tmp/local-group
Input: https://cdsarc.cds.unistra.fr/ftp/J/AJ/144/4/table{1,2,3}.dat
No network required at runtime. Preserve missing values and original flags.
"""
import json
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
def key(name):
    normalized = re.sub(r'[^a-z0-9]', '', name.lower())
    return 'bootes' if normalized == 'bootesi' else normalized
def rows(n):
    return [[s.strip() for s in line.split('|')] for line in (root / f'table{n}.dat').read_text().splitlines()]
def num(s):
    return float(s) if s and s != '-' else None

distances = {key(r[0]): r for r in rows(2)}
shapes = {key(r[0]): r for r in rows(3)}
output = []
for r in rows(1):
    if not set(r[4].split(',')) & {'G', 'A', 'L'}:
        continue
    d, s = distances[key(r[1])], shapes[key(r[1])]
    output.append(dict(name=r[1], aliases=r[2], membership=r[4], morphology=r[5],
        raDegrees=15*(float(r[6])+float(r[7])/60+float(r[8])/3600),
        decDegrees=(-1 if r[9]=='-' else 1)*(float(r[10])+float(r[11])/60+float(r[12])/3600),
        distanceKpc=num(d[9]), distancePlusKpc=num(d[11]), distanceMinusKpc=num(d[12]),
        distanceFlags=' '.join(x for x in [d[1],d[6],d[10]] if x),
        halfLightRadiusPc=num(s[24]), positionAngleDegrees=num(s[14]), ellipticity=num(s[17]),
        shapeFlags=' '.join(x for x in [s[1],s[7],s[15],s[18],s[25]] if x),
        positionRefs=r[13], distanceRefs=d[22], shapeRefs=s[29], comment=r[15]))
Path('src/scenes/local-group/catalog.json').write_text(json.dumps(output, indent=2)+'\n')
print(f'{len(output)} catalog entries')
