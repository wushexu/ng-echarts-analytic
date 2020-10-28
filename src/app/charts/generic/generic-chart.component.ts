import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';

import * as echarts from 'echarts';

import {DataService} from '../../data/DataService';
import {FieldDef, TableKeys, TableDef, Tables, TableMap} from '../../data/schema';
import {query, CubeDimension, Cube, cubes} from '../../data/olap';
import {EChartOption} from 'echarts';

interface DimOption {
  name: string;
  label: string;
  selected?: boolean;
  dimension: CubeDimension;
}

interface MeasureOption {
  name: string;
  label: string;
  selected?: boolean;
  field: FieldDef;
}

@Component({
  selector: 'app-generic-chart',
  templateUrl: './generic-chart.component.html',
  styleUrls: ['./generic-chart.component.css']
})
export class GenericChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') chartDiv: ElementRef;

  dimOptions: DimOption[] = [];
  measureOptions: MeasureOption[] = [];
  chartType = 'bar';
  // dateDims = [];
  cube: Cube = cubes.simple;

  myChart: echarts.ECharts;

  constructor(private dataService: DataService) {
  }

  ngOnInit(): void {
    this.dimOptions = [];
    this.cube.dimensions.forEach(dim => {
      let option: DimOption = {name: dim.name, label: dim.desc, dimension: dim};
      this.dimOptions.push(option);
    });

    this.measureOptions = [];
    this.cube.measures.forEach(mea => {
      this.measureOptions.push({name: mea.name, label: mea.desc, field: mea});
    });
  }

  ngAfterViewInit(): void {

    this.refreshChart();
  }

  refreshChart(): void {
    if (!this.chartDiv) {
      return;
    }
    if (this.myChart) {
      this.myChart.clear();
    }

    const holder: HTMLDivElement = this.chartDiv.nativeElement as HTMLDivElement;
    this.myChart = echarts.init(holder);

    let dims = this.dimOptions.filter(opt => opt.selected).map(opt => opt.dimension.name);
    if (dims.length === 0) {
      return;
    }
    let measures = this.measureOptions.filter(opt => opt.selected).map(opt => opt.field.name);
    if (measures.length === 0) {
      return;
    }

    console.log('dims: ' + dims);
    console.log('measures: ' + measures);
    let dataset = query({dims, measures, slice: {发货时间: '2020/9/16'}});
    console.log(dataset.source.length);
    console.log('result dimensions: ' + JSON.stringify(dataset.dimensions, null, 2));

    const option: EChartOption = {
      legend: {},
      tooltip: {},
      dataset,
      xAxis: {type: 'category'},
      yAxis: {},
      series: measures.map((name) => ({type: this.chartType}))
    };

    this.myChart.setOption(option);
  }

}
