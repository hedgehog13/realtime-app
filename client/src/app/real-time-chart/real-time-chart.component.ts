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
import * as d3Scale from 'd3-scale';

import {NgxChartsModule} from '@swimlane/ngx-charts';

import {IGameDataModel, IGamesModel} from "./gameData.model";


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
  parseDate = d3.timeParse('%d-%m-%Y');
  private svgElement: HTMLElement;
  private chartProps: any;
  private svg;
  legendKeys = [];
  gamesArray: IGamesModel[] = [];
  // Set the dimensions of the canvas / graph
  margin = {top: 30, right: 20, bottom: 30, left: 50};
  width = 800 - this.margin.left - this.margin.right;
  height = 560 - this.margin.top - this.margin.bottom;

  @Input()
  oneGameForChart: IGameDataModel;

  /*ngx-chart chart options
    view: any[] = [1000, 500];
    legend: boolean = true;
    showLabels: boolean = true;
    animations: boolean = true;
    xAxis: boolean = true;
    yAxis: boolean = true;
    showYAxisLabel: boolean = true;
    showXAxisLabel: boolean = true;
    xAxisLabel: string = 'Time';
    yAxisLabel: string = 'Counter';
    timeline: boolean = true;

    colorScheme = {
      domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
    };
    test = [];

  ngx-chart chart options*/


  constructor() {
  }

  ngOnInit(): void {

  }

  ngOnChanges() {
    if (this.oneGameForChart) {
      this.createGameArray();
      this.updateChart();

    } else {
      this.buildChart();
      this.addLegend();
    }


  }

  createGameArray() {
    const index = this.gamesArray.findIndex(game => game.game_id === this.oneGameForChart.game_data.id);

    if (index < 0) {

      this.gamesArray.push({
        game_id: this.oneGameForChart.game_data.id,
        game_data: [...[this.oneGameForChart]],
        game_name: this.oneGameForChart.game_data.name
      })
    } else {
      this.gamesArray[index].game_data.push(this.oneGameForChart)
    }

  }

  buildChart() {

    this.chartProps = {};

    // Set the ranges
    this.chartProps.x = d3.scaleTime().range([0, this.width]);
    this.chartProps.y = d3.scaleLinear().range([this.height, 0]);


    // Define the axes
    const xAxis = d3.axisBottom(this.chartProps.x);
    const yAxis = d3.axisLeft(this.chartProps.y).ticks(5);

    this.svg = d3.select(this.chartElement.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom+40);

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

    // Scale the range of the data
    this.chartProps.x.domain(
      d3.extent([new Date().getTime()]));
    this.chartProps.y.domain([0, this.height]);


    // Add the X Axis
    this.svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${this.height})`)
      .call(xAxis);

    // Add the Y Axis
    this.svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);


    // Setting the required objects in chartProps so they could be used to update the chart
    this.chartProps.svg = this.svg;
    this.chartProps.xAxis = xAxis;
    this.chartProps.yAxis = yAxis;


  }

  addPathSelector() {
    this.gamesArray.forEach((game, index) => {
      if (d3.select(`#path_${index + 1}`).empty()) {

        this.svg.append('path')
          .attr('class', `line line${index + 1}`)
          .style('stroke', this.color)
          .style('fill', 'none')
          .attr('id', `path_${index + 1}`)
      }
    })
  }

  addLegend() {

    const legendKeys = this.gamesArray.map(a => a.game_name);
    const legendG = this.svg.selectAll(".legend")
      .data(legendKeys, (d) => d)

    let legendEnter = legendG.enter();

    legendEnter = legendEnter.append("g")
      .attr("class", "legend");

    //Now merge Enter and Update and adjust the location
    legendEnter.merge(legendG)
      .attr("transform", (d, i) => {
        return "translate(" + (this.width = this.margin.left / 2) + ","
          + (i * 15 + this.height + 20) + ")";
      })
      .attr("class", "legend");

    legendG.exit().remove();

    // Apend only to the enter selection
    legendEnter.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill",  (d, i)=> {
        return this.color[i];
      });

    // Apend only to the enter selection
    legendEnter.append("text")
      .text((d) => d)
      .style("font-size", 14)
      .attr("y", 12)
      .attr("fill", (d, i) => this.color[i])
      .attr("x", 14);

  }

  updateChart() {
    this.addPathSelector();
    this.addLegend();
    const yDomainArray = this.gamesArray.map(game => game.game_data
      .map(data => data.counter)
      .reduce(a => Math.max(a)))
      .map(value => {
        const log = Math.round(Math.log10(value));
        switch (log) {
          case 1:
           return value + 1;
          case 2:
           return value + 10;
          case 3:
           return value + 100;
          case 4:
          case 5:
           return value + 1000;
        }
      }).sort((a, b) => a - b);

    this.chartProps.y = d3.scaleLinear()
      .domain([0, ...yDomainArray]).nice()
      .range([this.height-this.margin.top, (this.height-this.margin.top)/2,150, 0])



    this.gamesArray.forEach((game, index) => {

      // Scale the range of the data again
      this.chartProps.x.domain(d3.extent(game.game_data, (d) => new Date(d.date).getTime()));
      const a = this.createValueLine();


      //   // Make the changes to the line chart
      this.chartProps.svg.select(`.line.line${index + 1}`) // update the line
        .style('stroke', this.color[index])
        .style('fill', 'none')
        .attr('d', a(game.game_data))

    });
    //  this.chartProps.y.domain(this.gamesArray.map(a=>a.category));
    this.chartProps.svg.transition();
    this.chartProps.svg.select('.x.axis') // update x axis
      .call(this.chartProps.xAxis);

    this.chartProps.svg.select('.y.axis') // update y axis
      .call(this.chartProps.yAxis);

  }

  createValueLine() {
    return d3.line<IGameDataModel>()
      .x((data) => {
        return this.chartProps.x(new Date(data.date).getTime())
      })
      .y((data) => {
        return this.chartProps.y(data.counter)
      });
  }

  getLastUpdated() {
    // if (this.oneGameForChart) {
    //
    //   const index = this.test.findIndex(game => game.name === this.oneGameForChart.game_data.id);
    //   const mappedItem = {
    //     name: Math.round(new Date(this.oneGameForChart.date).getTime()),
    //     value: this.oneGameForChart.counter,
    //   };
    //   if (index < 0) {
    //
    //     this.test.push({
    //       name: this.oneGameForChart.game_data.id,
    //       series: [mappedItem]
    //     })
    //   } else {
    //     this.test[index].series.push(mappedItem)
    //   }
    //  // this.test = this.test.filter(item=>item.name!="460630")
    //   this.test = [...this.test]
    //
    // }

  }


}
