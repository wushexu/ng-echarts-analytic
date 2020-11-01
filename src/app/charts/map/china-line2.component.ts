import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';

import {EChartOption} from 'echarts';
import * as echarts from 'echarts';

import cnMap from 'echarts/map/js/china';
// @ts-ignore
import {default as coords} from './geo-coord.json';

import {ChartConfig} from '../common/ChartConfig';

@Component({
  selector: 'app-china-line2',
  templateUrl: './china-line2.component.html'
})
export class ChinaLine2Component extends ChartConfig implements OnInit, AfterViewInit {
  @ViewChild('chart') chartDiv: ElementRef;

  myChart: echarts.ECharts;
  chartType = 'map';


  ngOnInit(): void {

    console.log(cnMap);
  }

  ngAfterViewInit(): void {

    this.refreshChart();
  }

  refreshChart(keepData: boolean = false): void {
    if (!this.chartDiv) {
      return;
    }

    const holder = this.chartDiv.nativeElement as HTMLDivElement;
    this.myChart = echarts.init(holder, this.chartDarkTheme ? 'dark' : null/*, {renderer: 'svg'}*/); // light

    this.buildChart();
  }

  buildChart(): void {

    let centerName = '临沂市';
    let center = {name: centerName, coord: coords[centerName]};
    let markPointData: any[] = [
      {name: '上海', value: 100,},
      {name: '北京', value: 90},
      {name: '大连市', value: 80},
      {name: '重庆', value: 70},
      {name: '南昌市', value: 60},
      {name: '拉萨市', value: 50},
      {name: '中山市', value: 40},
      {name: '乌鲁木齐市', value: 30},
      {name: '柳州市', value: 20},
      {name: '南京市', value: 10},
      {name: '克拉玛依市', value: 10},
      {name: '吐鲁番地区', value: 10},
    ];

    markPointData.forEach(point => point.coord = coords[point.name]);

    let markLineData = markPointData.map(point => [point, center]);

    const option: EChartOption = Object.assign(this.buildOption(),
      {
        // backgroundColor: '#1b1b1b',
        color: ['gold', 'aqua', 'lime'],
        tooltip: {
          trigger: 'item',
          formatter: '{b}'
        },
        dataRange: {
          min: 0,
          max: 100,
          calculable: true,
          color: ['#ff3333', 'orange', 'yellow', 'lime', 'aqua'],
          textStyle: {
            color: '#fff'
          },
          show: false
        },
        series: [
          {
            name: '全国',
            type: 'map',
            map: 'china',
            roam: false,
            hoverable: false,
            itemStyle: {
              borderColor: 'rgba(100,149,237,1)',
              borderWidth: 0.5,
              areaStyle: {
                color: '#1b1b1b'
              }
            },
            data: [],
            markLine: {
              smooth: true,
              symbol: ['none', 'circle'],
              symbolSize: 1,
              itemStyle: {
                color: '#fff',
                borderWidth: 1,
                borderColor: 'rgba(30,144,255,0.5)'
              },
              data: []
            },
            geoCoord: coords
          },
          {
            name: '工厂分布',
            type: 'map',
            map: 'china',
            data: [],
            markLine: {
              smooth: true,
              effect: {
                show: true,
                scaleSize: 2,
                period: 30,
                color: '#fff',
                shadowBlur: 10
              },
              itemStyle: {
                borderWidth: 1,
                lineStyle: {
                  type: 'solid',
                  shadowBlur: 10
                }
              },
              data: markLineData
            },
            markPoint: {
              symbol: 'emptyCircle',
              symbolSize: v => 10 + v / 10,
              effect: {
                show: true,
                shadowBlur: 0
              },
              itemStyle: {
                label: {show: false},
                emphasis: {
                  label: {position: 'top'}
                }
              },
              data: markPointData
            }
          }
        ]
      }
    );

    console.log(JSON.stringify(option, null, 2));

    this.myChart.setOption(option);
  }

}
