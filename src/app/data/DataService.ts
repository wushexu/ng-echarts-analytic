import {Injectable} from '@angular/core';

import alasql from 'alasql';

import {FieldDef, TableKeys, TableDef, Tables, TableMap} from './schema';

import {loadData} from './data-loader';
import {CubeDimension, Cube, cubes, cubeNames} from './cube';
import {setupCube, query} from './olap';


@Injectable()
export class DataService {

  constructor() {
    console.log('setup data ...');
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

    // console.log('--------------');
    // let data = query(cubeNames.simple, ['fhsf']);
    // console.log(data.length);
  }
}
