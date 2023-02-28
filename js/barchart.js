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
      this.scale = _config.scale || 'category'
      this.title = _config.title || "Title Goes Here"
      this.showHabit = _config.showHabit
      this.colorPalet = _config.colorPalet || ['#f55d50', "#00b1b0","#fec84d","#e42256","#5b5b5b",'#f1e8d2',"#4c6a87","#91e3f0","#33a02c","#d9d9d9","#bc80bd"]
      this.initVis();
    }


    initVis() {
         // Calculate inner chart size. Margin specifies the space around the actual chart.
    this.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
    this.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;

    
    console.log("generating bar chart",this.data,this.showHabit)  
    // Construct scales, axes, and formats.
    let xDomain,xRange;
    let yDomain,yRange;
    if (this.scale == 'time'){
      xDomain = d3.extent(this.data,d => { return new Date(d[0], 0, 1)})
      xRange = [this.width/this.data.size/2, this.width-this.width/this.data.size/2]
      this.xScale = d3.scaleTime(xDomain, xRange)
      console.log(xDomain,xRange)
    }else if (this.scale == 'category'){      
      xDomain = d3.map(this.data,function(d) {return d[0]; });
      xRange = [0, this.width]
      this.xScale = d3.scaleBand(xDomain,xRange).padding( this.showHabit ? 0.2 : 0)
      console.log(xDomain,xRange)

    this.habitScale = d3.scaleBand()
    .domain(['-1','0','1'])
    .range([0,this.xScale.bandwidth()])
    .padding(0.1);
    }

    //.domain(xDomain)
    //.range(xRange)
    //const xzScale = d3.scaleBand(zDomain, [0, xScale.bandwidth()]).padding(zPadding);
    yDomain = [0,d3.max(this.data,d=>{
      if (this.showHabit){  
        let maxData = d3.max([d[1].get('-1'),d[1].get('0'),d[1].get('1')])
        return maxData
      }else{ // just get totals
        return d[1].get('total')
      }
    })] // posibly reverse??
    yRange = [this.height,0]
    if (yDomain[1] - yDomain[0] > 1000) { // if obver 1k difference switch to log scale
        yDomain[0] = 1
        this.yScale = d3.scaleLog(yDomain, yRange)
    }else{
        this.yScale = d3.scaleLinear(yDomain, yRange).nice();
    }
    

    // Set up habit scale TODO: only when not time because ye
    
    
    // set up colors custom or not
    this.colorScale = d3.scaleOrdinal()
    .domain(xDomain)
    .range(this.colorPalet);

    this.habitColors = ["#bbbbbb","#ff6767","#91f09e"];
    this.habitColorScale = d3.scaleOrdinal()
    .domain(['-1','0','1'])
    .range(this.habitColors);

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
    this.xAxisG = this.chart.append('g')
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
        .attr('y', -10)
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
    console.log("updating",this.data)
    
    let xDomain, yDomain, xRange, yRange;
    if (this.scale == 'time'){
      xDomain = d3.extent(this.data,d => { return new Date(d[0], 0, 1)})
      this.xScale.domain(xDomain)
    }else if (this.scale == 'category'){      
      xDomain = d3.map(this.data,function(d) {return d[0]; });
      this.xScale.domain(xDomain).padding( this.showHabit ? 0.2 : 0)
      
      this.habitScale = d3.scaleBand()
      .domain(['-1','0','1'])
      .range([0,this.xScale.bandwidth()])
      .padding(0.1);
    }

    yDomain = [0,d3.max(this.data,d=>{
      if (this.showHabit){  
        let maxData = d3.max([d[1].get('-1'),d[1].get('0'),d[1].get('1')])
        return maxData
      }else{ // just get totals
        return d[1].get('total')
      }
    })]

    yRange = [this.height,0]
    if (yDomain[1] - yDomain[0] > 1000) { // if obver 1k difference switch to log scale
        yDomain[0] = 1
        this.yScale = d3.scaleLog()
        this.yScale.domain(yDomain).range(yRange)
    }else{
        this.yScale = d3.scaleLinear();
        this.yScale.domain(yDomain).range(yRange).nice();
    }
  

    this.xTitle.text(this.xLabelText)
    this.yTitle.text(this.yLabelText)
    this.cTitle.text(this.title)


    this.renderVis()
  }

  renderVis() {
    // ACTUAL CHART UPDATING
    if (this.showHabit) {
      this.chart.append('g')
      .selectAll('g')
      .data(this.data)
      .enter()
      .append('g')
      .attr("transform", (d) => {
        return "translate(" + this.xScale(d[0]) + ",0)"; })
      .selectAll('rect')
      .data((d) => {
        d[1].delete('total')
        return d[1]
      })
      .join(
        (enter) =>{
          return enter
        .append('rect') // can replace this enter with joinI think
        .attr('class','bar')
        .attr('x', (d) =>{
          //console.log("testX",d)
          let zShift = this.habitScale(d[0])
              //console.log("gotzshift",d[0],zShift)
          return zShift
        })
        .attr('width',this.habitScale.bandwidth()) // set default trans
        .style('fill', (d) =>{
          let color = this.habitColorScale(d[0])
          return color
        })
        .attr('y',this.height)
        .attr('height',0)

        },
        (update) => {
          return update
        },
        (exit) => {
          return exit.remove()
        });
      
      this.bars = this.chart.selectAll('.bar');
      this.bars.transition()
      .attr('y', (d) => {
        //console.log('y?',d)
        return this.yScale(d[1])
      })
      .attr('height', (d) =>{
        //console.log("height?",d[1], this.height -this.yScale(d[1]))
        return this.height - this.yScale(d[1]) 
      })
      .attr('opacity',1)
    
    } else{
      this.bars = this.chart.selectAll('.bar')
      .data(this.data)
      .join(
        (enter) =>{
          return enter
          .append("rect")
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
          .attr("width", d => {
            return this.width / this.data.size - 4
          }) 
          .attr("fill", d => {
            if (this.scale == 'time') {
              return "#93b3a7"
            } else{
              let color = this.colorScale(d[0])
              return color
            }
          })
          .attr('y',this.height)
          .attr('height',0)
        },
        (update) =>{
          return update;
        },
        (exit) =>{
          console.log("exiting")
          return exit.remove();
        }
      ) // move tootltip stuff here
      .on('mouseover', (event,d) => {
        let xOutput;
        let yOutput;
        if (this.scale == 'time'){
          xOutput = d[0];
        } else{ // just category for now
          if (this.showHabit){
            let dom = ['-1','0','1']
            let ran = ['Unkown', 'Uninhabitable', 'Habitable']
            xOutput = ran[dom.indexOf(d[0])]
          } else{
            xOutput = d[0]
          }
         
        }
        if (this.showHabit){
          yOutput = d[1]
        } else{
          yOutput = d[1].get('total');
        }

        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + this.config.tooltipPadding) + 'px')   
          .style('top', (event.pageY + this.config.tooltipPadding) + 'px')
          .html( (d) => {
            if (this.showHabit){
              return(`
              <div><b>Habitable Zone:</b> ${xOutput}</div>
              <div><b>Count:</b> ${yOutput}</div>
              `)
            }else{
            return(`
              <div><b>${this.xLabelText}:</b> ${xOutput}</div>
              <div><b>Number of ${this.yLabelText}:</b> ${yOutput}</div>
              `)
            }
          })
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });

      this.bars.transition() // actual updating transition
      .attr("y", d => {
        let totalHeight = d[1].get('total')
        //console.log("not showhabitY",d,d[1],d[1].get('total'),totalHeight,this.yScale(totalHeight))
        return this.yScale(totalHeight)
      })
      .attr("height", (d) => {
        let totalHeight = d[1].get('total')
        //console.log("not height",d,d[1],d[1].get('total'))
        let scaledHeight = this.height - this.yScale(totalHeight)
        return scaledHeight
      })
      .attr('opacity',1)
      }
      
      

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