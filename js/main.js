/**
 * Load data from CSV file asynchronously and render scatter plot
 */
let data, scatterplot, barchart, viewHabitable;
let all_barcharts = []


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
    
    
    const viewHabitable = true;

    
    // convert to date and sort
    data.forEach((d) => { // convert year to date
      d.yearDate = new Date(d.disc_year, 0, 1)
    });
    
    sortedData = data.sort((a, b) => d3.ascending(a.disc_year, b.disc_year)); // sort by year first
    let groupByYearDate = mapOutDataHabitable(sortedData,'disc_year')
    //console.log('gotgroup',groupByYearDate)
    discoveryPerYear = new BarChart({
      'parentElement': '#discVis',
      'type': 'single',
      'xLabel': 'year',
      'yLabel': 'count',
      'xLabelText': 'Year',
      'yLabelText': 'Discoveries',
      'scale': 'time',
      'containerWidth': 900,
      'containerHeight': 500,
      'showHabit': false
    },groupByYearDate)

    sortedData = data.sort((a, b) => d3.ascending(a.sy_snum, b.sy_snum)); // Can make dynamic
    let groupByStarCount = mapOutDataHabitable(sortedData,'sy_snum')
    //console.log(groupByStarCount)
    //groupByStarCount = Array.from(groupByStarCount, ([xLabel, count]) => ({ xLabel, count })); // converts rollup data to object array

    planetsPerStar = new BarChart({
      'parentElement': '#starCount',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Number of stars',
      'yLabelText': 'Exoplanets',
      'scale': 'category',
      'containerWidth': 900,
      'containerHeight': 500,
      'showHabit': true
    },groupByStarCount)

    
    sortedData = data.sort((a, b) => d3.ascending(a.sy_snum, b.sy_pnum));
    let groupByPlanetCount = mapOutDataHabitable(data,'sy_pnum')
    //groupByPlanetCount = Array.from(groupByPlanetCount, ([xLabel, count]) => ({ xLabel, count })); // converts rollup data to object array

    planetsPerPlanet = new BarChart({
      'parentElement': '#planetCount',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Number of Planets',
      'yLabelText': 'Exoplanets',
      'scale': 'category',
      'containerWidth': 900,
      'containerHeight': 500,
      'showHabit': true
    },groupByPlanetCount)


    //(Format spectral type to just the first letter type:
    //https://en.wikipedia.org/wiki/Stellar_classification <- how to classif
    
    let typeFiltered = data.filter(d => d.starType != "Unknown"); // filter out unkown star types for now
  
    let groupByStarType = mapOutDataHabitable(typeFiltered,'starType')
    //groupByStarType = Array.from(groupByStarType, ([xLabel, count]) => ({ xLabel, count })); // converts rollup data to object array

    planetsPerStarType = new BarChart({
      'parentElement': '#starTypeCount',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Star Spectral Type',
      'yLabelText': 'Exoplanets',
      'scale': 'category',
      'containerWidth': 900,
      'containerHeight': 500,
      'showHabit': true
    },groupByStarType)

    
    let groupByDiscMethod = mapOutDataHabitable(data,'discoverymethod')
    //groupByDiscMethod = Array.from(groupByDiscMethod, ([xLabel, count]) => ({ xLabel, count })); // converts rollup data to object array
    planetsPerDiscMethod = new BarChart({
      'parentElement': '#discoveryMethodCount',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Discovery Method',
      'yLabelText': 'Exoplanets',
      'scale': 'category',
      'containerWidth': 900,
      'containerHeight': 500,
      'showHabit': true
    },groupByDiscMethod)


  /*
    scatterplot = new Scatterplot({ 
      'parentElement': '#size',
      'containerHeight': 500,
      'containerHeight': 800
    
    
    }, data);
    
    lineChart = new Line({ 
      'parentElement': '#unkown',
			'containerHeight': 500,
			'containerWidth': 800
    
    }, data);
  */
    discoveryPerYear.updateVis();
    planetsPerStar.updateVis();
    planetsPerPlanet.updateVis();
    planetsPerStarType.updateVis();
    planetsPerDiscMethod.updateVis();
    all_barcharts.push(discoveryPerYear,planetsPerStar,planetsPerStarType,planetsPerDiscMethod)
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

/**
 * Event listener: use color legend as filter
 */

d3.selectAll('#viewHabit').on('click', function(e) {
  let checked = e.target.checked;
  console.log("chang habit",checked);
  updateAllChartData('showHabit',checked) // change to selected state
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