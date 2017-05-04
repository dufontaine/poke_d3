# -*- coding: utf-8 -*-
"""
Created on Sat Apr 29 01:06:05 2017

@author: santiago olivar
"""
#%%
# Libraries
import urllib
import json
from collections import Counter
#from pokeapi import pokemon

#%%
#Funtions
def construct_links(source, top, finallist):
    'Construct the top links for each source pokemon.'
    for i in range(len(top)):
        finallist.append({"source":source, "target":top[i][0], "value":int(top[i][1])})
    
#%%
# Read document from smogon
with urllib.request.urlopen("http://www.smogon.com/stats/2017-02/chaos/gen1ou-0.json") as url:
    data = json.loads(url.read().decode())

#%%
# Construct dictionary
dictionary={"nodes":[], "links":[]}
nodesinfo=[]
linksinfo=[]
for i in data['data']:
    nodesinfo.append({"id":i, "group":1})
    top = Counter(data['data'][i]['Teammates']).most_common()[:3]
    construct_links(i, top, linksinfo)

dictionary["nodes"] = nodesinfo
dictionary["links"] = linksinfo

#%%
# Save file
with open('input_network1.txt', 'w') as outfile:
    json.dump(dictionary, outfile)
