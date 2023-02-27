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
        margin: _config.margin || {top: 50, right: 30, bottom: 50, left: 45},
        tooltipPadding: _config.tooltipPadding || 15
      }
      this.data = _data;
      this.type = _config.chartType // 'grouped' or 'single' bar chart 'grouped' is not implemented yet
      this.xLabel = _config.xLabel
      this.yLabel = _config.yLabel
      this.xLabelText = _config.xLabelText
      this.yLabelText = _config.yLabelText
      this.scale = _config.scale
      this.title = _config.title
      this.showHabit = _config.showHabit
      this.initVis();
    }


    initVis() {
         // Calculate inner chart size. Margin specifies the space around the actual chart.
    this.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
    this.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;

    console.log("generating bar chart",this.data)  
    
    
    // Construct scales, axes, and formats.
    if (this.scale == 'time'){
      const xDomain = d3.extent(this.data,d => { return new Date(d[0], 0, 1)})
      const xRange = [this.width/this.data.size/2, this.width-this.width/this.data.size/2]
      this.xScale = d3.scaleTime(xDomain, xRange)
      console.log(xDomain,xRange)
    }else if (this.scale == 'category'){      
      const xDomain = d3.map(this.data,function(d) {return d[0]; });
      const xRange = [0, this.width]
      this.xScale = d3.scaleBand(xDomain,xRange)
      console.log(xDomain,xRange)
      console.log(this.xScale('G'),this.xScale('F'))
    }

    //.domain(xDomain)
    //.range(xRange)
    //const xzScale = d3.scaleBand(zDomain, [0, xScale.bandwidth()]).padding(zPadding);
    let yDomain = [0,d3.max(this.data,d=>{
      // if self.showHabit??
      
      return d[1].get('total')
    })] // posibly reverse??
    let yRange = [this.height,0]
    if (yDomain[1] - yDomain[0] > 1000) { // if obver 1k difference switch to log scale
        yDomain[0] = 1
        this.yScale = d3.scaleLog(yDomain, yRange)
    }else{
        this.yScale = d3.scaleLinear(yDomain, yRange).nice();
    }
    console.log('Ydom',yDomain,yRange)
    
    //const zScale = d3.scaleOrdinal(zDomain, colors);
    this.xAxis = d3.axisBottom(this.xScale)
    //.tickFormat();
    this.yAxis = d3.axisLeft(this.yScale)
    .ticks(null,"~s")
  
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
        .attr('y', this.height +40)
        .attr('x', this.width + 30)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(this.xLabelText);

    this.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 1)
        .attr('y', 15)
        .attr('dy', '.71em')
        .text(this.yLabelText);


    // chart title
    this.svg.append("text")
    .attr("x", this.width / 2 )
    .attr("y", 11)
    .style("text-anchor", "middle")
    .text("Title of Graph");
  }

  updateVis(){
    // TODO: make mouse change onhover with elements to click
    this.bars = this.chart.selectAll('.bar')
    .data(this.data)
    .join("rect")
      .attr('class', 'bar')
      .attr("x", d => {
        //console.log(this.xScale(d[this.xLabel]))
        if (this.scale == 'time'){
          let xDate = new Date(d[0], 0, 1)
          return this.xScale(xDate) - (this.width/this.data.size/2) +2; 
        }else if (this.scale == 'category'){
          //console.log("bandscale",d[this.xLabel],this.xScale(d[this.xLabel]))
          return this.xScale(d[0]); 
        } 
        //return this.xScale(d[this.xLabel]) -2
      })
      .attr("y", d => {
        if (this.showHabit){ //TODO: make this a tripple stacked bar
          let totalHeight = d[1].get('total')
          return this.yScale(totalHeight)
        }else{
          let totalHeight = d[1].get('total')
          return this.yScale(totalHeight)
        }
      })
      .attr("width", d => {
        return this.width / this.data.size - 4
      })
      .attr("height", (d) => {
        let totalHeight = d[1].get('total')
        let scaledHeight = this.height - this.yScale(totalHeight)
        return scaledHeight
      })
        
      .attr("fill", d => {
        return '#00000'
      } ); //color??

  
      this.bars
      .on('mouseover', (event,d) => {
        //console.log("mouse",d[this.xLabel],d[this.yLabel])
        let xOutput;
        let yOutput;
        if (this.scale == 'time'){
          xOutput = d[0];
        } else{ // just category for now
          xOutput = d[0]
        }

        yOutput = d[1].get('total');
        if (this.showHabit){

        } else{
          yOutput = d[1].get('total');
        }
        console.log(d[1],yOutput)

        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + this.config.tooltipPadding) + 'px')   
          .style('top', (event.pageY + this.config.tooltipPadding) + 'px')
          .html(`
            <div><b>${this.xLabelText}:</b> ${xOutput}</div>
            <div><b>Number of ${this.yLabelText}:</b> ${yOutput}</div>
          `);
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
    .call(this.yAxis)
    

  }
}