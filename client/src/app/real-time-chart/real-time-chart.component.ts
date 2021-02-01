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
  height = 470 - this.margin.top - this.margin.bottom;

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
      this.buildChart()
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
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    const main = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);


    // // in main group, add chart title
    main.append('text')
      .attr('class', 'chartTitle')
      .attr('x', this.width / 2)
      .attr('y', -20)
      .attr('dy', '.71em')
      .text((d) => 'Chart Title');
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


    this.legendKeys = this.gamesArray.map(item => item.game_name);

    if (d3.select('mydots').empty()) {
      this.svg.selectAll("mydots")
        .data(this.legendKeys)
        .enter()
        .append("circle")
        .attr("cx", this.width - this.margin.left - this.margin.right)
        .attr("cy", (d, i) => {
          return 100 + i * 25
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", (d, i) => this.color[i])
    }


    this.svg.selectAll("mylabels")
      .data(this.legendKeys)
      .enter()
      .append("text")
      .attr("x", this.width + 20 - this.margin.left - this.margin.right)
      .attr("y", (d, i) => {
        return 100 + i * 25
      })
      .style("fill", (d, i) => this.color[i])
      .text((d) => d)
      .attr("text-anchor", "right")
      .style("alignment-baseline", "middle");


  }

  updateChart() {
    this.addPathSelector();
    this.addLegend();
    // this.chartProps.y =d3.scaleLinear()
    //   .domain([0, 3])
    //   .range([0, 600]);
    const a = this.gamesArray.map((game, index) => {
      return {
        date: new Date().getTime(),
        category: `category${index + 1}`,
        counter: game.game_data.map(a => a.counter)
      }
    });
    this.gamesArray.forEach((game, index) => {

      // Scale the range of the data again
      this.chartProps.x.domain(d3.extent(game.game_data, (d) => {

        return new Date(d.date).getTime();

      }));
      // this.chartProps.y.domain([d3.min(game.game_data, (d) => {
      //   return Math.max(d.counter) - 100;
      // }), d3.max(game.game_data, (d) => {
      //   return Math.max(d.counter) + 100;
      // })]);

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
      .x((data) => this.chartProps.x(new Date(data.date).getTime()))
      .y((data) => this.chartProps.y(data.counter));
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
