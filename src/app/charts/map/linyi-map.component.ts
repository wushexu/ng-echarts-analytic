import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';

import {EChartOption} from 'echarts';
import * as echarts from 'echarts';
// @ts-ignore
import {default as linyi} from './linyi-371300.json';

import {DataService} from '../../data/DataService';
import {query, Cube, cubes, Dataset} from '../../data/olap';
import {GenericChartComponent, DimOption} from '../common/generic-chart.component';

@Component({
  selector: 'app-linyi-map',
  templateUrl: './linyi-map.component.html'
})
export class LinyiMapComponent extends GenericChartComponent implements OnInit, AfterViewInit {

  cube: Cube = cubes.site;

  selectedDim = 'siteDistrict';
  selectedMeasure = 'zj';

  fhDateFilter: '' | '1d' | '1w' = '1d';

  chartType = 'map';


  constructor(protected dataService: DataService) {
    super(dataService);
  }

  ngOnInit(): void {

    console.log(linyi);
    echarts.registerMap('linyi', linyi);

    this.dimOptions = [];
    this.dim2Options = [];
    this.cube.dimensions.forEach(dim => {
      let option: DimOption = {name: dim.name, label: dim.desc, dimension: dim};
      if (dim.name === 'siteDistrict') {
        this.dimOptions.push(option);
      }
      if (!dim.name.endsWith('Date')) {
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

  buildDataset(dims): Dataset {
    let slice: any = {};
    if (this.fhDateFilter) {
      if (this.fhDateFilter === '1d') {
        slice['fhDate'] = '2020/9/16';
      } else if (this.fhDateFilter === '1w') {
        slice['fhDate'] = {op: 'gt', val: '2020/9/13'};
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
    return query({cubeName: this.cube.name, dims, measures, slice, limit: this.limit});
  }

  buildChart(dims: string[], dataset: Dataset): void {
    let data = [];
    let min = null;
    let max = null;
    dataset.source.forEach(row => {
      let name = row[this.selectedDim];
      let value = row[this.selectedMeasure];
      if (min === null || value < min) {
        min = value;
      }
      if (max === null || value > max) {
        max = value;
      }
      data.push({name, value});
    });

    const option: EChartOption = Object.assign(this.buildOption(),
      {
        visualMap: {
          type: 'continuous',
          min: min || 0,
          max: max || 100,
          text: ['High', 'Low'],
          realtime: false,
          calculable: true,
          color: ['#3ADEF1', '#0089FC', '#0057FE'],
          show: false
        },
        series: [
          {
            type: 'map',
            mapType: 'linyi',
            roam: true,
            label: {
              show: true,
              color: '#333',
              emphasis: {
                show: true
              }
            },
            itemStyle: {
              emphasis: {label: {show: true}}
            },
            data
          }
        ]
      }
    );

    console.log(JSON.stringify(option, null, 2));

    this.myChart.setOption(option);
  }

}
