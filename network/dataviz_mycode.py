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
import pandas as pd
import io
import requests
from pokeapi import pokemon

#%%
#Funtions
def construct_links(source, top, finallist):
    'Construct the top links for each source pokemon.'
    for i in range(len(top)):
        finallist.append({"source":source, "target":top[i][0], "value":int(top[i][1])})
    
#%%

# Read all First Generation Pokemons
url="https://raw.githubusercontent.com/veekun/pokedex/master/pokedex/data/csv/pokemon.csv"
s=requests.get(url).content
pokemon_names = pd.read_csv(io.StringIO(s.decode('utf-8'))).iloc[:149].identifier
pokemon_names = pokemon_names.apply(lambda x: x[0].upper()+x[1:])
pokemon_names.index=pokemon_names
# Some cleaning: Mi'sspelled names and pokemons that dont appear
pokemon_names[pokemon_names=="Nidoran-f"]="NidoranF"
pokemon_names[pokemon_names=="Nidoran-m"]="NidoranM"
pokemon_names[pokemon_names=="Farfetchd"]="Farfetch'd"
pokemon_names[pokemon_names=="Mr-mime"]="Mr. Mime"
pokemon_names=pokemon_names.drop(['Tentacool', 'Doduo', 'Grimer'])
pokemon_names[pokemon_names==""]=""

# Read document from smogon
with urllib.request.urlopen("http://www.smogon.com/stats/2017-02/chaos/gen1ou-0.json") as url:
    smogonData = json.loads(url.read().decode())

# Read file with images
pokemon_images= pd.read_csv('https://gist.githubusercontent.com/santiagoolivar2017/0591a53c4dd34ecd8488660c7372b0e3/raw/4be104b8bc8876acd15f8e21f1c5945f10e3aa1e/Pokemon-description-image.csv')
pokemon_images.index = pokemon_images['Pokemon']

#%%
# Construct dictionary
dictionary={"nodes":[], "links":[]}
nodesinfo=[]
linksinfo=[]
ind=0
for i in pokemon_names:
    #pokemonInfo = pokemon.Pokemon(i) # very slow if activated
    nodesinfo.append({"id":i, "group":1, "img":pokemon_images.loc[i]['PNG']})
    if i in smogonData['data']:
        top = Counter(smogonData['data'][i]['Teammates']).most_common()[:1]
        construct_links(i, top, linksinfo)

dictionary["nodes"] = nodesinfo
dictionary["links"] = linksinfo

#%%
# Save file
with open('pokemon.json', 'w') as outfile:
    json.dump(dictionary, outfile)
    
