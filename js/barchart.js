class BarChart {

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
        margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35},
        tooltipPadding: _config.tooltipPadding || 15
      }
      this.data = _data;
      this.type = _config.chartType // 'grouped' or 'single' bar chart 'grouped' is not implemented yet
      this.xLabel = _config.xLabel
      this.yLabel = _config.yLabel
      this.xLabelText = _config.xLabelText
      this.yLabelText = _config.yLabelText
      this.scale = _config.scale
      this.initVis();
    }


    initVis() {
         // Calculate inner chart size. Margin specifies the space around the actual chart.
    this.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
    this.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;

    console.log("generating bar chart",this.data)
   
  
    
    
    // Construct scales, axes, and formats.
    if (this.scale == 'time'){
      const xDomain = d3.extent(this.data,d=>d[this.xLabel])
      const xRange = [this.width/this.data.length/2, this.width-this.width/this.data.length/2]
      this.xScale = d3.scaleTime(xDomain, xRange)
      console.log(xDomain,xRange)
    }else if (this.scale == 'category'){      
      const xDomain = d3.map(this.data,function(d) {return d.xLabel; });
      const xRange = [0, this.width]
      this.xScale = d3.scaleBand(xDomain,xRange)
      console.log(xDomain,xRange)
    }

    //.domain(xDomain)
    //.range(xRange)
    //const xzScale = d3.scaleBand(zDomain, [0, xScale.bandwidth()]).padding(zPadding);
    const yDomain = [0,d3.max(this.data,d=>d[this.yLabel])] // posibly reverse??
    const yRange = [this.height,0]
    this.yScale = d3.scaleLinear(yDomain, yRange);
    //const zScale = d3.scaleOrdinal(zDomain, colors);
    this.xAxis = d3.axisBottom(this.xScale);
    //.ticks()
    this.yAxis = d3.axisLeft(this.yScale)
    //.ticks()
  
    this.svg = d3.select(this.config.parentElement)
        .attr('width', this.config.containerWidth)
        .attr('height', this.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    this.chart = this.svg.append('g')
        .attr('transform', `translate(${this.config.margin.left},${this.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    this.xAxisG = this.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${this.height})`);
    
    // Append y-axis group
    this.yAxisG = this.chart.append('g')
        .attr('class', 'axis y-axis');

    // Append both axis titles
    this.chart.append('text')
        .attr('class', 'axis-title')
        .attr('y', this.height +15)
        .attr('x', this.width + 30)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(this.xLabelText);

    this.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '.71em')
        .text(this.yLabelText);
  }

  updateVis(){

    this.bars = this.chart.selectAll('.bar')
    .data(this.data)
    .join("rect")
      .attr('class', 'bar')
      .attr("x", d => {
          //console.log(this.xScale())
        //console.log(this.xScale(d[this.xLabel]))
        if (this.scale == 'time'){
          return this.xScale(d[this.xLabel]) - (this.width/this.data.length/2) +2; 
        }else if (this.scale == 'category'){
          console.log("bandscale",d[this.xLabel],this.xScale.bandwidth(d[this.xLabel]))
          return this.xScale.bandwidth(d[this.xLabel]); 
        } 
        //return this.xScale(d[this.xLabel]) -2
      })
      .attr("y", d => {
        //
        return this.yScale(d[this.yLabel])})
      .attr("width", d => {
        return this.width / this.data.length - 4
      })
      .attr("height", d => this.height - this.yScale(d[this.yLabel]))
      .attr("fill", d => {
        return '#00000'
      } ); //color??

  
      this.bars
      .on('mouseover', (event,d) => {
        console.log("mouse",d[this.xLabel],d[this.yLabel])
        let xOutput;
        let yOutput;
        if (this.scale == 'time'){
          xOutput = d[this.xLabel].getFullYear();
        } else{ // just category for now
          xOutput = d[this.xLabel]
        }
        
        yOutput = d[this.yLabel];
        console.log("tip",xOutput,yOutput);

        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + this.config.tooltipPadding) + 'px')   
          .style('top', (event.pageY + this.config.tooltipPadding) + 'px')
          .html(`
            <div class="tooltip-title">${xOutput}</div>
            <div>Number of Exoplanets: ${yOutput}</div>
          `);
      })
      .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
      });

    this.xAxisG
    .call(this.xAxis)
    .call(g => g.select('.domain').remove());

    this.yAxisG
    .call(this.yAxis)
    .call(g => g.select('.domain').remove())

  }
}