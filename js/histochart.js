class Histogram {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 600,
        containerHeight: _config.containerHeight || 400,
        margin: _config.margin || {top: 50, right: 30, bottom: 50, left: 45},
        tooltipPadding: _config.tooltipPadding || 15
      }
      this.data = _data;
      this.type = _config.chartType // 'grouped' or 'single' bar chart 'grouped' is not implemented yet
      this.xLabel = _config.xLabel
      this.yLabel = _config.yLabel
      this.xLabelText = _config.xLabelText
      this.yLabelText = _config.yLabelText
      this.scale = _config.scale || 'distance'
      this.title = _config.title || "Title Goes Here"
      this.showHabit = _config.showHabit || false
      this.bins = _config.bins || 20
      this.colorPalet = _config.colorPalet || ['#f55d50', "#00b1b0","#fec84d","#e42256","#5b5b5b",'#f1e8d2',"#4c6a87","#91e3f0","#33a02c","#d9d9d9","#bc80bd"]
      this.initVis();
    }


    initVis() {
         // Calculate inner chart size. Margin specifies the space around the actual chart.
    this.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
    this.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;

    
    //console.log("generating histogram",this.data)  
    // Construct scales, axes, and formats.
    let xDomain,xRange;
    let yDomain,yRange;

    xDomain = d3.extent(this.data) // data is one big array
    xRange = [0, this.width]
    this.xScale = d3.scaleLinear(xDomain,xRange)
    console.log(xDomain,xRange)

    yRange = [this.height,0]
    this.yScale = d3.scaleLinear().range(yRange)
    
    // set up colors custom or not
    this.xAxis = d3.axisBottom(this.xScale)
    //.tickFormat();
    this.yAxis = d3.axisLeft(this.yScale)
    .ticks(null,">,~d")
  
    this.svg = d3.select(this.config.parentElement)
        .attr('width', this.config.containerWidth)
        .attr('height', this.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    this.chart = this.svg.append('g')
        .attr('transform', `translate(${this.config.margin.left},${this.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    this.xAxisG = this.chart.append('g') // may need to change this
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${this.height})`);
    
    // Append y-axis group
    this.yAxisG = this.chart.append('g')
        .attr('class', 'axis y-axis');

    // Append both axis titles
    this.xTitle = this.chart.append('text')
        .attr('class', 'axis-title')
        .attr('y', this.height +30)
        .attr('x', this.width )
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(this.xLabelText);

    this.yTitle = this.chart.append('text')
        .attr('class', 'axis-title')
        .attr('x', -40)
        .attr('y', -15)
        .attr('dy', '.71em')
        .text(this.yLabelText);


    // chart title
    this.cTitle = this.chart.append("text")
    .attr("x", this.width / 2 )
    .attr("y", 11)
    .style("text-anchor", "middle")
    .text(this.title);
  }

  updateVis(){
    this.histogram = d3.histogram()
    .value((d) => {
      return d
    })
    .domain(this.xScale.domain())
    .thresholds(this.xScale.ticks(this.bins))

    this.bars = this.histogram(this.data);

    this.yScale.domain(([0, d3.max(this.bars, function(d) { return d.length; })]))
    

    //this.xTitle.text(this.xLabelText)
    //this.yTitle.text(this.yLabelText)
    //this.cTitle.text(this.title)


    this.renderVis()
  }

  renderVis() {
    // ACTUAL CHART UPDATING
    this.hisRects = this.chart.selectAll("rect")
        .data(this.bars)

    // Manage the existing bars and eventually the new ones:
    this.hisRects
        .enter()
        .append("rect") // Add a new rect for each new elements
        .merge(this.hisRects) // get the already existing elements as well
        .transition() // and apply changes to all of them
        .duration(500)
          .attr("x", 1)
          .attr("transform", (d) => { return "translate(" + this.xScale(d.x0) + "," + this.yScale(d.length) + ")"; })
          .attr("width", (d) => { return this.xScale(d.x1) - this.xScale(d.x0) -1 ; })
          .attr("height", (d) => { return this.height - this.yScale(d.length); })
          .style("fill", this.colorPalet[0])


    // If less bar in the new histogram, I delete the ones not in use anymore
    this.hisRects
        .exit()
        .remove()

    this.hisRects
      .on('mouseover', (event,d) => {
        console.log("mouseover",d)
        let xOutput ='test'
        let yOutput ='test'
       
        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + this.config.tooltipPadding) + 'px')   
          .style('top', (event.pageY + this.config.tooltipPadding) + 'px')
          .html( (d) => {
            console.log('tipd',d)
            return(`
              <div><b>hm</b> ${xOutput}</div>
              <div>hm</b> ${yOutput}</div>
              `)
          })
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });

      

    this.xAxisG
    .call(this.xAxis)
    .selectAll('text')
    .attr("transform", (text) => {
      if (text && text.length > 5){
        return "rotate(-10)"
      } 
    })
    .call(g => g.select('.domain').remove());


    this.yAxisG
    .transition()
    .duration(500)
    .call(this.yAxis);
    

  }
}