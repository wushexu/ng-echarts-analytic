import {Injectable} from '@angular/core';

import alasql from 'alasql';

import {FieldDef, DimensionKeys, DimensionDef, Dimensions, DimensionMap} from './schema';

import {loadData} from './data-loader';
import {setupSql} from './data-sql';


@Injectable()
export class DataService {

  constructor() {
    console.log('setup data ...');
    loadData();

    const invDim = DimensionMap.get(DimensionKeys.Invoice);
    let count = 0;
    for (let invoice of invDim.data) {
      console.log(invoice);
      count++;
      if (count > 10) {
        break;
      }
    }

    console.log('--------------');
    setupSql();

    let res = alasql('SELECT * FROM province');
    console.log(res);

  }
}
