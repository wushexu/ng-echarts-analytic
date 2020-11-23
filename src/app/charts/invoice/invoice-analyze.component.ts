import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';

import {DataService} from '../../data/DataService';
import {query, Cube, cubes, Dataset} from '../../data/olap';
import {GenericChartComponent, DimOption} from '../common/generic-chart.component';

@Component({
  selector: 'app-invoice-analyze',
  templateUrl: './invoice-analyze.component.html',
  styleUrls: ['./invoice-analyze.component.css']
})
export class InvoiceAnalyzeComponent extends GenericChartComponent implements OnInit, AfterViewInit {

  cube: Cube = cubes.invoice;

  selectedDim = 'cat';
  selectedMeasure = 'zj';

  fhDateFilter: '' | '1d' | '1w' = '1d';


  constructor(protected dataService: DataService) {
    super(dataService);
  }

  ngOnInit(): void {
    this.dimOptions = [];
    this.dim2Options = [];
    this.cube.dimensions.forEach(dim => {
      let option: DimOption = {name: dim.name, label: dim.desc, dimension: dim};
      this.dimOptions.push(option);
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
    let overwriteDim2Values = null;

    if (this.selectedDim2 && this.overwriteDim2 && this.dim2Values) {
      let values = this.dim2Values.split(/\r?\n/).map(v => v.trim()).filter(v => v.length > 0);
      if (values.length > 0) {
        overwriteDim2Values = values;
      }
    }

    return query({
      cubeName: this.cube.name, dims, measures, slice, limit: this.limit,
      overwriteDim2Values, overwriteMeasureValue: this.overwriteMeasureValueOpt
    });
  }

}
