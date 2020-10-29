import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {MatRadioChange} from '@angular/material/radio';

import * as echarts from 'echarts';

import {DataService, Option} from '../../data/DataService';
import {FieldDef} from '../../data/schema';
import {query, CubeDimension, Cube, cubes} from '../../data/olap';
import {EChartOption} from 'echarts';

interface DimOption {
  name: string;
  label: string;
  // selected?: boolean;
  dimension: CubeDimension;
}

interface MeasureOption {
  name: string;
  label: string;
  // selected?: boolean;
  field: FieldDef;
}

@Component({
  selector: 'app-generic-chart',
  templateUrl: './generic-chart.component.html',
  styleUrls: ['./generic-chart.component.css']
})
export class GenericChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') chartDiv: ElementRef;

  cube: Cube = cubes.simple;
  dimOptions: DimOption[] = [];
  dim2Options: DimOption[] = [];
  measureOptions: MeasureOption[] = [];
  catOptions: Option[];
  provOptions: Option[];

  chartType = 'bar';
  chartWidth = 1200;
  chartHeight = 400;
  chartColors = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];

  selectedDim = 'cat';
  selectedDim2 = '';
  selectedMeasure = 'zj';

  fhDateFilter: '' | '1d' | '1w' = '1d';
  catFilter = '';
  fhsfFilter = '';
  shsfFilter = '';

  myChart: echarts.ECharts;
  currentDataset: [];

  constructor(private dataService: DataService) {
  }

  ngOnInit(): void {
    this.dimOptions = [];
    this.dim2Options = [];
    this.cube.dimensions.forEach(dim => {
      let option: DimOption = {name: dim.name, label: dim.desc, dimension: dim};
      this.dimOptions.push(option);
      if (dim.name !== 'fhCity' && dim.name !== 'shCity') {
        this.dim2Options.push(option);
      }
    });

    this.measureOptions = [];
    this.cube.measures.forEach(mea => {
      this.measureOptions.push({name: mea.name, label: mea.desc, field: mea});
    });

    this.catOptions = this.dataService.catOptions;
    this.provOptions = this.dataService.provOptions;
  }

  ngAfterViewInit(): void {

    this.refreshChart();
  }

  dimSelected($event: MatRadioChange): void {
    this.selectedDim = $event.value;
    this.refreshChart();
  }

  dimSelected2($event: MatRadioChange): void {
    this.selectedDim2 = $event.value;
    this.refreshChart();
  }

  measureSelected($event: MatRadioChange): void {
    this.selectedMeasure = $event.value;
    this.refreshChart();
  }

  colorRollForward(): void {
    let colors = this.chartColors;
    let c = colors.shift();
    colors.push(c);
    this.refreshChart(true);
  }

  colorRollBackward(): void {
    let colors = this.chartColors;
    let c = colors.pop();
    colors.unshift(c);
    this.refreshChart(true);
  }

  resized(): void {
    this.refreshChart(true);
  }

  chartTypeChanged(): void {
    this.refreshChart(true);
  }


  refreshChart(keepData: boolean = false): void {
    if (!this.chartDiv) {
      return;
    }
    if (!this.selectedDim) {
      return;
    }
    if (!this.selectedMeasure) {
      return;
    }
    let dims = [this.selectedDim];
    if (this.selectedDim2 && this.selectedDim2 !== this.selectedDim) {
      dims.push(this.selectedDim2);
    }

    if (this.myChart) {
      // this.myChart.clear();
      this.myChart.dispose();
    }

    const holder: HTMLDivElement = this.chartDiv.nativeElement as HTMLDivElement;
    this.myChart = echarts.init(holder);

    let dataset;
    if (keepData && this.currentDataset) {
      dataset = this.currentDataset;
    } else {
      let slice: any = {};
      if (this.fhDateFilter) {
        if (this.fhDateFilter === '1d') {
          slice['发货日期'] = '2020/9/16';
        } else if (this.fhDateFilter === '1w') {
          slice['发货日期'] = {op: 'gt', val: '2020/9/13'};
        }
      }
      if (this.catFilter) {
        slice['cat'] = this.catFilter;
      }
      if (this.fhsfFilter) {
        slice['发货省份'] = this.fhsfFilter;
      }
      if (this.shsfFilter) {
        slice['收货省份'] = this.shsfFilter;
      }

      let measures = [this.selectedMeasure];
      dataset = query({dims, measures, slice});
      // console.log(dataset.source.length);
      // console.log('result dimensions: ' + JSON.stringify(dataset.dimensions, null, 2));

      this.currentDataset = dataset;
    }

    let series = [];
    if (dims.length > 1) {
      for (let di = 0; di < dataset.dimensions.length - 2; di++) {
        series.push({type: this.chartType});
      }
    } else {
      series.push({type: this.chartType});
    }

    const option: EChartOption = {
      color: this.chartColors,
      legend: {},
      tooltip: {
        trigger: 'axis'
      },
      toolbox: {
        show: true,
        feature: {
          // dataView: {show: true, readOnly: false},
          // magicType: {show: true, type: ['line', 'bar']},
          // restore: {show: true},
          saveAsImage: {show: true}
        }
      },
      dataset,
      xAxis: {type: 'category'},
      yAxis: {},
      series
    };

    this.myChart.setOption(option);
  }

}
