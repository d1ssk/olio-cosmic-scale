"""Extract HYG v4.1's <=5 pc sample. Usage: python3 scripts/prepare-nearby-stars.py /tmp/cosmic-hyg.csv
Input: https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv
Derived data remains CC BY-SA 4.0, David Nash / Astronexus. No network at runtime.
"""
import csv
import json
import sys
from pathlib import Path

rows = []
for row in csv.DictReader(open(sys.argv[1], encoding='utf-8')):
    if float(row['dist']) > 5:
        continue
    rows.append(dict(id=int(row['id']), name=row['proper'] or row['gl'] or f"HIP {row['hip']}",
                     xyzPc=[float(row[k]) for k in ('x', 'y', 'z')],
                     absoluteMagnitude=float(row['absmag']), spectralType=row['spect'],
                     bv=float(row['ci']) if row['ci'] else None))
Path('src/scenes/stellar-neighborhood/nearby-stars.json').write_text(json.dumps(rows, indent=2) + '\n')
print(f'Extracted {len(rows)} entries (including Sun)')
