import {Component, OnInit, AfterViewInit, ViewChild, ElementRef} from '@angular/core';

import {DataService, Option} from '../../data/DataService';
import {query, CubeDimension, Cube, cubes, Dataset} from '../../data/olap';
import {GenericChartComponent, DimOption, MeasureOption} from '../common/generic-chart.component';

@Component({
  selector: 'app-logis-site',
  templateUrl: './logis-site.component.html',
  styleUrls: ['./logis-site.component.css']
})
export class LogisSiteComponent extends GenericChartComponent implements OnInit, AfterViewInit {

  cube: Cube = cubes.site;

  selectedDim = 'site';
  selectedMeasure = 'count';


  constructor(protected dataService: DataService) {
    super(dataService);
  }

  ngOnInit(): void {
    this.dimOptions = [];
    this.dim2Options = [];
    this.cube.dimensions.forEach(dim => {
      let option: DimOption = {name: dim.name, label: dim.desc, dimension: dim};
      this.dimOptions.push(option);
      if (dim.name !== 'siteDistrict') {
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
        slice['日期'] = '2020/9/16';
      } else if (this.fhDateFilter === '1w') {
        slice['日期'] = {op: 'gt', val: '2020/9/13'};
      }
    }
    if (this.catFilter) {
      slice['cat'] = this.catFilter;
    }

    let measures = [this.selectedMeasure];
    let overwriteDim2Values = null;

    if (this.selectedDim2 && this.overwriteDim2 && this.dim2Values) {
      let values = this.dim2Values.split(/\r?\n/).map(v => v.trim()).filter(v => v.length > 0);
      if (values.length > 0) {
        overwriteDim2Values = values;
      }
    }

    return query({cubeName: this.cube.name, dims, measures, slice, limit: this.limit, overwriteDim2Values});
  }

}
