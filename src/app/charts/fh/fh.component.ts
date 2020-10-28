import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import * as echarts from 'echarts';

import {DataService} from '../../data/DataService';
import {query} from '../../data/olap';
import {EChartOption} from 'echarts';

@Component({
  selector: 'app-fh',
  templateUrl: './fh.component.html',
  styleUrls: ['./fh.component.css']
})
export class FhComponent implements AfterViewInit {
  @ViewChild('chart') chartDiv: ElementRef;

  constructor(private dataService: DataService) {
  }

  ngAfterViewInit(): void {

    const holder: HTMLDivElement = this.chartDiv.nativeElement as HTMLDivElement;
    const myChart: echarts.ECharts = echarts.init(holder);

    let dataset = query({dims: ['发货省份'], measures: ['总价', '运费'], slice: {发货时间: '2020/9/16'}});
    console.log(dataset.source.length);

    const option: EChartOption = {
      title: {text: '发货分析（分省份）'},
      legend: {},
      tooltip: {},
      dataset,
      xAxis: {type: 'category'},
      yAxis: {},
      series: [
        {type: 'bar'},
        {type: 'bar'}
      ]
    };

    myChart.setOption(option);
  }

}
