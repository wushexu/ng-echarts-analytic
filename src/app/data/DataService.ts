import {Injectable} from '@angular/core';

import alasql from 'alasql';

import {FieldDef, TableKeys, TableDef, Tables, TableMap} from './schema';

import {loadData} from './data-loader';
import {setupCube, query} from './olap';

export interface Option {
  value: string | number;
  label: string;
}

@Injectable()
export class DataService {

  catOptions0: Option[];
  provOptions0: Option[];

  constructor() {
    loadData();

    // const invDim = TableMap.get(TableKeys.Invoice);
    // let count = 0;
    // for (let invoice of invDim.data) {
    //   console.log(invoice);
    //   count++;
    //   if (count === 5) {
    //     break;
    //   }
    // }

    // console.log('--------------');
    setupCube();

    // let res = alasql('SELECT top 5 * FROM province');
    // console.log(res);
  }

  get catOptions(): Option[] {
    if (this.catOptions0) {
      return this.catOptions0;
    }

    const catTable = TableMap.get(TableKeys.Category);
    let categories = alasql(`select id,name from ${catTable.table}`);
    this.catOptions0 = categories.map(cat => ({value: cat.name, label: cat.name}));
    return this.catOptions0;
  }

  get provOptions(): Option[] {
    if (this.provOptions0) {
      return this.provOptions0;
    }

    const provTable = TableMap.get(TableKeys.Province);
    let categories = alasql(`select name from ${provTable.table}`);
    this.provOptions0 = categories.map(prov => ({value: prov.name, label: prov.name}))
      .sort((e1, e2) => e1.label.length - e2.label.length);
    return this.provOptions0;
  }
}
