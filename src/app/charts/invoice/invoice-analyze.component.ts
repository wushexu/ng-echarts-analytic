import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';

import * as echarts from 'echarts';

import {DataService, Option} from '../../data/DataService';
import {query, CubeDimension, Cube, cubes} from '../../data/olap';
import {EChartOption} from 'echarts';
import {GenericChartComponent, DimOption, MeasureOption} from '../common/generic-chart.component';

@Component({
  selector: 'app-invoice-analyze',
  templateUrl: './invoice-analyze.component.html',
  styleUrls: ['./invoice-analyze.component.css']
})
export class InvoiceAnalyzeComponent extends GenericChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') chartDiv: ElementRef;

  cube: Cube = cubes.simple;

  selectedDim = 'cat';
  selectedDim2 = '';
  selectedMeasure = 'zj';

  fhDateFilter: '' | '1d' | '1w' = '1d';
  catFilter = '';
  fhsfFilter = '';
  shsfFilter = '';


  constructor(protected dataService: DataService) {
    super(dataService);
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
