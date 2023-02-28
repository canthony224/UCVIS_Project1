class Scatterplot {

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
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    this.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
    this.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;

    // Initialize scales
    this.colorScale = d3.scaleOrdinal() // get earth data
        .range(['#d3eecd', '#7bc77e', '#2a8d46']) // light green to dark green
        .domain(['Easy','Intermediate','Difficult']);

    this.xScale = d3.scaleLinear() // use log?
        .range([0, this.width]);

    this.yScale = d3.scaleLinear() // use log?
        .range([this.height, 0]);

    // Initialize axes
    this.xAxis = d3.axisBottom(this.xScale)
        .ticks(6)
        .tickSize(-this.height - 10)
        .tickPadding(10)
        .tickFormat(d => d); // more format?

    this.yAxis = d3.axisLeft(this.yScale)
        .ticks(6)
        .tickSize(-this.width - 10)
        .tickFormat(">,~d")
        .tickPadding(10);

    // Define size of SVG drawing area
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

    // Specificy accessor functions
    this.colorValue = d => d.difficulty;
    this.xValue = d => d.time;
    this.yValue = d => d.distance;
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    
    // Set the scale input domains
    this.xScale.domain([0, d3.max(this.data, this.xValue)]);
    this.yScale.domain([0, d3.max(this.data, this.yValue)]);

    // Add circles
    this.circles = this.chart.selectAll('.point')
        .data(this.data, d => d.trail)
      .join('circle')
        .attr('class', 'point')
        .attr('r', 4)
        .attr('cy', d => this.yScale(this.yValue(d)))
        .attr('cx', d => this.xScale(this.xValue(d)))
        .attr('fill', d => this.colorScale(this.colorValue(d)));


    // Tooltip event listeners
    this.circles
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('display', 'block')
            .style('left', (event.pageX + this.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + this.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-title">${d.trail}</div>
              <div><i>${d.region}</i></div>
              <ul>
                <li>${d.distance} km, ~${d.time} hours</li>
                <li>${d.difficulty}</li>
                <li>${d.season}</li>
              </ul>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });
    
    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    this.xAxisG
        .call(this.xAxis)
        .call(g => g.select('.domain').remove());

    this.yAxisG
        .call(this.yAxis)
        .call(g => g.select('.domain').remove())
  }

}