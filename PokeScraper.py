# -*- coding: utf-8 -*-
"""
Created on Mon Apr 24 13:11:05 2017

@author: Dustin
"""
###########################################
# read an individual .json file and gets 
###########################################

import json
import pandas as pd


with open('gen1-ou-2017-02.json') as json_data:
    d = json.load(json_data)

pokeDict = d['data']

#%% 
#get usage count of each pokemon
usageDict = {}
for k,v in pokeDict.items():
    usageDict[k] = pokeDict[k]['Raw count']



#%%
#get list of pokemon teammate combos
#val is the boost to a pokemons usage when first is used
#example:  Pikachu, Riachu, -0.0192 
#           Riachues usage drops from 6.7% to 4.8% when pikachu is used

arcList = []

for k, v in pokeDict.items():
    pokeTeam = pokeDict[k]['Teammates']
    for c, w in pokeTeam.items():
        val = w / usageDict.get(k,100000)
        arcList.append([k,c,val])
        
df = pd.DataFrame(arcList, columns=['poke','teammate','val'])

#df.to_csv('ArcList.csv', index=False)



#%%





