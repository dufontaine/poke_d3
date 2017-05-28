
# coding: utf-8

# # Libraries

# In[33]:

import urllib
import json
from collections import Counter
import pandas as pd
import io
import requests
#from pokeapi import pokemon


# # Functions

# In[34]:

def construct_links(source, top, finallist):
    'Construct the top links for each source pokemon.'
    for j in range(len(top)):
        finallist.append({"source":source, "target":top[j][0], "value":float(top[j][1])})


# # Read all First Generation Pokemons

# In[35]:

url="https://raw.githubusercontent.com/veekun/pokedex/master/pokedex/data/csv/pokemon.csv"
s=requests.get(url).content
pokemon_names = pd.read_csv(io.StringIO(s.decode('utf-8'))).iloc[:149].identifier
pokemon_names = pokemon_names.apply(lambda x: x[0].upper()+x[1:])
pokemon_names.index=pokemon_names

# Some cleaning: Misspelled names and pokemons that dont appear
pokemon_names[pokemon_names=="Nidoran-f"]="NidoranF"
pokemon_names[pokemon_names=="Nidoran-m"]="NidoranM"
pokemon_names[pokemon_names=="Farfetchd"]="Farfetch'd"
pokemon_names[pokemon_names=="Mr-mime"]="Mr. Mime"
pokemon_names=pokemon_names.drop(['Tentacool', 'Doduo', 'Grimer'])
pokemon_names[pokemon_names==""]=""


# # Read data from Smogon

# In[36]:

# Read document from smogon
with urllib.request.urlopen("http://www.smogon.com/stats/2017-02/chaos/gen1ou-0.json") as url:
    smogonData = json.loads(url.read().decode())


# # Read file with descriptions and images

# In[37]:

pokemon_characteristics= pd.read_csv('https://gist.githubusercontent.com/santiagoolivar2017/0591a53c4dd34ecd8488660c7372b0e3/raw/4be104b8bc8876acd15f8e21f1c5945f10e3aa1e/Pokemon-description-image.csv')
pokemon_characteristics.index = pokemon_characteristics['Pokemon']
pokemon_characteristics['Type 2'].fillna(value='None', inplace=True)
pokemon_characteristics.head(3)


# # Building Dictionary

# In[38]:

dictionary={"nodes":[], "links":[]}
nodesinfo=[]
linksinfo=[]
ind=0
for i in pokemon_names:
    #pokemonInfo = pokemon.Pokemon(i) # very slow if activated
    if i not in smogonData['data']:
        nodesinfo.append({"id":i,
                      "img":pokemon_characteristics.loc[i]['PNG'],
                      "Type 1": pokemon_characteristics.loc[i]['Type 1'],
                      "Type 2": pokemon_characteristics.loc[i]['Type 2'],
                      "usage": 0,
                      "gxeMax": 0,
                      "gxe95": 0})
    if i in smogonData['data']:
        nodesinfo.append({"id":i, 
                      "img":pokemon_characteristics.loc[i]['PNG'],
                      "Type 1": pokemon_characteristics.loc[i]['Type 1'],
                      "Type 2": pokemon_characteristics.loc[i]['Type 2'],
                      "usage": smogonData['data'][i]['Viability Ceiling'][0],
                      "gxeMax": smogonData['data'][i]['Viability Ceiling'][1],
                      "gxe95": smogonData['data'][i]['Viability Ceiling'][3]})
        top = Counter(smogonData['data'][i]['Teammates']).most_common()[:1]
        top = [(top[0][0], top[0][1]/smogonData['data'][i]['Raw count'])]
        construct_links(i, top, linksinfo)

dictionary["nodes"] = nodesinfo
dictionary["links"] = linksinfo


# # Saving File

# In[39]:

with open('pokemon.json', 'w') as outfile:
    json.dump(dictionary, outfile)
    



