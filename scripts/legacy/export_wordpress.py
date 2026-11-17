import json,glob,collections,html,re,sys
d,out=sys.argv[1],sys.argv[2]
posts=[]
for f in sorted(glob.glob(d+'/posts*.json')): posts+=json.load(open(f))
cats={c['id']:c for c in json.load(open(d+'/cats.json'))}
DOM={27:'universe',4:'consciousness',31:'love',28:'sapiens',30:'ethics',32:'future',34:'personal',29:'society',33:'far-out'}
QOTW=81
def text(h):
    h=re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>','',h)
    h=re.sub(r'(?i)<br\s*/?>','\n',h)
    h=re.sub(r'(?i)</(p|h\d|li|blockquote|div)>','\n\n',h)
    h=re.sub(r'(?i)<li[^>]*>','• ',h)
    h=re.sub(r'<[^>]+>','',h)
    h=html.unescape(h).replace('\xa0',' ')
    paras=[re.sub(r'[ \t]+',' ',p).strip() for p in re.split(r'\n\s*\n',h)]
    paras=[p for p in paras if p]
    if paras:
        paras[0]=paras[0].lstrip('“"')
        paras[-1]=paras[-1].rstrip('”"')
    return paras
def norm(s): return re.sub(r'[^a-z0-9]+',' ',html.unescape(s).lower()).strip()
theories=[];unmapped=collections.Counter()
for p in posts:
    cs=p['categories']; title=html.unescape(p['title']['rendered']).strip()
    dom=next((DOM[c] for c in cs if c in DOM),None)
    subs=[c for c in cs if c in cats and (cats[c]['parent'] in DOM or cats[c]['parent']==QOTW)]
    sub=next((c for c in subs if dom and cats[c]['parent'] in DOM and DOM[cats[c]['parent']]==dom),subs[0] if subs else None)
    if dom is None and sub and cats[sub]['parent'] in DOM: dom=DOM[cats[sub]['parent']]
    isq=(dom is None)
    qtitle=title
    theories.append(dict(legacy_id=p['id'],date=p['date'][:10],kind='qotw' if (isq and dom is None) else 'core',
        domain=dom,question=qtitle,question_cat=(html.unescape(cats[sub]['name']) if sub else None),
        author=p['yoast_head_json'].get('author') or 'Anonymous',top_rated=84 in cs,
        paragraphs=text(p['content']['rendered']),legacy_url=p['link']))
import difflib
# canonical core questions: (domain, question_cat) -> best title
core={}
for t in theories:
    if t['kind']=='core' and t['question_cat']:
        core.setdefault((t['domain'],t['question_cat']),collections.Counter())[t['question']]+=1
corekeys=[(dom,qc,cnt.most_common(1)[0][0]) for (dom,qc),cnt in core.items()]
def best(title,cands,th=0.78):
    nt=norm(title)
    for c in cands:
        nc=norm(c)
        if len(min(nt,nc,key=len))>=20 and (nt.startswith(nc) or nc.startswith(nt)): return max(c,title,key=len)
    r=max(((difflib.SequenceMatcher(None,nt,norm(c)).ratio(),c) for c in cands),default=(0,None))
    return r[1] if r[0]>=th else None
canon={}  # title-> (kind,domain,canonical title)
for (dom,qc,ct) in corekeys: canon[norm(qc)]=('core',dom,ct)
for t in theories:
    if t['kind']=='core' and t['question_cat']:
        k=canon[norm(t['question_cat'])]
    elif t['kind']=='core':
        m=best(t['question'],[c for (d,_,c) in corekeys if d==t['domain']])
        k=('core',t['domain'],m or t['question'])
    else:
        m=best(t['question'],[c for (_,_,c) in corekeys],0.85)
        k=canon[norm(next(qc for (d,qc,c) in corekeys if c==m))] if m else ('qotw',None,t['question'])
    t['_k']=k
qtitles=[]
for t in sorted(theories,key=lambda t:t['date']):
    if t['_k'][0]=='qotw':
        m=best(t['_k'][2],qtitles,0.8)
        if m: t['_k']=('qotw',None,m)
        else: qtitles.append(t['_k'][2])
qs=collections.OrderedDict()
for t in sorted(theories,key=lambda t:t['date']):
    kind,dom,title=t['_k']; k=(kind,dom,norm(title))
    q=qs.setdefault(k,dict(kind=kind,domain=dom,title=title,first_date=t['date'],theories=[]))
    q['theories'].append({k2:t[k2] for k2 in ('legacy_id','date','author','top_rated','paragraphs','legacy_url')})
ql=[]
for q in qs.values():
    tgt=None
    if q['kind']=='core':
        m=best(q['title'],[x['title'] for x in ql if x['kind']=='core' and x['domain']==q['domain']],0.9)
        tgt=next((x for x in ql if x['kind']=='core' and x['domain']==q['domain'] and x['title']==m),None) if m else None
        if tgt is None and m:
            tgt=next((x for x in ql if x['kind']=='core' and x['domain']==q['domain'] and (norm(m).startswith(norm(x['title'])) or norm(x['title']).startswith(norm(m)))),None)
    if tgt:
        tgt['theories']+=q['theories']; tgt['theories'].sort(key=lambda t:t['date'])
        if len(q['title'])>len(tgt['title']) and not q['title'].endswith('…'): tgt['title']=q['title']
        if tgt['title'].endswith('…') and not q['title'].endswith('…'): tgt['title']=q['title']
    else: ql.append(q)
json.dump(ql,open(out+'/legacy-quarx.json','w'),ensure_ascii=False,indent=1)
print(len(ql),"questions;",sum(len(q['theories']) for q in ql),"theories")
print(collections.Counter((q['kind'],q['domain']) for q in ql))
for q in ql:
    if q['kind']=='qotw': print(q['first_date'],len(q['theories']),q['title'][:90])
wc=[sum(len(p.split()) for p in t['paragraphs']) for q in ql for t in q['theories']]
wc.sort(); print("words median",wc[len(wc)//2],"max",wc[-1],"min",wc[0])
