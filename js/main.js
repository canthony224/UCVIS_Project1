/**
 * Load data from CSV file asynchronously and render scatter plot
 */
let data, scatterplot, barchart;
d3.csv('data/exoplanets.csv')
  .then(_data => {
    data = _data;
    
    // Convert year into data
    


    sortedData = data.sort((a, b) => d3.ascending(a.disc_year, b.disc_year));
    
    let groupByYearDate = d3.rollup(
      sortedData,
      (group) => group.length, // grab count of group?
      (label) => label.disc_year, // what to group them by?
    );

    groupByYearDate = Array.from(groupByYearDate, ([year, count]) => ({ year, count })); // converts rollup data to object array
    groupByYearDate.forEach(d => { // convert year to date
    d.year = new Date(d.year, 0, 1)
    });
    //console.log("grouped",groupByYearDate)

    discoveryPerYear = new BarChart({
      'parentElement': '#discVis',
      'type': 'single',
      'xLabel': 'year',
      'yLabel': 'count',
      'xLabelText': 'Year',
      'yLabelText': 'Discoveries',
      'scale': 'time',
      'containerWidth': 900,
      'containerHeight': 500
    },groupByYearDate)

    //sortedData = data.sort((a, b) => d3.ascending(a.disc_year, b.disc_year));
    
    let groupByStarCount = d3.rollup(
      data,
      (group) => group.length, // grab count of group?
      (label) => label.sy_snum, // what to group them by?
    );
    groupByStarCount = Array.from(groupByStarCount, ([xLabel, count]) => ({ xLabel, count })); // converts rollup data to object array

    planetsPerStar = new BarChart({
      'parentElement': '#starCount',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Number of stars',
      'yLabelText': 'Exoplanets',
      'scale': 'category',
      'containerWidth': 900,
      'containerHeight': 500
    },groupByStarCount)


    let groupByPlanetCount = d3.rollup(
      data,
      (group) => group.length, // grab count of group
      (label) => label.sy_pnum, // what to group them by
    );
    groupByPlanetCount = Array.from(groupByPlanetCount, ([xLabel, count]) => ({ xLabel, count })); // converts rollup data to object array

    planetsPerPlanet = new BarChart({
      'parentElement': '#planetCount',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Number of Planets',
      'yLabelText': 'Exoplanets',
      'scale': 'category',
      'containerWidth': 900,
      'containerHeight': 500
    },groupByPlanetCount)


    //(Format spectral type to just the first letter type:
    //https://en.wikipedia.org/wiki/Stellar_classification <- how to classify
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
    
    const typeFiltered = data.filter(d => d.starType != "Unknown"); // filter out unkown star types for now
    let groupByStarType = d3.rollup(
      typeFiltered,
      (group) => group.length, // grab count of group
      (label) => label.starType, // what to group them by
    );
    groupByStarType = Array.from(groupByStarType, ([xLabel, count]) => ({ xLabel, count })); // converts rollup data to object array

    planetsPerStarType = new BarChart({
      'parentElement': '#starTypeCount',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Star Spectral Type',
      'yLabelText': 'Exoplanets',
      'scale': 'category',
      'containerWidth': 900,
      'containerHeight': 500
    },groupByStarType)

    
    let groupByDiscMethod = d3.rollup(
      data,
      (group) => group.length, // grab count of group
      (label) => label.discoverymethod, // what to group them by
    );
    groupByDiscMethod = Array.from(groupByDiscMethod, ([xLabel, count]) => ({ xLabel, count })); // converts rollup data to object array
    planetsPerDiscMethod = new BarChart({
      'parentElement': '#discoveryMethodCount',
      'type': 'single',
      'xLabel': 'xLabel',
      'yLabel': 'count',
      'xLabelText': 'Discovery Method',
      'yLabelText': 'Exoplanets',
      'scale': 'category',
      'containerWidth': 900,
      'containerHeight': 500
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
    //scatterplot.updateVis();
    //lineChart.updateVis()
  })


  .catch(error => console.error(error));


/**
 * Event listener: use color legend as filter
 */
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