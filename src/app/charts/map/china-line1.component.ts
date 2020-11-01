import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';

import {EChartOption} from 'echarts';
import * as echarts from 'echarts';

import cnMap from 'echarts/map/js/china';

import {ChartConfig} from '../common/ChartConfig';

@Component({
  selector: 'app-china-line1',
  templateUrl: './china-line1.component.html'
})
export class ChinaLine1Component extends ChartConfig implements OnInit, AfterViewInit {
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

  randomValue(): number {
    return Math.round(Math.random() * 1000 + 200);
  }

  buildChart(): void {

    let dataList = [
      {name: '南海诸岛', value: 0},
      {name: '北京', value: 1300},
      {name: '天津', value: 1300},
      {name: '上海', value: 1400},
      {name: '重庆', value: 1300},
      {name: '河北', value: 1100},
      {name: '河南', value: 1200},
      {name: '云南', value: this.randomValue()},
      {name: '辽宁', value: this.randomValue()},
      {name: '黑龙江', value: this.randomValue()},
      {name: '湖南', value: this.randomValue()},
      {name: '安徽', value: 1200},
      {name: '山东', value: 1500},
      {name: '新疆', value: 0},
      {name: '江苏', value: 1000},
      {name: '浙江', value: this.randomValue()},
      {name: '江西', value: 1000},
      {name: '湖北', value: this.randomValue()},
      {name: '广西', value: this.randomValue()},
      {name: '甘肃', value: this.randomValue()},
      {name: '山西', value: 900},
      {name: '内蒙古', value: this.randomValue()},
      {name: '陕西', value: this.randomValue()},
      {name: '吉林', value: this.randomValue()},
      {name: '福建', value: this.randomValue()},
      {name: '贵州', value: this.randomValue()},
      {name: '广东', value: this.randomValue()},
      {name: '青海', value: 200},
      {name: '西藏', value: 0},
      {name: '四川', value: this.randomValue()},
      {name: '宁夏', value: this.randomValue()},
      {name: '海南', value: 200},
      {name: '台湾', value: 0},
      {name: '香港', value: 0},
      {name: '澳门', value: 0}
    ];

    const option: EChartOption = Object.assign(this.buildOption(),
      {
        geo: {
          map: 'china',
          aspectScale: 0.75, // 长宽比
          zoom: 1.1,
          roam: false,
          itemStyle: {
            normal: {
              areaColor: {
                type: 'radial',
                x: 0.5,
                y: 0.5,
                r: 0.8,
                colorStops: [{
                  offset: 0,
                  color: '#09132c' // 0% 处的颜色
                }, {
                  offset: 1,
                  color: '#274d68'  // 100% 处的颜色
                }],
                globalCoord: true // 缺省为 false
              },
              shadowColor: 'rgb(58,115,192)',
              shadowOffsetX: 10,
              shadowOffsetY: 11
            },
            emphasis: {
              areaColor: '#2AB8FF',
              borderWidth: 0,
              color: 'green',
              label: {
                show: false
              }
            }
          },
          regions: [{
            name: '南海诸岛',
            itemStyle: {
              areaColor: 'rgba(0, 10, 52, 1)',

              borderColor: 'rgba(0, 10, 52, 1)',
              normal: {
                opacity: 0,
                label: {
                  show: false,
                  color: '#009cc9',
                }
              }
            },
          }],
        },
        visualMap: {
          min: 0,
          max: 1500,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],// 取值范围的文字
          inRange: {
            color: ['#ffffff', '#006edd']// 取值范围的颜色
          },
          show: true// 图注
        },
        series: [{
          type: 'map',
          map: 'china',
          roam: false,
          label: {
            normal: {
              show: true,
              textStyle: {
                color: '#1DE9B6'
              }
            },
            emphasis: {
              textStyle: {
                color: 'rgb(183,185,14)'
              }
            }
          },
          itemStyle: {
            normal: {
              borderColor: 'rgb(147, 235, 248)',
              borderWidth: 1,
              areaColor: {
                type: 'radial',
                x: 0.5,
                y: 0.5,
                r: 0.8,
                colorStops: [{
                  offset: 0,
                  color: '#fff' // 0% 处的颜色
                }, {
                  offset: 1,
                  color: '#274d68'  // 100% 处的颜色
                }],
                globalCoord: true // 缺省为 false
              },
            },
            emphasis: {
              areaColor: 'rgb(46,229,206)',
              //    shadowColor: 'rgb(12,25,50)',
              borderWidth: 0.1
            }
          },
          zoom: 1.1,
          data: dataList
        }, // 地图线的动画效果
          {
            type: 'lines',
            zlevel: 2,
            effect: {
              show: true,
              period: 4, // 箭头指向速度，值越小速度越快
              trailLength: 0.4, // 特效尾迹长度[0,1]值越大，尾迹越长重
              symbol: 'arrow', // 箭头图标
              symbolSize: 7, // 图标大小
            },
            lineStyle: {
              normal: {
                color: '#1DE9B6',
                width: 1, // 线条宽度
                opacity: 0.1, // 尾迹线条透明度
                curveness: .3 // 尾迹线条曲直度
              }
            },
            data: [
              {coords: [[118.8062, 31.9208], [119.0543, 36.0222]], lineStyle: {color: '#d68410'}}
              , {coords: [[127.9688, 45.368], [119.0543, 36.0222]], lineStyle: {color: '#d68410'}}
              , {coords: [[110.3467, 41.4899], [119.0543, 36.0222]], lineStyle: {color: '#d68410'}}
              , {coords: [[125.8154, 44.2584], [119.0543, 36.0222]], lineStyle: {color: '#d68410'}}
              , {coords: [[116.4551, 40.2539], [119.0543, 36.0222]], lineStyle: {color: '#d68410'}}
              , {coords: [[123.1238, 42.1216], [119.0543, 36.0222]], lineStyle: {color: '#d68410'}}
              , {coords: [[114.4995, 38.1006], [119.0543, 36.0222]], lineStyle: {color: '#d68410'}}
              , {coords: [[117.4219, 39.4189], [119.0543, 36.0222]], lineStyle: {color: '#d68410'}}
              , {coords: [[112.3352, 37.9413], [119.0543, 36.0222]], lineStyle: {color: '#d68410'}}
              , {coords: [[109.1162, 34.2004], [119.0543, 36.0222]], lineStyle: {color: '#d68410'}}
              , {coords: [[103.5901, 36.3043], [119.0543, 36.0222]], lineStyle: {color: '#e7ab0b'}}
              , {coords: [[106.3586, 38.1775], [119.0543, 36.0222]], lineStyle: {color: '#d68410'}}
              , {coords: [[101.4038, 36.8207], [119.0543, 36.0222]], lineStyle: {color: '#d5b314'}}
              , {coords: [[103.9526, 30.7617], [119.0543, 36.0222]], lineStyle: {color: '#c1bb1f'}}
              , {coords: [[108.384366, 30.439702], [119.0543, 36.0222]], lineStyle: {color: '#b9be23'}}
              , {coords: [[113.0823, 28.2568], [119.0543, 36.0222]], lineStyle: {color: '#a6c62c'}}
              , {coords: [[102.9199, 25.46639], [119.0543, 36.0222]], lineStyle: {color: '#96cc34'}}
            ]
          }
        ]
      }
    );

    console.log(JSON.stringify(option, null, 2));

    this.myChart.setOption(option);
  }

}
