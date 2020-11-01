import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';

import {EChartOption} from 'echarts';
import cnMap from 'echarts/map/js/china';

import {DataService} from '../../data/DataService';
import {query, Cube, cubes, Dataset} from '../../data/olap';
import {GenericChartComponent, DimOption} from '../common/generic-chart.component';

@Component({
  selector: 'app-china-map',
  templateUrl: './china-map.component.html'
})
export class ChinaMapComponent extends GenericChartComponent implements OnInit, AfterViewInit {

  cube: Cube = cubes.invoice;

  selectedDim = 'fhsf';
  selectedMeasure = 'zj';

  fhDateFilter: '' | '1d' | '1w' = '1d';

  chartType = 'map';


  constructor(protected dataService: DataService) {
    super(dataService);
  }

  ngOnInit(): void {

    console.log(cnMap);

    this.dimOptions = [];
    this.dim2Options = [];
    this.cube.dimensions.forEach(dim => {
      let option: DimOption = {name: dim.name, label: dim.desc, dimension: dim};
      if (dim.name === 'fhsf') {
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
    return query({cubeName: this.cube.name, dims, measures, slice, limit: this.limit});
  }

  buildChart(dims: string[], dataset: Dataset): void {

    let data = [];
    let min = null;
    let max = null;
    dataset.source.forEach(row => {
      let name = row[this.selectedDim];
      if (name.endsWith('省')) {
        name = name.substring(0, name.length - 1);
      } else {
        switch (name) {
          case '内蒙古自治区':
            name = '内蒙古';
            break;
          case '西藏自治区':
            name = '西藏';
            break;
          case '新疆维吾尔自治区':
            name = '新疆';
            break;
          case '宁夏回族自治区':
            name = '宁夏';
            break;
          case '广西壮族自治区':
            name = '广西';
            break;
          case '香港特别行政区':
            name = '香港';
            break;
          case '澳门特别行政区':
            name = '澳门';
            break;
          default:
            break;
        }
      }
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
            mapType: 'china',
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
