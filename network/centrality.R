# install.packages("igraph")
# install.packages("jsonlite")
library(igraph)
library(jsonlite)
setwd("C:/Users/mwcho/Desktop/pokemon/network")

# make list of data frames from json
built.graph <- fromJSON("pokemon2.json", flatten=TRUE) 
# create a data frame 
edgesdf<-cbind(built.graph$links$source, built.graph$links$target)
edgesdf<-data.frame(edgesdf)
# create directed graph from data frame
df.g <- graph.data.frame(d = edgesdf, directed = TRUE)
df.g
# convert costs to strength by taking 1/value so higher cond prob is lower cost
E(df.g)$weight=as.numeric(1/built.graph$links$value)
# igraph plot
layout <- layout.fruchterman.reingold(df.g,niter=500,area=vcount(df.g)^2.3,repulserad=vcount(df.g)^2.8)

plot(df.g,edge.arrow.size=0.5, 
     vertex.label.cex=0.75, 
     vertex.label.family="Helvetica",
     vertex.label.font=2,
     vertex.shape="circle", 
     vertex.size=1, 
     vertex.label.color="black", 
     edge.width=0.5,
     vertex.label = V(df.g)$name, layout=layout)

graph.com <- cluster_optimal(df.g)
graph.com
V(df.g)$color <- graph.com$membership + 1
plot(df.g, layout=layout)

# weights automatically factored into centrality
din<-degree(df.g, mode=c("in"))
dout<-degree(df.g, mode=c("out"))
bt<-betweenness(df.g, directed=TRUE)
# clusters(df.g)

#page rank, need to change weight to not be inverse
df.g2 <- graph.data.frame(d = edgesdf, directed = TRUE)
# convert costs to strength by taking 1/value so higher cond prob is lower cost
E(df.g2)$weight=as.numeric(built.graph$links$value)
pgr=page.rank(df.g2)$vector

finaldf<-cbind(din, dout, bt, pgr)
finaldf<-data.frame(finaldf)
finaldf$id<-row.names(finaldf)
finaldf
write.csv(finaldf, "centrality.csv", row.names=FALSE)
