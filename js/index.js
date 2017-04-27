var dataset; //entire csv
var filteredData; //only rows of selected Pokemon
var SelectedPokes = [0, 3, 6, -1, -1, -1]; //numbers are pokemon index in data (Pokemon Number - 1)

//read csv of pokemon stats, types, and gifs
d3.csv("pokeSTATS.csv", function(loadedData) {
    dataset = loadedData;
    console.log(rowToJSON(dataset[1]));
    createDD(dataset); //create dropdown
    filteredData = filterPokes(dataset, SelectedPokes);
    LoadPics(filteredData);
    createListeners(); //had to add listeners programatically to programatically created objects
});

function createListeners() {
    //add pokemon from dropdown list to selected pokemon
    d3.select("#AddPoke").on('click', function () {
        selPoke = parseInt(d3.select("#myDD").node().value);
        for (var i = 0; i < 6; i++) {
            if (SelectedPokes.indexOf(selPoke)>-1){
                i=999;
            } else if (SelectedPokes[i]==-1) {
                SelectedPokes[i] = selPoke;
                i = 999;
            };
            filteredData = filterPokes(dataset,SelectedPokes);
            LoadPics(filteredData);
            createListeners();
        }   
    });
    
    //double click on pokemon to remove from selected
    d3.select('svg').selectAll('rect.PokeBox').on('dblclick', function(){
        myObj = d3.select(this);
        console.log(SelectedPokes);
        x = parseInt(myObj.attr('pIndex'));
        pokeIndex = SelectedPokes.indexOf(x);
        if (pokeIndex>-1){
            SelectedPokes[pokeIndex]=-1;
        }
        myObj.remove();
        filteredData = filterPokes(dataset,SelectedPokes);
        LoadPics(filteredData);
        createListeners();
    });  
};

//filters pokemon list to only those selected
//if not all 6 are selected, a row called pokeball is selected with image of a pokeball
function filterPokes(myData, sP) {
    var result = [];
    myData.forEach(function(d,i){
        if(sP.indexOf(i) > -1){
            result.push(d);
        }
    })
    for (i=result.length;i<6;i++){
        result.push({GIF:"https://lh6.googleusercontent.com/-7ze4Lb2iiOI/UptLoxXERxI/AAAAAAAAAEM/T0RV2S4bAgs/s145-p/pokeball-sprite-150-150.png",Number:"999",Pokemon:"pokeball"});
    }
    return result;
}

//creates drop-down list
function createDD(dat){
    console.log(dat);
    d3.select("#myDD")
    .selectAll("option")
    .data(dat)
    .enter()
    .append("option")
    .attr("value", function(d,i) {return i;})
    .text(function(d,i) {
        return (i+1) + " - " + d.Pokemon; 
    });
    return 0;
}

//loads pics of selected pokemon into grid
function LoadPics(dat){
    var w = 150; //w of svg
    var h = 200; //h of svg
    d3.select('#poke_grid').remove();
    var svg = d3.select('#cell_AddPoke') //make new svg 'canvas'
      .append('svg')
      .attr('id', 'poke_grid')
      .attr('width',w)
      .attr('height',h);

    var grid = {rows: 3, cols: 2}; //dim of array of pokemon.(only cols matters)
    var max = { x: 50, y: 50}; //size of pokemon images

    // define background patterns
    // identified by id=PokemonName
    svg.selectAll('defs')
      .data(dat)
      .enter()
      .append('defs')
        .append("pattern")
        .attr("id", function(d){
      return d.Pokemon;
    }).attr('patternUnits', 'userSpaceOnUse')
        .attr("width", max.x)
        .attr("height", max.y)
        .append("image")
        .attr("xlink:href", function(d){
      return d.GIF;
    })
        .attr("width", max.x)
        .attr("height", max.y);

    //add rectangles that contain pokemon image
    svg.selectAll('rect')
      .data(dat)
      .enter()
      .append('rect')
      .attr('class','PokeBox')
      .attr('pIndex', function(d){return d.Number-1})
      .attr("x", function(d,i){
      return (i% grid.cols)*max.x;
    }).attr("y", function(d,i){
      return Math.floor(i/(grid.cols))*max.y;
    }).attr("width", max.x)
      .attr("height", max.y)
      .attr("fill", function(d){
     return "url(#" + d.Pokemon+ ")"; 
    })
}

function rowToJSON (row) {
    var OUTPUT = new Object();
    var axes_list = [];
    var ax1 = new Object();
    var ax2 = new Object();
    var ax3 = new Object();
    var ax4 = new Object();
    var ax5 = new Object();
    ax1.axis = 'HP';
    ax2.axis = 'Attack';
    ax3.axis = 'Defense';
    ax4.axis = 'Speed';
    ax5.axis = 'Special';
    ax1.value = row.HP;
    ax2.value = row.Attack;
    ax3.value = row.Defense;
    ax4.value = row.Speed;
    ax5.value = row.Special;
    axes_list.push(ax1);
    axes_list.push(ax2);
    axes_list.push(ax3);
    axes_list.push(ax4);
    axes_list.push(ax5);
    OUTPUT.className = 'test_class';
    OUTPUT.axes = axes_list;
    return OUTPUT;
}
