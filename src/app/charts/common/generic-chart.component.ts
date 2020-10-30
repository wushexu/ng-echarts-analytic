import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {MatRadioChange} from '@angular/material/radio';

import * as echarts from 'echarts';
import {EChartOption} from 'echarts';

import {DataService, Option} from '../../data/DataService';
import {FieldDef} from '../../data/schema';
import {CubeDimension, Cube, Dataset} from '../../data/olap';

export interface DimOption {
  name: string;
  label: string;
  // selected?: boolean;
  dimension: CubeDimension;
}

export interface MeasureOption {
  name: string;
  label: string;
  // selected?: boolean;
  field: FieldDef;
}

@Component({template: ''})
export abstract class GenericChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') chartDiv: ElementRef;

  cube: Cube;
  dimOptions: DimOption[] = [];
  dim2Options: DimOption[] = [];
  measureOptions: MeasureOption[] = [];
  catOptions: Option[];
  provOptions: Option[];

  chartType = 'bar';
  chartWidth = 1200;
  chartHeight = 400;
  transpose = false;
  chartColors = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];

  selectedDim = '';
  selectedDim2 = '';
  selectedMeasure = '';

  fhDateFilter: '' | '1d' | '1w' = '1d';
  catFilter = '';
  fhsfFilter = '';
  shsfFilter = '';
  limit: 0;
  overwriteDim1 = false;
  dim1Values = '';

  myChart: echarts.ECharts;
  currentDataset: Dataset;

  constructor(protected dataService: DataService) {
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

  transposeToggle(): void {
    this.refreshChart(true);
  }

  overwriteDim1Changed(): void {
    if (this.dim1Values === '') {
      return;
    }
    this.refreshChart(true);
  }

  dim1ValuesChanged(): void {
    this.refreshChart(true);
  }

  abstract buildDataset(dims): Dataset;

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

    if ((dims[0] === 'fhsf' && dims[1] === 'fhCity') || (dims[0] === 'shsf' && dims[1] === 'shCity')) {
      // 省份跟城市不能交叉
      if (this.chartType !== 'pie') {
        dims.shift();
      }
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
      // console.log(dataset.source.length);
      // console.log('result dimensions: ' + JSON.stringify(dataset.dimensions, null, 2));
      dataset = this.buildDataset(dims);
      this.currentDataset = dataset;
    }
    if (this.overwriteDim1 && this.dim1Values) {
      let values = this.dim1Values.split(/\r?\n/).map(v => v.trim()).filter(v => v.length > 0);
      let len = Math.min(dataset.source.length, values.length);
      if (len > 0) {
        let newData = [];
        for (let i = 0; i < len; i++) {
          let row = {...dataset.source[i]};
          row[dims[0]] = values[i];
          newData.push(row);
        }
        dataset = {...dataset};
        dataset.source = newData;
      }
    }

    if (this.chartType === 'pie' && dims.length === 2) {
      // 两级饼图

      let cubeDim1 = this.cube.getDimension(dims[0]);
      let cubeDim2 = this.cube.getDimension(dims[1]);

      let innerData = [];
      let outerData = [];
      let dim1 = dims[0];
      for (let row of dataset.source) {
        let sum = 0;
        for (let dimVal in row) {
          if (!row.hasOwnProperty(dimVal)) {
            continue;
          }
          if (dimVal !== dim1) {
            let val = row[dimVal];
            if (val) {
              outerData.push({name: dimVal, value: val});
              sum += val;
            }
          }
        }
        innerData.push({name: row[dim1], value: sum});
      }

      const option: EChartOption = {
        tooltip: {},
        legend: {},
        series: [
          {
            name: cubeDim1.desc,
            type: 'pie',
            selectedMode: 'single',
            radius: [0, '30%'],
            label: {
              position: 'inner'
            },
            data: innerData
          },
          {
            name: cubeDim2.desc,
            type: 'pie',
            radius: ['40%', '55%'],
            data: outerData
          }
        ]
      };

      this.myChart.setOption(option);

    } else {
      let series = [];
      let dsDims = dataset.dimensions;
      if (dims.length > 1) {
        for (let di = 1; di < dsDims.length; di++) {
          let serie: any = {type: this.chartType, name: dsDims[di].displayName};
          if (this.transpose && this.chartType !== 'pie') {
            serie.encode = {x: di, y: 0};
          }
          series.push(serie);
        }
      } else {
        let serie: any = {type: this.chartType, name: dsDims[1].displayName};
        if (this.transpose && this.chartType !== 'pie') {
          serie.encode = {x: 1, y: 0};
        }
        series.push(serie);
      }

      let xAxis: EChartOption.XAxis = this.transpose ? {} : {type: 'category'};
      let yAxis: EChartOption.YAxis = this.transpose ? {type: 'category'} : {};

      const option: EChartOption = {
        color: this.chartColors,
        legend: {},
        tooltip: {
          trigger: 'axis',
          formatter: (param) => {
            // https://github.com/apache/incubator-echarts/issues/4427
            // console.log(param);
            let params = (param['length'] ? param : [param]) as EChartOption.Tooltip.Format[];
            let html = params[0].name + '<br>';
            params.forEach(item => {
              let axis = this.transpose ? item.encode['x'][0] : item.encode['y'][0];
              let value = item.value[item.dimensionNames[axis]] || 0;
              html += '&nbsp;&nbsp;' + item.marker + item.seriesName + ' ' + value + '<br>';
            });
            return html;
          }
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
        xAxis,
        yAxis,
        series
      };

      this.myChart.setOption(option);
    }
  }

}
