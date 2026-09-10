"""Build the static Virgo subset; see src/scenes/virgo/README.md. Standard library only."""
import re,struct
from pathlib import Path

def readfits(path):
 b=Path(path).read_bytes(); h={}; p=2880
 while True:
  c=b[p:p+80].decode(); p+=80
  if len(c)!=80: raise ValueError('Truncated FITS header')
  if c[:8].strip()=='END': break
  if c[8:10]=='= ': h[c[:8].strip()]=c[10:].split('/')[0].strip().strip("'").strip()
 p=(p+2879)//2880*2880
 fields=[];off=0
 for i in range(1,int(h['TFIELDS'])+1):
  n,t=re.fullmatch(r'(\d*)([ABIJKED])',h[f'TFORM{i}']).groups();n=int(n or 1)
  fmt=f'{n}s' if t=='A' else f'{n}'+dict(B='B',I='h',J='i',K='q',E='f',D='d')[t]
  fields.append((h[f'TTYPE{i}'],off,'>'+fmt,t));off+=struct.calcsize('>'+fmt)
 assert off==int(h['NAXIS1'])
 rows=[]
 for j in range(int(h['NAXIS2'])):
  row={}
  for key,offset,fmt,t in fields:
   v=struct.unpack_from(fmt,b,p+j*off+offset)[0]
   row[key]=v.decode().strip(" \x00") if t=='A' else v
  rows.append(row)
 return rows

import sys, math, json, tarfile, hashlib, csv
from collections import Counter

MPC = 1e6 * (648000 / math.pi) * 149597870700

def numbers(s):
 return [float(x) for x in re.findall(r'[-+]?\d+(?:\.\d+)?',s)]
def texrows(t):
 return [[x.strip().rstrip('\\').strip() for x in line.split('&')] for line in t.splitlines() if re.match(r'^\s*(?:\d+|NGVSJ[^ ]+|\\nodata)\s*&',line)]
def key(s):
 return re.sub(r'[^a-z0-9]','',s.lower())
def identity_keys(g):
 return {k for name in [g['name'], *g['aliases']] if (k := key(name))}
def sight(ra,dec):
 a,d=map(math.radians,(ra,dec));return [math.cos(d)*math.cos(a),math.cos(d)*math.sin(a),math.sin(d)]
def clean(v):
 return round(v,6) if math.isfinite(v) else None

def main(root):
 fits=root/'50mgc.fits'; sbf=root/'sbf-source.tar'
 evcc=Path(sys.argv[2]) if len(sys.argv)>2 else Path('src/scenes/virgo/raw/evcc_table2_with_Mg.csv')
 with tarfile.open(sbf) as t:
  targets=texrows(t.extractfile('table_data_ref_full_clean.tex').read().decode())
  measures=texrows(t.extractfile('Tables/table_measures_ref_full_v2.tex').read().decode())
 print('SBF targets/measures',len(targets),len(measures))
 distances={r[0]:r for r in measures}
 assert len(distances)==278
 rows=[]
 def row(name,ra,dec,d,e,kind,method,source,mag=None,aliases=None,quality=None):
  return dict(name=name,raDegrees=ra,decDegrees=dec,distanceMeters=d*MPC,distanceErrorMeters=None if e is None else e*MPC,distanceKind=kind,method=method,sourceIds=[source],absoluteMagnitude=mag,magnitudeBand='B' if mag is not None else None,magnitudeSourceId=source if mag is not None else None,aliases=aliases or [],quality=quality,evccId=None,evccMembership=None)
 for r in targets:
  vcc=r[0] if r[0].isdigit() else r[2].split()[0]
  if vcc not in distances: continue
  m=distances[vcc];d,e=numbers(m[6]);ra=float(r[2].split()[-1]);dec=float(r[3]);name=r[1] if r[1] not in ['---',r'\nodata','-'] else (f'VCC{vcc}' if vcc.isdigit() else vcc)
  rows.append(row(name,ra,dec,d,e,'independent','SBF d_ref','ngvs-sbf-2024',float(r[4])-5*math.log10(d)-25,[f'VCC{vcc}'] if vcc.isdigit() else [],m[10]))
 assert len(rows)==278
 # Identity first, then unique angular matches within 10 arcsec.
 def merge_or_add(x):
  names=identity_keys(x)
  matches=[g for g in rows if names & identity_keys(g)]
  if not matches:
   u=sight(x['raDegrees'],x['decDegrees'])
   matches=[g for g in rows if sum((a-b)**2 for a,b in zip(u,sight(g['raDegrees'],g['decDegrees']))) < (math.radians(10/3600))**2]
  if len(matches)>1: raise ValueError(f'Ambiguous match: {x["name"]}')
  if matches:
   g=matches[0];g['aliases']=sorted(set(g['aliases']+x['aliases']+[x['name']])-{g['name']});g['sourceIds']=sorted(set(g['sourceIds']+x['sourceIds']))
   if g['absoluteMagnitude'] is None and x['absoluteMagnitude'] is not None:
    for k in ['absoluteMagnitude','magnitudeBand','magnitudeSourceId']: g[k]=x[k]
   if g['distanceKind']=='adopted' and x['distanceKind']=='independent':
    for k in ['distanceMeters','distanceErrorMeters','distanceKind','method']: g[k]=x[k]
  else: rows.append(x)
  return matches[0] if matches else x
 # Include existing Local Group catalog, using published heliocentric coordinates.
 for g in json.loads(Path('src/scenes/local-group/catalog.json').read_text()):
  if g['name']=='The Galaxy': continue
  d=g['distanceKpc']/1000
  e=max(g['distancePlusKpc'] or 0,g['distanceMinusKpc'] or 0)/1000
  aliases=[a.strip() for a in re.split(r'[,;]',g['aliases']) if key(a)]
  if g['name']=='Andromeda':aliases+=['NGC0224','M31']
  if g['name']=='Triangulum':aliases+=['NGC0598','M33']
  merge_or_add(row(g['name'],g['raDegrees'],g['decDegrees'],d,e or None,'independent','McConnachie 2012','mcconnachie-2012',aliases=aliases,quality=g['distanceFlags'] or None))
 center=[v*8.25 for v in sight(187.70593,12.39112)]
 for g in readfits(fits):
  if g['objname']=='Milky Way':continue
  d=g['bestdist'];e=clean(g['bestdist_error']);method=g['bestdist_method']
  independent_indicators={'TRGB','TRG','SBF','TF','BTF','HB','BS','CMD','Cep','Cepheids','RR','SN','SNIa','GCLF','geom'}
  indicator=g['zind_indicator']
  kind='independent' if method in ['NED-D','Mei','Cantiello'] else 'adopted' if method=='EVCC' or indicator=='mem' else 'estimated'
  if method not in ['Mei','Cantiello'] and indicator in independent_indicators and math.isfinite(g['zind_dist']) and g['zind_dist']>0:
   d=g['zind_dist'];e=clean(g['zind_dist_error']);kind='independent'
   method=('LVG' if g['lvg_obj'] else 'NED-D')+': '+indicator
  elif indicator not in ['', 'nan']:
   method += ': '+indicator
  if not math.isfinite(d) or d<=0:continue
  u=sight(g['ra'],g['dec'])
  if math.dist([v*d for v in u],center)>20:continue
  # Retain method; mem is a group assignment, NAM/txt/unknown remain estimated.
  x=row(g['objname'],g['ra'],g['dec'],d,e,kind,method or 'unspecified','50mgc-2024',clean(g['BMag']),[f'PGC{g["pgc"]}'] if g['pgc']>0 else [])
  merge_or_add(x)
 # EVCC full user-supplied table. All entries survive; IDs precede angular matches.
 evccrows=list(csv.DictReader(evcc.open()))
 assert len(evccrows)==1589 and len({r['EVCC'] for r in evccrows})==1589
 ngc_counts=Counter(r['NGC'].strip() for r in evccrows if r['NGC'].strip())
 for r in evccrows:
  assert r['MemIn'] in ['M','P']
  evccid=int(r['EVCC']); aliases=[]
  if r['VCC'].strip():aliases.append('VCC'+str(int(r['VCC'])))
  if r['NGC'].strip() and ngc_counts[r['NGC'].strip()]==1:
   match=re.fullmatch(r'(\d+)(.*)',r['NGC'].strip())
   assert match, r['NGC']
   aliases.append(f'NGC{int(match[1]):04d}{match[2]}')
  x=row(f'EVCC{evccid}',float(r['RAdeg']),float(r['DEdeg']),16.5,None,'adopted','EVCC representative distance','evcc-2014',float(r['M_g']),aliases)
  x['magnitudeBand']='g';x['magnitudeSourceId']='evcc-2014'
  g=merge_or_add(x)
  if g['evccId'] is not None:raise ValueError(f'Duplicate EVCC association: {evccid} and {g["evccId"]}')
  g['evccId']=evccid;g['evccMembership']=r['MemIn']
  # The CSV M_g is authoritative for the display, including crossmatched SBF objects.
  for k in ['absoluteMagnitude','magnitudeBand','magnitudeSourceId']:g[k]=x[k]
 rows.insert(0,row('Milky Way',0,0,0,None,'adopted','observer origin','virgo-convention'))
 # Keep catalog distances separate from adopted fallback and synthetic display depths.
 for g in rows:
  g['representativeDistanceMeters']=g['distanceMeters']
  g['depthModel']=None
  if g['distanceKind']=='independent' or g['name']=='Milky Way':continue
  if g['evccMembership']=='M' or (g['evccMembership'] is None and g['method'].startswith('EVCC')):
   g['depthModel']='virgo-sbf';g['representativeDistanceMeters']=16.5*MPC
  elif g['distanceKind']=='adopted':g['depthModel']='nearby'
 print('Duplicate names',[(k,v) for k,v in Counter(g['name'] for g in rows).items() if v>1])
 assert len({g['name'] for g in rows})==len(rows)
 assert sum('mcconnachie-2012' in g['sourceIds'] for g in rows)==74
 assert sum(g['evccId'] is not None for g in rows)==1589
 assert sum('ngvs-sbf-2024' in g['sourceIds'] for g in rows)==278
 assert all(all(key(a) for a in g['aliases']) for g in rows)
 out=Path('src/scenes/virgo');out.mkdir(exist_ok=True)
 (out/'catalog.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2,allow_nan=False)+'\n')
 manifest=dict(count=len(rows),distanceCounts=dict(Counter(g['distanceKind'] for g in rows)),evccRows=len(evccrows),evccMembershipCounts=dict(Counter(r['MemIn'] for r in evccrows)),sbfRows=278,depthModelCounts=dict(Counter(g['depthModel'] or 'fixed' for g in rows)),inputs={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [fits,evcc,sbf]})
 (out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(manifest)
if __name__=='__main__':main(Path(sys.argv[1]))
