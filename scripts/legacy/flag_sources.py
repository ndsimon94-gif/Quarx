import json,sys,collections
f=sys.argv[1]; q=json.load(open(f))
ORGS={'University of Zurich','Medical University of Vienna','Pew Research','Outsider Club','National Alliance to end homelessness','Michael Graziano','Paul Thagard - PhD','Rutger Bregman','Jeremy Heimans and Henry Tims','James West Davidson','Howard Steven Friedman','Jared Bernstein','Beth Daley','Swami Satchidananda'}
a=collections.Counter(t['author'] for x in q for t in x['theories'])
n=collections.Counter()
for x in q:
    for t in x['theories']:
        wc=sum(len(p.split()) for p in t['paragraphs']); t['words']=wc
        if t['author'] in ORGS: t['source']='external'
        elif wc>=400 and a[t['author']]<=3: t['source']='review'
        else: t['source']='community'
        n[t['source']]+=1
json.dump(q,open(f,'w'),ensure_ascii=False,indent=1)
print(n)
