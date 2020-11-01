import {EChartOption} from 'echarts';

export abstract class ChartConfig {

  readonly chartColorsOri = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae',
    '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
  chartColors = [...this.chartColorsOri];
  startColorIndex = 0;
  chartType = 'bar';
  chartStack = false;
  chartWidth = 800;
  chartHeight = 400;
  chartTranspose = false;
  chartDarkTheme = true;
  transparentBackground = true;
  lightBackgroundColor = '#FAFAFA'; // #FAFAFA, white
  darkBackgroundColor = '#333'; // #404040, #333, black

  chartTitle = '';
  chartSubTitle = '';
  chartToolbox = {
    show: false,
    feature: {
      // dataView: {show: true, readOnly: false},
      // magicType: {show: true, type: ['line', 'bar']},
      // restore: {show: true},
      saveAsImage: {
        show: true,
        pixelRatio: 2,
        backgroundColor: this.transparentBackground ?
          'transparent' :
          (this.chartDarkTheme ? this.darkBackgroundColor : this.lightBackgroundColor)
      }
    }
  };


  colorRollForward(): void {
    let colors = this.chartColors;
    let c = colors.shift();
    colors.push(c);
    this.startColorIndex++;
    if (this.startColorIndex >= colors.length) {
      this.startColorIndex = 0;
    }
    this.refreshChart(true);
  }

  colorRollBackward(): void {
    let colors = this.chartColors;
    let c = colors.pop();
    colors.unshift(c);
    this.startColorIndex--;
    if (this.startColorIndex < 0) {
      this.startColorIndex = colors.length - 1;
    }
    this.refreshChart(true);
  }

  startColorChanged(): void {
    let sci = this.startColorIndex;
    let chartColors = this.chartColorsOri.slice(sci);
    chartColors.concat(this.chartColorsOri.slice(0, sci));
    this.chartColors = chartColors;
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
      toolbox: this.chartToolbox
    };
    if (this.transparentBackground) {
      option.backgroundColor = 'transparent';
    } else {
      option.backgroundColor = this.chartDarkTheme ? this.darkBackgroundColor : this.lightBackgroundColor;
    }
    return option;
  }

}
