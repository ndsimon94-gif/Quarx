import json,sys,collections,re
f=sys.argv[1]; q=json.load(open(f))
FULL={"If humans were put on trial by aliens…":"If humanity was put on trial by an advanced race of aliens, would you argue for our continued existence or for the end of our species? How?",
"If a person grew up in the wilderness…":"If a person grew up in the wilderness without any human contact, how (if at all) would they be different from the rest of us?",
"Who/what are we?":"Who and/or what are we?","How Special Are Humans?":"How special are humans?","Why Suffer?":"Why suffer?",
"What is your most far out theory?":"What is your most far-out theory?","Predict the outcome of the 2020 election…":"Predict the outcome of the 2020 election."}
for x in q: x['title']=FULL.get(x['title'],x['title'])
a=collections.Counter(); w=collections.defaultdict(list)
for x in q:
    for t in x['theories']:
        a[t['author']]+=1; w[t['author']].append(sum(len(p.split()) for p in t['paragraphs']))
print(len(a),"authors")
for au,n in a.most_common(): 
    m=sorted(w[au])[len(w[au])//2]
    if m>400 or n>=10: print(f"{n:3} median_words={m:5} {au}")
json.dump(q,open(f,'w'),ensure_ascii=False,indent=1)
