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
    let points: any[] = [
      {name: '上海', value: 100},
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

    let markPointData = points.map(point => {
      let name = point.name;
      let coord = coords[name];
      point.coord = coords[name];
      let value = coord.concat(point.value);
      return {name, value};
    });

    let markLineData = points.map(point => [point, center]);

    const option: EChartOption = Object.assign(this.buildOption(),
      {
        // backgroundColor: '#1b1b1b',
        color: ['gold', 'aqua', 'lime'],
        tooltip: {
          trigger: 'item',
          formatter: '{b}'
        },
        geo: {
          show: true,
          map: 'china',
          roam: true,
          zoom: 1,
          // 地图中心点, 可调节显示的偏移量
          center: [108.348024, 35.463161],
          label: {
            // 高亮文字隐藏
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              borderColor: '#FF3333',
              borderWidth: 1,
              areaColor: {
                type: 'radial',
                x: 0.5,
                y: 0.5,
                r: 0.8,
                colorStops: [{
                  offset: 0,
                  // 0% 处的颜色
                  color: 'rgba(0, 0, 0, 0)'
                },
                  {
                    offset: 1,
                    // 100% 处的颜色
                    color: 'rgba(0, 0, 0, .3)'
                  }]
              },
              shadowColor: 'rgba(0, 0, 0, 1)',
              shadowOffsetX: -2,
              shadowOffsetY: 2,
              shadowBlur: 10
            },
            emphasis: {
              // 鼠标悬浮高亮
              areaColor: 'gray',
              borderWidth: 0
            }
          }
        },
        series: [
          {
            // 坐标点参数和样式
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: markPointData,
            symbolSize: v => 2 + v[2]/10,
            showEffectOn: 'render',
            rippleEffect: {
              brushType: 'stroke'
            },
            label: {
              normal: {
                formatter: '{b}',
                position: 'right',
                show: true
              }
            },
            itemStyle: {
              normal: {
                color: '#FF4500',
                shadowBlur: 10,
                shadowColor: '#FF4500'
              }
            }
          },
          {
            // 线条参数和样式
            type: 'lines',
            // 变化频率
            zlevel: 2,
            effect: {
              show: true,
              // 箭头指向速度，值越小速度越快
              period: 4,
              // 特效尾迹长度,取值0到1,值越大,尾迹越长
              trailLength: 0.05,
              symbol: 'arrow',
              // 图标大小
              symbolSize: 5
            },
            lineStyle: {
              normal: {
                color: '#FF4500',
                // 尾迹线条宽度
                width: 1,
                // 尾迹线条透明度
                opacity: 1,
                // 尾迹线条曲直度
                curveness: 0.3
              }
            },
            data: markLineData
          }
        ]
      }
    );

    console.log(JSON.stringify(option, null, 2));

    this.myChart.setOption(option);
  }

}
