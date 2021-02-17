import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';


import * as d3 from 'd3';


import {IGameDataModel} from "./gameData.model";


@Component({
  selector: 'app-real-time-chart',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './real-time-chart.component.html',
  styleUrls: ['./real-time-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RealTimeChartComponent implements OnInit {
  title = 'Multi-Series Line Chart';

  @ViewChild('chart', {static: true}) chartElement: ElementRef;

  color = d3.schemeCategory10;
  private chartProps: any;
  private svg;


  // Set the dimensions of the canvas / graph
  margin = {top: 30, right: 20, bottom: 30, left: 50};
  width = 700 - this.margin.left - this.margin.right;
  height = 470 - this.margin.top - this.margin.bottom;
  xAxis;
  mouseG;
  lines;
  glines;
  focus;
  @Input()
  oneGameForChart: IGameDataModel;

  @Input()
  newElement = [];

  a = [];
  newMappedArray = []


  constructor() {
  }

  ngOnInit(): void {

    this.buildChart();
    this.addLegend();

  }

  ngOnChanges() {

    if (this.newElement) {
      this.createGameArray();
      this.updateChartNew();

    } else {

    }
  }

  createGameArray() {

    this.a.push(...this.newElement);

    this.newMappedArray = d3.groups(
      this.a,
      o => o.name,
    ).map(([name, obj]) => {
      let values;
      values = obj.slice(-100);
      return {
        name,
        values
      }
    });
  }


  buildChart() {

    this.chartProps = {};


    // Set the ranges
    this.chartProps.x = d3.scaleTime().range([0, this.width]);
    this.chartProps.y = d3.scaleLinear().range([this.height, 0]);


    // Define the axes
    const xAxis = d3.axisBottom(this.chartProps.x);


    this.svg = d3.select(this.chartElement.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom + 40);

    const main = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);


    // // in main group, add chart title
    // main.append('text')
    //   .attr('class', 'chartTitle')
    //   .attr('x', this.width / 2)
    //   .attr('y', -20)
    //   .attr('dy', '.71em')
    //   .text((d) => 'Chart Title');
    //


    // Add the X Axis
    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${this.height})`)
      .call(xAxis);

    // Add the Y Axis
    this.svg.append('g')
      .attr('class', 'y axis')


    // Setting the required objects in chartProps so they could be used to update the chart
    this.chartProps.svg = this.svg;
    this.chartProps.xAxis = xAxis;
    // this.chartProps.yAxis = yAxis;
    this.lines = this.svg.append('g')
      .attr('class', 'lines');


    this.mouseG = this.svg.append("g")
      .attr("class", "mouse-over-effects")

    this.mouseG.append("path") // create vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "#A9A9A9")
      .style("stroke-width", '1px')
      .style("opacity", "0")
      .attr('transform', `translate(${this.margin.left},0)`);


    this.mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .attr('transform', `translate(${this.margin.left},0)`)
      .on('mouseout', () => { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line  text")
          .style("opacity", "0");


      })
      .on('mouseover', (d) => { // on mouse in show line, circles and text

        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line  text")
          .style("opacity", "1")
      })

      .on('mousemove', (event) => { // update tooltip content, line, circles and text when mouse moves

        this.chartProps.svg.selectAll(".mouse-per-line")

          .attr("transform", (d, i) => {
            const xDate = this.chartProps.x.invert(event.offsetX);// use 'invert' to get date corresponding to distance from mouse position relative to svg
            const bisect = d3.bisector((d) => d['date']).left; // retrieve row index of date
            const idx = bisect(d.values, xDate) - 1 < 0 ? 0 : bisect(d.values, xDate) - 1;


            d3.select(".mouse-line")

              .attr("d", () => {
                let data = "M" + this.chartProps.x(d.values[idx].date) + "," + (this.height);
                data += " " + this.chartProps.x(d.values[idx].date) + "," + 0;
                return data;
              });

            return "translate(" + this.chartProps.x(d.values[idx].date) + "," + this.chartProps.y(d.values[idx].counter) + ")";
          }).selectChild('text').text((d) => {
          const xDate = this.chartProps.x.invert(event.offsetX - this.margin.left);// use 'invert' to get date corresponding to distance from mouse position relative to svg
          const bisect = d3.bisector((d) => d['date']).left; // retrieve row index of date
          const idx = bisect(d.values, xDate) - 1 < 0 ? 0 : bisect(d.values, xDate) - 1;

          return d.values[idx].counter
        })


      });
  }


  addPathSelector() {
    const groups = d3.group(this.newMappedArray, (a) => a.name).entries();
    this.glines = this.lines.selectAll('.line-group')
      .data(groups)
      .enter()
      .append('g')
      .attr('class', 'line-group')
      .append('path')
      .attr('class', `line`)
      .style('stroke', this.color)
      .style('fill', 'none')
      .exit()
      .remove();


    let mousePerLine = this.mouseG.selectAll('.mouse-per-line')
      .data(this.newMappedArray)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
      .attr("class", "circle")
      .attr("r", 7)
      .style("stroke", (d, i) => {
        return this.color[i]
      })
      .style("fill", (d, i) => {
        return this.color[i]
      })
      .style("stroke-width", '1')
      .style("opacity", "0")
      .attr('transform', `translate(${this.margin.left},0)`);


    mousePerLine.append("text")
      .attr("transform", "translate(25,25)");


  }


  addLegend() {
    const testArr = this.newElement.sort((a, b) => b.counter - a.counter);
    const keys = d3.group(testArr, (a) => a.name).keys();

    const legendG = this.svg.selectAll(".legend")
      .data(keys, (d) => d);

    let legendEnter = legendG.enter();
    legendEnter = legendEnter.append("g")
      .attr("class", "legend");

    //Now merge Enter and Update and adjust the location
    legendEnter.merge(legendG)
      .attr("transform", (d, i) => {
        return "translate(" + (this.width / 2) + ","
          + (i * 15 + this.height + 20) + ")";
      })
      .attr("class", "legend");

    legendG.exit().remove();

    // Append only to the enter selection
    legendEnter.append("circle")
      .attr("class", "legend-node")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 6)
      .style("fill", (d, i) => {
        return this.color[i]
      })

      .attr("transform", `translate(${this.margin.right}, 4)`);
    // Apend only to the enter selection

    legendEnter.append("text")
      .attr("class", "legend-text")
      .attr("x", 6 * 2 + 2)
      .attr("y", 6)
      .style("fill", "#A9A9A9")
      .style("font-size", 14)
      .text(d => d)
      .attr("transform", `translate(${this.margin.right}, 4)`);


  }


  updateChartNew() {
    this.addPathSelector();
   // this.addLegend();
    let dates = [...new Set(this.newMappedArray[0].values.map(a => a.date))];

    this.chartProps.x
      .domain(d3.extent(dates, (d: number) => d));

    const xAxis = d3.axisBottom(this.chartProps.x)
      .ticks(d3.timeMillisecond
        .every(10));
    this.chartProps.xAxix = xAxis;


    const yDomainArray = this.newElement.map(a => a).sort((a, b) => a.counter - b.counter);
    //  yDomainArray[yDomainArray.length - 1] = yDomainArray[yDomainArray.length - 1] + this.margin.top + this.margin.bottom;
    this.chartProps.y = d3.scaleLinear()
      .range([this.height, this.height / 2 + 100, this.height / 3, 0])
      .domain([0, ...yDomainArray.map(a => a.counter)])
      .nice(25)


    this.chartProps.yAxis = d3.axisLeft(this.chartProps.y)
      .scale(this.chartProps.y)
      .tickValues([0, ...yDomainArray.map(a => a.counter)])
      .tickFormat((d: number, i) => {
        return [0, ...yDomainArray.map(a => a.name)][i];
      })
    ;

    const line = this.createValueLine();


    this.chartProps.svg.selectAll(`.line`)  //select line path within line-group , then bind new data
      .data(this.newMappedArray)
      .attr("stroke", (d, i) => this.color[i])
      .attr("stroke-width", 1.5)
      .attr('class', 'line')
      .attr("transform", `translate(${this.margin.left}, 0)`)
      .transition().duration(750)
      .attr('d', (d) => line(d.values))


    this.chartProps.svg.select('.x.axis') // update x axis
      .attr("transform", `translate(${this.margin.left}, ${this.height})`)
      .transition().duration(1000)
      .call(this.chartProps.xAxis);

    this.chartProps.svg.select('.y.axis')
      .attr("transform", `translate(${this.margin.left},0)`)// update y axis
      .call(this.chartProps.yAxis)
      .selectAll('text')
      .attr("transform", "rotate(-70)")
       .attr("y", 0 - 20)
       .attr("dy", "3em")
      .style("text-anchor", "end")

  }

  createValueLine() {
    return d3.line<any>()
      .x((data) => this.chartProps.x(data.date))
      .y((data) => this.chartProps.y(data.counter)).curve(d3.curveMonotoneX);

  }
}
