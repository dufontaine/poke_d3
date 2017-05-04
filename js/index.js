var dataset; //entire csv
var filteredData; //only rows of selected Pokemon
var SelectedPokes = [1, 4, 7, -1, -1, -1]; //numbers are pokemon index in data (Pokemon Number - 1)
var radarData = [];
var teamMode = false;

//read csv of pokemon stats, types, and gifs
d3.csv("pokeSTATS.csv", function(loadedData) {
    dataset = loadedData;
    //console.log(rowToJSON(dataset[1]));
    createDD(dataset); //create dropdown
    filteredData = filterPokes(dataset, SelectedPokes);
    LoadPics(filteredData);
    createListeners(); //had to add listeners programatically to programatically created objects
    makeRadar(filteredData);
    UpdateTypeChart();
});

function createListeners() {
    
    //update single image of pokemon based on DD
    d3.select('#myDD').on('change', function(){
        //get stats and description
        var selPokeNumber = parseInt(d3.select("#myDD").node().value)
        for (i=1; i<=151; i++) {
            if (dataset[i-1].Number== selPokeNumber) {
                var selPoke = dataset[i-1];
                var myHP = Math.ceil(selPoke.HP / 250 * 100);
                var myAttack = Math.ceil(selPoke.Attack / 134 * 100);
                var myDefense = Math.ceil(selPoke.Defense / 180 * 100);
                var mySpeed = Math.ceil(selPoke.Speed / 140 * 100);
                var mySpecial = Math.ceil(selPoke.Special / 154 * 100);
                var myDescription = selPoke.Description;
                document.getElementById('pokeDescription').innerHTML = myDescription;
                d3.select('#bar_HP').attr('data-value',myHP);
                d3.select('#bar_Attack').attr('data-value',myAttack);
                d3.select('#bar_Defense').attr('data-value',myDefense);
                d3.select('#bar_Speed').attr('data-value',mySpeed);
                d3.select('#bar_Special').attr('data-value',mySpecial);
                document.getElementById('num_HP').innerHTML = myHP;
                document.getElementById('num_Attack').innerHTML = myAttack;
                document.getElementById('num_Defense').innerHTML = myDefense;
                document.getElementById('num_Speed').innerHTML = mySpeed;
                document.getElementById('num_Special').innerHTML = mySpecial;

                //change types
                "url(http://www.serebii.net/pokedex-rs/type/normal.gif)"
                d3.select('#T1').style('background-image', function(){
                    myT = selPoke['Type 1'].toLowerCase();
                    return ("url(http://www.serebii.net/pokedex-rs/type/" + myT + ".gif)");
                })
                d3.select('#T2').style('background-image', function(){
                    myT = selPoke['Type 2'].toLowerCase();
                    return ("url(http://www.serebii.net/pokedex-rs/type/" + myT + ".gif)");
                })


                
                
                //d3.select('#bar_HP').style('width',myHP + 'px');
                generateBarGraph('#dashboard-stats');
            }
        }
        
        var svg = d3.select('#one_Poke_pic') //make new svg 'canvas'
        // define background patterns
        // identified by id=PokemonName
        svg.selectAll('defs')
          .data(dataset)
          .enter()
          .append('defs')
            .append("pattern")
            .attr("id", function(d){
                return 'png' + d.Pokemon;
        }).attr('patternUnits', 'userSpaceOnUse')
            .attr("width", 214)
            .attr("height", 150)
            .append("image")
            .attr("xlink:href", function(d){
                return d.PNG;
        }).attr("width", 214)
          .attr("height", 150);
        
        svg.selectAll('rect')
          .attr("fill", function(){
            var sel = document.getElementById('myDD')
            return "url(#png" + sel.options[sel.selectedIndex].text+ ")"; 
        })        
        
    });

         
    //add pokemon from dropdown list to selected pokemon
    d3.select("#AddPoke").on('click', function () {
        selPoke = parseInt(d3.select("#myDD").node().value);
        for (i = 0; i < 6; i++) {
            if (SelectedPokes.indexOf(selPoke)>-1){
                i=999;
            } else if (SelectedPokes[i]==-1) {
                SelectedPokes[i] = selPoke;
                i = 999;
            };
        }  
        filteredData = filterPokes(dataset,SelectedPokes);
        LoadPics(filteredData);
        createListeners();
        makeRadar(filteredData);
        UpdateTypeChart();
    });
    
    //double click on pokemon to remove from selected
    d3.select('#poke_grid').selectAll('rect.PokeBox').on('dblclick', function(){
        myObj = d3.select(this);
        x = parseInt(myObj.attr('pIndex'));
        pokeIndex = SelectedPokes.indexOf(x);
        if (pokeIndex>-1){
            SelectedPokes[pokeIndex]=-1;
        }
        myObj.remove();
        filteredData = filterPokes(dataset,SelectedPokes);
        LoadPics(filteredData);
        createListeners();
        makeRadar(filteredData);
        UpdateTypeChart();
    }); 
    
    //toggle radar to team average mode
    d3.select('#btnTeam').on('click', function() {
        if (teamMode == false) {
            teamMode = true;
            //change button formats
            d3.select('#btnTeam').classed('ToggleRadarOn',0).classed('ToggleRadarOff',1);
            d3.select('#btnInd').classed('ToggleRadarOn',1).classed('ToggleRadarOff',0);
            makeRadar(filteredData);
        }
    });
    
    //toggle radar to individual mode
    d3.select('#btnInd').on('click', function() {
        if (teamMode == true) {
            teamMode = false;
            //change button formats
            d3.select('#btnInd').classed('ToggleRadarOn',0).classed('ToggleRadarOff',1);
            d3.select('#btnTeam').classed('ToggleRadarOn',1).classed('ToggleRadarOff',0);
            makeRadar(filteredData);
        }
    });
};

//filters pokemon list to only those selected
//if not all 6 are selected, a row called pokeball is selected with image of a pokeball
function filterPokes(myData, sP) {
    var result = [];
    myData.forEach(function(d){
        if(sP.indexOf(parseInt(d.Number)) > -1){
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
    d3.select("#myDD")
    .selectAll("option")
    .data(dat.sort(function(a,b) {return (a.Pokemon > b.Pokemon) ? 1 : ((b.Pokemon > a.Pokemon) ? -1 : 0);} ))
    .enter()
    .append("option")
    .attr("value", function(d) {return parseInt(d.Number);})
    .text(function(d) {
        return d.Pokemon; 
    });
    return 0;
}

//loads pics of selected pokemon into grid
function LoadPics(dat){
    var grid = {rows: 1, cols: 6}; //dim of array of pokemon.(only cols matters)
    var max = { x: 100, y: 100}; //size of pokemon images
    
    var w = grid.cols * max.x; //w of svg
    var h = grid.rows * max.y; //h of svg
    d3.select('#poke_grid').remove();
    var svg = d3.select('#cell_Lineup') //make new svg 'canvas'
      .append('svg')
      .attr('id', 'poke_grid')
      .attr('width',w)
      .attr('height',h);

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
    }).attr("width", max.x)
      .attr("height", max.y);

    //add rectangles that contain pokemon image
    svg.selectAll('rect')
      .data(dat)
      .enter()
      .append('rect')
      .attr('class','PokeBox')
      .attr('pIndex', function(d){return parseInt(d.Number)})
      .attr("x", function(d,i){
      return (i% grid.cols)*max.x;
    }).attr("y", function(d,i){
      return Math.floor(i/(grid.cols))*max.y;
    }).attr("width", max.x)
      .attr("height", max.y)
      .attr("fill", function(d){
     return "url(#" + d.Pokemon+ ")"; 
    })
    
    svg.selectAll('text').data(dat).enter().append('text')
    .attr("x", function(d,i){ 
      return (i% grid.cols)*max.x;
    }).attr("y", function(d,i){
      return 10+Math.floor(i/(grid.cols))*max.y;
    }).attr("width", max.x)
      .attr("height", max.y).text(function(d,i){
        if (d.Pokemon != 'pokeball'){
            return d.Pokemon;
        } else {return ''}
    }).classed('ttip',true);
}


//converts a row from the csv data to json format for radar chart
function rowToJSON (row) {
    var OUTPUT = new Object();
    var axes_list = [];
    var ax1 = new Object();  var ax2 = new Object();  var ax3 = new Object();
    var ax4 = new Object();  var ax5 = new Object();
    ax1.axis = 'HP';  ax2.axis = 'Attack';  ax3.axis = 'Defense'; 
    ax4.axis = 'Speed';  ax5.axis = 'Special';
    ax1.value = Math.ceil(row.HP/250*100); ax2.value = Math.ceil(row.Attack/134*100); 
    ax3.value = Math.ceil(row.Defense/180*100); ax4.value = Math.ceil(row.Speed/140*100); 
    ax5.value = Math.ceil(row.Special/154*100);
    axes_list.push(ax1);  axes_list.push(ax2);  axes_list.push(ax3);
    axes_list.push(ax4);  axes_list.push(ax5);
    OUTPUT.className = row['Type 1'];
    OUTPUT.axes = axes_list;
    OUTPUT.Pokemon = row.Pokemon;
    return OUTPUT;
}


function makeRadar (myData) {
    //remove existing radar chart
    d3.select('#radarSVG').remove();
    //gather data for radar chart
    var radarData = [];
    var team_avg_row = (JSON.parse(JSON.stringify(myData[0])));
    var dummy_row = team_avg_row;
    var aHP=0; var aAT=0; var aDE=0; var aSP=0; var aSL=0;
    var pCount=0;
    var k = 0;
    
    if (teamMode == false) {
        for (i=0; i<myData.length; i++) {
            if (myData[i].Number != "999") {
                k++;
                radarData.push(rowToJSON(myData[i]));
            }
        }
        if (k==0){
            //dummy_row.HP = 1/0;
            radarData.push(rowToJSON(dummy_row));
        }
    } else {
        for (i=0; i<myData.length; i++) {
            if (myData[i].Number != "999") {
                console.log('poke');
                aHP += myData[i].HP*1;
                aAT += myData[i].Attack*1;
                aDE += myData[i].Defense*1;
                aSP += myData[i].Speed*1;
                aSL += myData[i].Special*1;
                pCount += 1;
            }
        }
        team_avg_row.HP = aHP/pCount;
        team_avg_row.Attack = aAT/pCount;
        team_avg_row.Defense = aDE/pCount;
        team_avg_row.Speed = aSP/pCount;
        team_avg_row.Special = aSL/pCount;
        team_avg_row.Pokemon = 'Team';
        team_avg_row['Type 1'] = 'Normal';
        radarData.push(rowToJSON(team_avg_row));
    }

    //set up configuration for radar chart
    RadarChart.defaultConfig.color = function() {};
    RadarChart.defaultConfig.radius = 3;
    RadarChart.defaultConfig.w = 370;
    RadarChart.defaultConfig.h = 370;
    RadarChart.defaultConfig.maxValue = 100;
    RadarChart.defaultConfig.levels = 4;
    RadarChart.defaultConfig.circles=true;
    
    //create radar chart
    var chart = RadarChart.chart();
    var cfg = chart.config(); // retrieve default config
    var svg = d3.select('#cell_Radar').append('svg')
        .attr('width', cfg.w )
        .attr('height', cfg.h )
        .attr('id','radarSVG');
    console.log(radarData);
    svg.append('g').classed('single', 1).datum(radarData).call(chart);
    //render();
}

function UpdateTypeChart() {
    var attack_strength = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    var attack_weak = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    var defense_resist = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    var defense_weak = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

    //loop through each selected pokemon and gather type strengths and weaknesses
    for (i=0; i<filteredData.length; i++) {
        myPoke = filteredData[i];
        if (myPoke.Number != "999") {
            if(myPoke["Type 1"] == "Normal" | myPoke["Type 2"] == "Normal") {
                attack_strength[12] += 1; attack_strength[13] += 1;
                defense_weak[6] += 1;
                defense_resist[13] += 1;
            }
            if(myPoke["Type 1"] == "Fire" | myPoke["Type 2"] == "Fire") {
                attack_strength[4] += 1; attack_strength[5] += 1; attack_strength[11] += 1;
                attack_weak[1] += 1; attack_weak[2] += 1; attack_weak[12] += 1; attack_weak[14] += 1;
                defense_weak[2] += 1; defense_weak[8] += 1; defense_weak[12] += 1;
                defense_resist[1] += 1; defense_resist[4] += 1; defense_resist[11] += 1;
            }
            if(myPoke["Type 1"] == "Water" | myPoke["Type 2"] == "Water") {
                attack_strength[1] += 1; attack_strength[8] += 1; attack_strength[12] += 1;
                attack_weak[2] += 1; attack_weak[4] += 1; attack_weak[14] += 1;
                defense_weak[3] += 1; defense_weak[4] += 1;
                defense_resist[1] += 1; defense_resist[2] += 1; defense_resist[5] += 1;
            }
            if(myPoke["Type 1"] == "Electric" | myPoke["Type 2"] == "Electric") {
                attack_strength[2] += 1; attack_strength[9] += 1;
                attack_weak[3] += 1; attack_weak[4] += 1; attack_weak[8] += 1; attack_weak[14] += 1;
                defense_weak[8] += 1;
                defense_resist[3] += 1; defense_resist[9] += 1;
            }
            if(myPoke["Type 1"] == "Grass" | myPoke["Type 2"] == "Grass") {
                attack_strength[2] += 1; attack_strength[8] += 1; attack_strength[12] += 1;
                attack_weak[1] += 1; attack_weak[4] += 1; attack_weak[7] += 1; attack_weak[9] += 1; attack_weak[11] += 1; attack_weak[14] += 1;
                defense_weak[1] += 1; defense_weak[5] += 1; defense_weak[7] += 1; defense_weak[9] += 1; defense_weak[11] += 1;
                defense_resist[2] += 1; defense_resist[3] += 1; defense_resist[4] += 1; defense_resist[8] += 1;
            }
            if(myPoke["Type 1"] == "Ice" | myPoke["Type 2"] == "Ice") {
                attack_strength[4] += 1; attack_strength[8] += 1; attack_strength[9] += 1; attack_strength[14] += 1;
                attack_weak[2] += 1; attack_weak[5] += 1;
                defense_weak[1] += 1; defense_weak[6] += 1; defense_weak[12] += 1;
                defense_resist[5] += 1;
            }
            if(myPoke["Type 1"] == "Fighting" | myPoke["Type 2"] == "Fighting") {
                attack_strength[0] += 1; attack_strength[5] += 1; attack_strength[12] += 1;
                attack_weak[7] += 1; attack_weak[9] += 1; attack_weak[10] += 1; attack_weak[11] += 1; attack_weak[13] += 1;
                defense_weak[9] += 1; defense_weak[10] += 1;
                defense_resist[11] += 1; defense_resist[12] += 1;
            }
            if(myPoke["Type 1"] == "Poison" | myPoke["Type 2"] == "Poison") {
                attack_strength[4] += 1; attack_strength[11] += 1;
                attack_weak[7] += 1; attack_weak[8] += 1; attack_weak[12] += 1; attack_weak[13] += 1;
                defense_weak[8] += 1; defense_weak[10] += 1; defense_weak[11] += 1;
                defense_resist[4] += 1; defense_resist[6] += 1; defense_resist[7] += 1;
            }
            if(myPoke["Type 1"] == "Ground" | myPoke["Type 2"] == "Ground") {
                attack_strength[1] += 1; attack_strength[3] += 1; attack_strength[7] += 1; attack_strength[12] += 1;
                attack_weak[4] += 1; attack_weak[9] += 1; attack_weak[11] += 1;
                defense_weak[2] += 1; defense_weak[4] += 1; defense_weak[5] += 1;
                defense_resist[3] += 1; defense_resist[7] += 1; defense_resist[12] += 1;
            }
            if(myPoke["Type 1"] == "Flying" | myPoke["Type 2"] == "Flying") {
                attack_strength[4] += 1; attack_strength[6] += 1; attack_strength[11] += 1;
                attack_weak[3] += 1; attack_weak[12] += 1;
                defense_weak[3] += 1; defense_weak[5] += 1; defense_weak[12] += 1;
                defense_resist[4] += 1; defense_resist[6] += 1; defense_resist[8] += 1; defense_resist[11] += 1;
            }
            if(myPoke["Type 1"] == "Psychic" | myPoke["Type 2"] == "Psychic") {
                attack_strength[6] += 1; attack_strength[7] += 1;
                attack_weak[10] += 1;
                defense_weak[11] += 1;
                defense_resist[6] += 1; defense_resist[10] += 1; defense_resist[13] += 1;
            }
            if(myPoke["Type 1"] == "Bug" | myPoke["Type 2"] == "Bug") {
                attack_strength[4] += 1; attack_strength[7] += 1; attack_strength[10] += 1;
                attack_weak[1] += 1; attack_weak[6] += 1; attack_weak[9] += 1;
                defense_weak[1] += 1; defense_weak[7] += 1; defense_weak[9] += 1; defense_weak[12] += 1;
                defense_resist[4] += 1; defense_resist[6] += 1; defense_resist[8] += 1;
            }
            if(myPoke["Type 1"] == "Rock" | myPoke["Type 2"] == "Rock") {
                attack_strength[1] += 1; attack_strength[5] += 1; attack_strength[9] += 1; attack_strength[11] += 1;
                attack_weak[6] += 1; attack_weak[8] += 1;
                defense_weak[2] += 1; defense_weak[4] += 1; defense_weak[6] += 1; defense_weak[8] += 1;
                defense_resist[0] += 1; defense_resist[1] += 1; defense_resist[7] += 1; defense_resist[9] += 1;
            }
            if(myPoke["Type 1"] == "Ghost" | myPoke["Type 2"] == "Ghost") {
                attack_strength[13] += 1;
                attack_weak[0] += 1; attack_weak[10] += 1;
                defense_weak[13] += 1;
                defense_resist[0] += 1; defense_resist[6] += 1; defense_resist[7] += 1;
            }
            if(myPoke["Type 1"] == "Dragon" | myPoke["Type 2"] == "Dragon") {
                attack_strength[14] += 1;
                defense_weak[5] += 1; defense_weak[14] += 1;
                defense_resist[1] += 1; defense_resist[2] += 1; defense_resist[3] += 1; defense_resist[4] += 1;
            }
            
        }
    }
    
    //update colors on type chart
    Gcolz = ['#ffffff','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#006d2c','#006d2c','#006d2c'];
    Rcolz = ['#ffffff','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#a50f15','#a50f15','#a50f15'];
    
    document.getElementById("A_normal").style.backgroundColor = Gcolz[attack_strength[0]];
    document.getElementById("A_fire").style.backgroundColor = Gcolz[attack_strength[1]];
    document.getElementById("A_water").style.backgroundColor = Gcolz[attack_strength[2]];
    document.getElementById("A_electric").style.backgroundColor = Gcolz[attack_strength[3]];
    document.getElementById("A_grass").style.backgroundColor = Gcolz[attack_strength[4]];
    document.getElementById("A_ice").style.backgroundColor = Gcolz[attack_strength[5]];
    document.getElementById("A_fight").style.backgroundColor = Gcolz[attack_strength[6]];
    document.getElementById("A_poison").style.backgroundColor = Gcolz[attack_strength[7]];
    document.getElementById("A_ground").style.backgroundColor = Gcolz[attack_strength[8]];
    document.getElementById("A_flying").style.backgroundColor = Gcolz[attack_strength[9]];
    document.getElementById("A_psychic").style.backgroundColor = Gcolz[attack_strength[10]];
    document.getElementById("A_bug").style.backgroundColor = Gcolz[attack_strength[11]];
    document.getElementById("A_rock").style.backgroundColor = Gcolz[attack_strength[12]];
    document.getElementById("A_ghost").style.backgroundColor = Gcolz[attack_strength[13]];
    document.getElementById("A_dragon").style.backgroundColor = Gcolz[attack_strength[14]];

    document.getElementById("B_normal").style.backgroundColor = Rcolz[attack_weak[0]];
    document.getElementById("B_fire").style.backgroundColor = Rcolz[attack_weak[1]];
    document.getElementById("B_water").style.backgroundColor = Rcolz[attack_weak[2]];
    document.getElementById("B_electric").style.backgroundColor = Rcolz[attack_weak[3]];
    document.getElementById("B_grass").style.backgroundColor = Rcolz[attack_weak[4]];
    document.getElementById("B_ice").style.backgroundColor = Rcolz[attack_weak[5]];
    document.getElementById("B_fight").style.backgroundColor = Rcolz[attack_weak[6]];
    document.getElementById("B_poison").style.backgroundColor = Rcolz[attack_weak[7]];
    document.getElementById("B_ground").style.backgroundColor = Rcolz[attack_weak[8]];
    document.getElementById("B_flying").style.backgroundColor = Rcolz[attack_weak[9]];
    document.getElementById("B_psychic").style.backgroundColor = Rcolz[attack_weak[10]];
    document.getElementById("B_bug").style.backgroundColor = Rcolz[attack_weak[11]];
    document.getElementById("B_rock").style.backgroundColor = Rcolz[attack_weak[12]];
    document.getElementById("B_ghost").style.backgroundColor = Rcolz[attack_weak[13]];
    document.getElementById("B_dragon").style.backgroundColor = Rcolz[attack_weak[14]];

    document.getElementById("C_normal").style.backgroundColor = Rcolz[defense_weak[0]];
    document.getElementById("C_fire").style.backgroundColor = Rcolz[defense_weak[1]];
    document.getElementById("C_water").style.backgroundColor = Rcolz[defense_weak[2]];
    document.getElementById("C_electric").style.backgroundColor = Rcolz[defense_weak[3]];
    document.getElementById("C_grass").style.backgroundColor = Rcolz[defense_weak[4]];
    document.getElementById("C_ice").style.backgroundColor = Rcolz[defense_weak[5]];
    document.getElementById("C_fight").style.backgroundColor = Rcolz[defense_weak[6]];
    document.getElementById("C_poison").style.backgroundColor = Rcolz[defense_weak[7]];
    document.getElementById("C_ground").style.backgroundColor = Rcolz[defense_weak[8]];
    document.getElementById("C_flying").style.backgroundColor = Rcolz[defense_weak[9]];
    document.getElementById("C_psychic").style.backgroundColor = Rcolz[defense_weak[10]];
    document.getElementById("C_bug").style.backgroundColor = Rcolz[defense_weak[11]];
    document.getElementById("C_rock").style.backgroundColor = Rcolz[defense_weak[12]];
    document.getElementById("C_ghost").style.backgroundColor = Rcolz[defense_weak[13]];
    document.getElementById("C_dragon").style.backgroundColor = Rcolz[defense_weak[14]];
    
    document.getElementById("D_normal").style.backgroundColor = Gcolz[defense_resist[0]];
    document.getElementById("D_fire").style.backgroundColor = Gcolz[defense_resist[1]];
    document.getElementById("D_water").style.backgroundColor = Gcolz[defense_resist[2]];
    document.getElementById("D_electric").style.backgroundColor = Gcolz[defense_resist[3]];
    document.getElementById("D_grass").style.backgroundColor = Gcolz[defense_resist[4]];
    document.getElementById("D_ice").style.backgroundColor = Gcolz[defense_resist[5]];
    document.getElementById("D_fight").style.backgroundColor = Gcolz[defense_resist[6]];
    document.getElementById("D_poison").style.backgroundColor = Gcolz[defense_resist[7]];
    document.getElementById("D_ground").style.backgroundColor = Gcolz[defense_resist[8]];
    document.getElementById("D_flying").style.backgroundColor = Gcolz[defense_resist[9]];
    document.getElementById("D_psychic").style.backgroundColor = Gcolz[defense_resist[10]];
    document.getElementById("D_bug").style.backgroundColor = Gcolz[defense_resist[11]];
    document.getElementById("D_rock").style.backgroundColor = Gcolz[defense_resist[12]];
    document.getElementById("D_ghost").style.backgroundColor = Gcolz[defense_resist[13]];
    document.getElementById("D_dragon").style.backgroundColor = Gcolz[defense_resist[14]];
}

//Bar Chart Code ____________________________________________________________
//(function($) {
  function generateBarGraph(wrapper) {
    // Set Up Values Array
    var values = [];

    // Get Values and save to Array
    $(wrapper + ' .bar').each(function(index, el) {
      values.push($(this).data('value'));
    });

    // Get Max Value From Array
    //var max_value = Math.max.apply(Math, values);

    // Set width of bar to percent of max value
    $(wrapper + ' .bar').each(function(index, el) {
      var bar = $(this),
          //value = bar.data('value'),
          value = bar.attr('data-value');
          percent = value;
      //percent = Math.ceil((value / max_value) * 100);
      // Set Width & Add Class
      bar.width(percent + '%');
      bar.addClass('in');
    });
      
            //////////////////////
//      d3.selectAll(wrapper + ' .bar').each(function() {
//        //values.push(d3.select(this).attr('data-value'));
//        var abc = d3.select(this);
//        var myVal = Math.ceil(abc.attr('data-value'));
//        console.log(myVal);
//        abc.classed('in',true);
//        abc.attr('width', myVal + 'px');
//      })
      //////////////////////
  }

  // Generate the bar graph on window load...
  $(window).on('load', function(event) {
    generateBarGraph('#dashboard-stats');
  });
//})(jQuery); // Fully reference jQuery after this point.
//____________________________________________________________________________

