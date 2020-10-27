import {Component, OnInit} from '@angular/core';

import * as echarts from 'echarts';

import {DataService} from '../../data/DataService';

@Component({
  selector: 'app-fh',
  templateUrl: './fh.component.html',
  styleUrls: ['./fh.component.css']
})
export class FhComponent implements OnInit {

  constructor(private dataService: DataService) {
  }

  ngOnInit(): void {

    console.log('ngOnInit ...');

    const holder: HTMLDivElement = document.getElementById('main') as HTMLDivElement;
    const myChart: echarts.ECharts = echarts.init(holder);

    const option = {
      title: {
        text: 'ECharts 入门示例'
      },
      tooltip: {},
      legend: {
        data: ['销量']
      },
      xAxis: {
        data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
      },
      yAxis: {},
      series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
      }]
    };

    myChart.setOption(option);
  }

}
