import alasql from 'alasql';
import {groupBy} from 'underscore';

import {FieldDef, TableDef} from './schema';
import {CubeDimension, Measure, Cube, cubes} from './cube';


interface Dataset {
  dimensions: any[];
  source: any[];
}


function query(options?: { dims: string[], cubeName?: string, measures?: string[], slice?: any, limit?: number }): Dataset {


  let {dims, cubeName, measures, slice, limit} = options;

  let cube: Cube = cubes[cubeName];
  if (!cube) {
    throw new Error(`Cube ${cubeName} Not Exists.`);
  }

  let chartDimensions = [];

  let cubeDimensions = dims.map(dim => {
    let cubeDimension: CubeDimension = cube.getDimension(dim);
    if (!cubeDimension) {
      throw new Error(`Dimension ${dim} Not Exists.`);
    }
    let field: FieldDef = cubeDimension.field;
    // {name: 'fhsf', displayName: '省份', type: 'ordinal'}
    let type = field.type === 'string' ? 'ordinal' : field.type;
    chartDimensions.push({name: cubeDimension.name, displayName: cubeDimension.desc, type});
    return cubeDimension;
  });


  if (!measures) {
    measures = [cube.defaultMeasure];
  }

  let measureFields = measures.map(name => {
    let measure: Measure = cube.getMeasure(name);
    if (!measure) {
      throw new Error(`Measure ${name} Not Exists.`);
    }
    return measure;
  });

  let measureClause = measureFields.map(measure => {
    if (measure.aggSql) {
      return measure.aggSql;
    }
    return `sum(${measure.name}) as ${measure.name}`;
  }).join(',');

  let dimFieldNames = cubeDimensions.map(cdim => cdim.field.name);
  let groupByClause = dimFieldNames.join(',');

  let whereClause = null;
  if (slice) {
    let conds = [];
    for (let dim in slice) {
      if (!slice.hasOwnProperty(dim)) {
        continue;
      }
      let cubeDimension = cube.getDimension(dim);
      if (!cubeDimension) {
        throw new Error(`Dimension ${dim} Not Exists.`);
      }
      let value = slice[dim];
      let fieldName = cubeDimension.field.name;

      if (value.constructor && value.constructor.name === 'Array') {
        // TODO:
      } else if (typeof value === 'object') {
        let {op, val} = value;
        if (cubeDimension.field.type === 'string') {
          val = `'${val}'`;
        }
        if (op === 'gt') {
          conds.push(`${fieldName} > ${val}`);
        } else if (op === 'lt') {
          conds.push(`${fieldName} < ${val}`);
        }
      } else {
        conds.push(`${fieldName}=${(typeof value === 'number') ? value : '\'' + value + '\''}`);
      }

    }
    if (conds.length > 0) {
      whereClause = conds.join(' and ');
    }
  }

  let factTable: TableDef = cube.factTable;

  // TODO: order by measure
  let sql = `select ${limit ? 'top ' + limit : ''} ${measureClause},${groupByClause} from ${factTable.table}`;
  if (whereClause) {
    sql = sql + ' where ' + whereClause;
  }
  sql = sql + ' group by ' + groupByClause;
  if (limit) {
    sql = sql + ' order by ' + measures[0] + ' desc';
  } else {
    sql = sql + ' order by ' + dimFieldNames[0];
  }
  // console.log('Query: ' + sql);

  let data = alasql(sql);
  data = data.filter(row => row[dimFieldNames[0]]);
  // console.log(data);

  if (cubeDimensions.length === 2 && measureFields.length === 1) {
    let dimField = cubeDimensions[0].field.name;
    let dimField2 = cubeDimensions[1].field.name;
    let meaField = measureFields[0].name;
    let groups = groupBy(data, obj => obj[dimField]);
    let newData = [];

    let dim2Values = new Set();

    for (let k in groups) {
      if (!groups.hasOwnProperty(k)) {
        continue;
      }
      let rs = groups[k];
      let row0 = rs[0];
      if (!row0[dimField]) {
        continue;
      }
      for (let row of rs) {
        let meaVal = row[meaField];
        let dim2Val = row[dimField2];
        dim2Values.add(dim2Val);
        row0[dim2Val] = meaVal;
      }
      delete row0[dimField2];
      delete row0[meaField];
      newData.push(row0);
    }
    data = newData;

    chartDimensions.pop();
    for (let dim2Val of dim2Values) {
      chartDimensions.push({name: dim2Val, displayName: dim2Val, type: 'ordinal'});
    }
    // console.log(data);
  } else {
    measureFields.forEach(measure => {
      chartDimensions.push({name: measure.name, displayName: measure.desc, type: measure.type});
    });
  }

  return {dimensions: chartDimensions, source: data};
}

export {query, CubeDimension, Measure, Cube, cubes, Dataset};
