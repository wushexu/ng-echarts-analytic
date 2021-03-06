import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {MatRadioChange} from '@angular/material/radio';

import * as echarts from 'echarts';
import {EChartOption} from 'echarts';

import {DataService, Option} from '../../data/DataService';
import {FieldDef} from '../../data/schema';
import {CubeDimension, Cube, Dataset, OverwriteMeasureValue} from '../../data/olap';
import {ChartConfig} from './ChartConfig';

export interface DimOption {
  name: string;
  label: string;
  dimension: CubeDimension;
}

export interface MeasureOption {
  name: string;
  label: string;
  field: FieldDef;
}

@Component({template: ''})
export abstract class GenericChartComponent extends ChartConfig implements OnInit, AfterViewInit {
  @ViewChild('chart') chartDiv: ElementRef;

  cube: Cube;
  dimOptions: DimOption[] = [];
  dim2Options: DimOption[] = [];
  measureOptions: MeasureOption[] = [];
  catOptions: Option[];
  provOptions: Option[];

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
  overwriteDim2 = false;
  dim2Values = '';
  overwriteMeasure = false;
  measureName = '';

  overwriteMeasureValue: '' | 'multiply' | 'random' = '';
  measureValueMultiply = 10;
  measureValueRandom = {min: 1, max: 100};

  myChart: echarts.ECharts;
  currentDataset: Dataset;

  protected constructor(protected dataService: DataService) {
    super();
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

  get overwriteMeasureValueOpt(): OverwriteMeasureValue {
    let overwriteMeasureValue: OverwriteMeasureValue = null;
    if (this.overwriteMeasureValue) {
      overwriteMeasureValue = {
        type: this.overwriteMeasureValue,
        multiply: this.measureValueMultiply,
        random: this.measureValueRandom
      };
    }
    return overwriteMeasureValue;
  }

  dimSelected($event: MatRadioChange): void {
    this.selectedDim = $event.value;
    this.refreshChart();
  }

  dimSelected2($event: MatRadioChange): void {
    this.selectedDim2 = $event.value;
    if (!this.selectedDim2 && this.chartStack) {
      this.chartStack = false;
    }
    this.refreshChart();
  }

  measureSelected($event: MatRadioChange): void {
    this.selectedMeasure = $event.value;
    this.refreshChart();
  }

  overwriteMeasureValueSelected($event: MatRadioChange): void {
    // this.selectedMeasure = $event.value;
    this.refreshChart();
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

    if (this.myChart) {
      // this.myChart.clear();
      this.myChart.dispose();
    }

    const holder = this.chartDiv.nativeElement as HTMLDivElement;
    this.myChart = echarts.init(holder, this.chartDarkTheme ? 'dark' : null/*, {renderer: 'svg'}*/); // light

    if (this.chartType === 'pie' && dims.length === 2) {
      // 两级饼图
      this.buildTwoLayerPie(dims, dataset);
      return;
    }

    this.buildChart(dims, dataset);
  }

  buildTwoLayerPie(dims: string[], dataset: Dataset): void {

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

    const option: EChartOption = Object.assign(this.buildOption(), {
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
      }
    );

    this.myChart.setOption(option);
  }


  buildChart(dims: string[], dataset: Dataset): void {

    let type = this.chartType;
    let series = [];
    let dsDims = dataset.dimensions;
    if (dims.length > 1) {
      for (let di = 1; di < dsDims.length; di++) {
        let serie: any = {type, name: dsDims[di].displayName};
        if (this.chartTranspose && type !== 'pie') {
          serie.encode = {x: di, y: 0};
        }
        series.push(serie);
      }
    } else {
      let seriesName = dsDims[1].displayName;
      if (this.overwriteMeasure && this.measureName) {
        seriesName = this.measureName;
      }
      let serie: any = {type, name: seriesName};
      if (this.chartTranspose && type !== 'pie') {
        serie.encode = {x: 1, y: 0};
      }
      series.push(serie);
    }
    series.forEach(serie => {
      if (this.chartStack) {
        serie.stack = 'A';
        if (type === 'line') {
          serie.areaStyle = {};
        }
      }
    });

    // console.log(JSON.stringify(series, null, 2));

    let xAxis: EChartOption.XAxis = this.chartTranspose ? {type: 'value'} : {type: 'category'};
    let yAxis: EChartOption.YAxis = this.chartTranspose ? {type: 'category'} : {type: 'value'};

    const option: EChartOption = Object.assign(this.buildOption(), {
        tooltip: {trigger: 'axis'},
        dataset,
        xAxis,
        yAxis,
        series
      }
    );

    console.log(option);
    // console.log(JSON.stringify(option, null, 2));

    this.myChart.setOption(option);
  }
}
