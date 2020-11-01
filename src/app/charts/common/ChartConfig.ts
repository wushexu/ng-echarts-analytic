import {EChartOption} from 'echarts';

export abstract class ChartConfig {

  chartColors = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae',
    '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
  chartType = 'bar';
  chartStack = false;
  chartWidth = 800;
  chartHeight = 400;
  chartTranspose = false;
  chartDarkTheme = true;
  chartTransparentBackground = true;
  chartTitle = '';
  chartSubTitle = '';
  chartToolbox = {
    show: false,
    feature: {
      // dataView: {show: true, readOnly: false},
      // magicType: {show: true, type: ['line', 'bar']},
      // restore: {show: true},
      saveAsImage: {show: true}
    }
  };

  lightBackgroundColor = '#FAFAFA'; // #FAFAFA, white
  darkBackgroundColor = '#333'; // #404040, #333, black


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

  redrawChart(): void {
    this.refreshChart(true);
  }

  abstract refreshChart(keepData): void;

  buildOption(): EChartOption {
    let option: EChartOption = {
      color: this.chartColors,
      title: {text: this.chartTitle, subtext: this.chartSubTitle},
      legend: {},
      // toolbox: this.chartToolbox
    };
    if (this.chartTransparentBackground) {
      option.backgroundColor = 'transparent';
    } else {
      option.backgroundColor = this.chartDarkTheme ? this.darkBackgroundColor : this.lightBackgroundColor;
    }
    return option;
  }

}
