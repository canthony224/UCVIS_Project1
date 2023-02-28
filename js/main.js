/**
 * Load data from CSV file asynchronously and render scatter plot
 */
let data, scatterplot, barchart, viewHabitable, customChart,customChart2, selectedData, selectedData2
let groupByDiscMethod,groupByPlanetCount,groupByStarCount,groupByStarType, groupByYearDate;
let histoChart;
let all_barcharts = []


function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}


function myFunction2() {
  document.getElementById("myDropdown2").classList.toggle("show");
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}


function filterFunction2() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput2");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown2");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}


d3.csv('data/exoplanets.csv')
  .then(_data => {
    data = _data;
    
    // preprocess and get starCategories
    const starCategories = ['A','F','G','K','M'];
    data.forEach(d => { // convert year to date
      let starType = Array.from(d.st_spectype)[0];
      if (starType) {
        starType = starType.toUpperCase() // upper if there
        if (starCategories.includes(starType)) {
          d.starType = starType;
        }else{
          d.starType = "Unknown";
        }
      } else{
        d.starType = "Unknown";
      }
      });


    // function to get habitable from inhabitabel
    // 1 parsec = 206266.3 AU
    // conversion = x * 
    const habitableRanges = [[8.5,12.5],[1.5,2.2],[0.95,1.4],[0.38,0.56],[0.08,0.12]] // ranges for hability
    data.forEach(d => {
      let distanceFromStar = d['pl_orbsmax'] //in au
      if (d.starType != "Unknown"){
        let rangeCheck = habitableRanges[starCategories.indexOf(d.starType)]
        if (distanceFromStar >= rangeCheck[0] && distanceFromStar <= rangeCheck[1]){
          d.isHabitable = "1"
          //console.log("habitable!",d.starType,rangeCheck,distanceFromStar,d.sy_dist)
        }else{
          d.isHabitable = '0'
        }
      } else{
        d.isHabitable = "-1" //== unkown flag
      }
    })
    // Convert year into data
    function mapOutDataHabitable(data,column){ // counts groups of data (auto totals habitable)
      let outputMap = d3.rollup(
        data,
        (group) => group.length, // grab count of group?
        (label) => label[column], // what to group them by?
        (habit) => habit.isHabitable // Counts types of inhabitables
      );
      // gets and totals habitable
      outputMap.forEach((d,i) => { // convert year to date
        let total = 0
        d.forEach(element => {
          total += element;
        });
        d.set('total',total)
      });
      return outputMap
    }
    
    function mapDistance(data) {
      return d3.map(data,(d) =>{
        console.log(d)
        return d.sy_dist
      })
    }

    function mapScatter(data){
      return d3.map(data,(d) =>{
        console.log(d)
        return {'radius': d.pl_rade, 'mass': d.pl_bmass, 'name':d.pl_name}
      })
    }

    
    // convert to date and sort
    data.forEach((d) => { // convert year to date
      d.yearDate = new Date(d.disc_year, 0, 1)
    });
    
    sortedData = data.sort((a, b) => d3.ascending(a.disc_year, b.disc_year)); // sort by year first
    groupByYearDate = mapOutDataHabitable(sortedData,'disc_year')
    //console.log('gotgroup',groupByYearDate)
    discoveryPerYear = new BarChart({
      'parentElement': '#discVis',
      'type': 'single',
      'xLabel': 'year',
      'yLabel': 'count',
      'xLabelText': 'Year',
      'yLabelText': 'Discoveries',
      'scale': 'time',
      'containerWidth': 600,
      'containerHeight': 300,
      'title': "Discoveries Per Year",
      'showHabit': false
    },groupByYearDate)

    sortedData = data.sort((a, b) => d3.ascending(a.sy_snum, b.sy_snum)); // Can make dynamic
    groupByStarCount = mapOutDataHabitable(sortedData,'sy_snum')

    
    sortedData = data.sort((a, b) => d3.ascending(a.sy_snum, b.sy_pnum));
    groupByPlanetCount = mapOutDataHabitable(data,'sy_pnum')
    
    let typeFiltered = data.filter(d => d.starType != "Unknown"); // filter out unkown star types for now
    groupByStarType = mapOutDataHabitable(typeFiltered,'starType')

    groupByDiscMethod = mapOutDataHabitable(data,'discoverymethod')
    
    groupByDistance = mapDistance(data)
    console.log("group dist",groupByDistance)


    scatterGroup = mapScatter(data)

    selectedData = groupByStarCount;
    customChart = new BarChart({
      'parentElement': '#chartDown',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Number of stars',
      'yLabelText': 'Exoplanets',
      'scale': 'category',
      'containerWidth': 600,
      'containerHeight': 300,
      'title': "Exoplanets per Star Count",
      'showHabit': false
    },groupByStarCount)
    customChart.updateVis();

    // Second comparison chart
    selectedData2 = groupByPlanetCount
    customChart2 = new BarChart({
      'parentElement': '#chartDown2',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Number of Planets',
      'yLabelText': 'Exoplanets',
      'scale': 'category',
      'title': "Exoplanets per System Planets",
      'containerWidth': 600,
      'containerHeight': 300,
      'showHabit': false
    },groupByPlanetCount)


    histoChart = new Histogram({
      'parentElement': '#distoChart',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Distance From Earth',
      'yLabelText': 'Exoplanets',
      'scale': 'category',
      'containerWidth': 600,
      'containerHeight': 300,
      'title': "Exoplanets by Distance From Earth (parsecs)",
      'showHabit': false
    },groupByDistance)
    
  
    // scatter plot 
    scatterChart = new Scatterplot({
      'parentElement': '#sizeScatter',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Mass',
      'yLabelText': 'Radius',
      'scale': 'category',
      'containerWidth': 1200,
      'containerHeight': 400,
      'title': "Exoplanets by Distance From Earth (parsecs)",
      'showHabit': false
    }, scatterGroup)

    customChart.updateVis();
    customChart2.updateVis();
    discoveryPerYear.updateVis();
    histoChart.updateVis();
    scatterChart.updateVis();

    
    all_barcharts.push(customChart,customChart2)
    //scatterplot.updateVis();
    //lineChart.updateVis()

  })
  .catch(error => console.error(error));
  // paired ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"]
  // set3 ["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"]
  // custom ['#f55d50', "#00b1b0","#fec84d","#e42256","#5b5b5b",'#f1e8d2',"#4c6a87","#91e3f0","#33a02c","#d9d9d9","#bc80bd"]
  function updateAllChartData(column,value)  { // sets value of chart and updates it
    all_barcharts.forEach(chart => {
      chart[column] = value
      chart.updateVis()
    });
  }

  function updateChart(chart,column,value)  { // sets value of chart and updates it
    console.log("updating chart",chart,column)  
    chart[column] = value
    chart.updateVis()
  }

  function buildChart(chart,targ) {
    // ghetto fix: just remove all previous data
    
    //console.log('building',targ,customChart)
    if (targ == "sc"){ // star count
      chart.data = groupByStarCount;
      chart.xLabelText='Number of stars';
      chart.scale = 'category';
      chart.title = "Exoplanets Per Star Count";
      
    }else if(targ == "pc"){ // planet count
      chart.data = groupByPlanetCount;
      chart.xLabelText='Number of Planets';
      chart.scale = 'category';
      chart.title = "Exoplanets per System Planets";
     
    }else if(targ == "ot"){
      chart.data = groupByStarType;
      chart.xLabelText='Star Spectral Type';
      chart.scale = 'category';
      chart.title = "Exoplanets per Star Type";
      
    }else if(targ == "dm"){
      chart.data = groupByDiscMethod;
      chart.xLabelText='Discovery Method';
      chart.scale = 'category';
      chart.title = "Discovery Methods of Exoplanets";
     
    }
    chart.updateVis();
  }


/**
 * Event listener: use color legend as filter
 */

d3.selectAll('#viewHabit').on('click', function(e) {
  console.log('habit clicked')
  customChart.data = []
  console.log('custom chart updating')
  customChart.updateVis()
  console.log("custom chartsthuff")

  let checked = e.target.checked;
  console.log("chang habit",checked);
  customChart.data = selectedData
  updateChart(customChart,'showHabit',checked) // change to selected state
});


d3.selectAll('#viewHabit2').on('click', function(e) {
  console.log("habit2 clicked")
  customChart2.data = []
  customChart2.updateVis()

  let checked = e.target.checked;
  console.log("chang habit2",checked);
  customChart2.data = selectedData2
  updateChart(customChart2,'showHabit',checked) // change to selected state
});



d3.selectAll('#axisView').on('click', function(e) {
  customChart.data = []
  customChart.updateVis()

  let targ = e.target.getAttribute('data')
  if (targ == "sc"){ // star count
    selectedData = groupByStarCount
  }else if(targ == "pc"){ // planet count
    selectedData = groupByPlanetCount
  }else if(targ == "ot"){ // orbit type
    selectedData = groupByStarType
  }else if(targ == "dm"){ // discovery method
    selectedData = groupByDiscMethod
  }

  let myText = e.target.textContent
  dropbtn = document.getElementById("dropbutn");
  dropbtn.textContent = myText
  document.getElementById("myDropdown").classList.toggle("show");
  buildChart(customChart,targ)
});


d3.selectAll('#axisView2').on('click', function(e) {
  customChart2.data = []
  customChart2.updateVis()
  let targ = e.target.getAttribute('data')
  if (targ == "sc"){ // star count
    selectedData2 = groupByStarCount
  }else if(targ == "pc"){ // planet count
    selectedData2 = groupByPlanetCount
  }else if(targ == "ot"){ // orbit type
    selectedData2 = groupByStarType
  }else if(targ == "dm"){ // discovery method
    selectedData2 = groupByDiscMethod
  }

  let myText = e.target.textContent
  dropbtn = document.getElementById("dropbutn2");
  dropbtn.textContent = myText
  document.getElementById("myDropdown2").classList.toggle("show");
  buildChart(customChart2,targ)
});


 // Listener for bar select for histogram
 d3.select("#nBin").on("input", function() {
  console.log("setting bin count",this.value)
  updateChart(histoChart,'bins',this.value)
 });

d3.selectAll('.legend-btn').on('click', function() {
  // Toggle 'inactive' class
  d3.select(this).classed('inactive', !d3.select(this).classed('inactive'));
  
  // Check which categories are active
  let selectedDifficulty = [];
  d3.selectAll('.legend-btn:not(.inactive)').each(function() {
    selectedDifficulty.push(d3.select(this).attr('data-difficulty'));
  });

  // Filter data accordingly and update vis
  scatterplot.data = data.filter(d => selectedDifficulty.includes(d.difficulty));
  scatterplot.updateVis();
});