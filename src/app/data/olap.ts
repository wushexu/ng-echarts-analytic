import alasql from 'alasql';
import {groupBy} from 'underscore';

import {FieldDef, TableDef} from './schema';
import {CubeDimension, Measure, Cube, cubes} from './cube';


interface Dataset {
  dimensions: any[];
  source: any[];
}

interface OverwriteMeasureValue {
  type: '' | 'multiply' | 'random';
  multiply: number;
  random: { min: number, max: number };
}

// @ts-ignore
alasql.fn.concat = (a, b) => `${a || ''}.${b}`;


function query(options?: {
  dims: string[], cubeName?: string, measures?: string[], slice?: any, limit?: number,
  overwriteDim2Values?: string[],
  overwriteMeasureValue?: OverwriteMeasureValue
}): Dataset {

  let {dims, cubeName, measures, slice, limit, overwriteDim2Values, overwriteMeasureValue} = options;

  let cube: Cube = cubes[cubeName];
  if (!cube) {
    throw new Error(`Cube ${cubeName} Not Exists.`);
  }

  let cubeDimensions = dims.map(dim => {
    let cubeDimension: CubeDimension = cube.getDimension(dim);
    if (!cubeDimension) {
      throw new Error(`Dimension ${dim} Not Exists.`);
    }
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

  let measureFieldsSql = measureFields.map(measure => {
    if (measure.aggSql) {
      return measure.aggSql;
    }
    return `sum(${measure.name}) as ${measure.name}`;
  }).join(',');

  let whereSql = null;
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
      whereSql = conds.join(' and ');
    }
  }

  let factTable: TableDef = cube.factTable;

  let dimFieldNames = cubeDimensions.map(cdim => cdim.field.name);
  let groupByFieldsSql = dimFieldNames.join(',');

  let dimField0 = dimFieldNames[0];

  let orderField = dimField0;
  if (limit && !dimField0.endsWith('Date')) {
    orderField = '[' + measures[0] + '] desc';
  }

  let dimFieldsSql = groupByFieldsSql;
  if (dimField0 === 'fhCity') {
    dimFieldsSql = dimFieldsSql.replace('fhCity', 'concat(fhsf,fhCity) fhCity');
    groupByFieldsSql = 'fhsf,fhCity';
  } else if (dimField0 === 'shCity') {
    dimFieldsSql = dimFieldsSql.replace('shCity', 'concat(shsf,shCity) shCity');
    groupByFieldsSql = 'shsf,shCity';
  }

  let sql = `select ${limit ? 'top ' + limit : ''} ${measureFieldsSql},${dimFieldsSql} from ${factTable.table}`;
  sql = sql + ' where ' + dimField0 + ' is not null';
  if (whereSql) {
    sql = sql + ' and ' + whereSql;
  }
  sql = sql + ' group by ' + groupByFieldsSql;
  sql = sql + ' order by ' + orderField;
  // console.log('Query: ' + sql);

  let data = alasql(sql);
  data = data.filter(row => row[dimField0]);
  // console.log(data);

  return buildDataset(cubeDimensions, measureFields, data, overwriteDim2Values, overwriteMeasureValue);
}

function buildDataset(cubeDimensions: CubeDimension[], measureFields: Measure[], data: any[],
                      overwriteDim2Values: string[],
                      overwriteMeasureValue: OverwriteMeasureValue): Dataset {

  let chartDimensions = [];
  cubeDimensions.map(cubeDimension => {
    let field: FieldDef = cubeDimension.field;
    // {name: 'fhsf', displayName: '省份', type: 'ordinal'}
    let type = field.type === 'string' ? 'ordinal' : field.type;
    chartDimensions.push({name: cubeDimension.name, displayName: cubeDimension.desc, type});
  });

  let meaField = measureFields[0].name;

  if (overwriteMeasureValue) {
    let type = overwriteMeasureValue.type;
    let multiply = overwriteMeasureValue.multiply || 1;
    let {min, max} = overwriteMeasureValue.random || {min: 1, max: 100};
    for (let row of data) {
      let meaVal = row[meaField];
      if (typeof meaVal !== 'undefined') {
        if (type === 'multiply') {
          row[meaField] = meaVal * multiply;
        } else if (type === 'random') {
          let mv = min + (max - min) * Math.random();
          row[meaField] = Math.round(mv);
        }
      }
    }
    // console.log(data);
  }

  if (cubeDimensions.length === 2 && measureFields.length === 1) {
    let dimField = cubeDimensions[0].field.name;
    let dimField2 = cubeDimensions[1].field.name;
    let groups = groupBy(data, obj => obj[dimField]);
    let newData = [];

    let dim2ValuesMap = new Map();

    let overwriteDim2 = overwriteDim2Values && overwriteDim2Values.length > 0;
    let dim2ValuesIndex = 0;

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
        if (dim2Val) {
          if (!overwriteDim2) {
            dim2ValuesMap.set(dim2Val, dim2Val);
            row0[dim2Val] = meaVal;
          } else {
            let overwrite = dim2ValuesMap.get(dim2Val);
            if (!overwrite) {
              if (dim2ValuesIndex >= overwriteDim2Values.length) {
                continue;
              }
              overwrite = overwriteDim2Values[dim2ValuesIndex];
              dim2ValuesMap.set(dim2Val, overwrite);
              dim2ValuesIndex++;
            }
            row0[overwrite] = meaVal;
          }
        }
      }
      delete row0[dimField2];
      delete row0[meaField];
      newData.push(row0);
    }
    data = newData;

    chartDimensions.pop();
    for (let [dim2ValOri, dim2Val] of dim2ValuesMap) {
      chartDimensions.push({name: dim2Val, displayName: dim2Val, type: 'number'});
    }
    // console.log(data);
  } else {
    measureFields.forEach(measure => {
      chartDimensions.push({name: measure.name, displayName: measure.desc, type: measure.type});
    });
  }

  return {dimensions: chartDimensions, source: data};
}

export {query, CubeDimension, Measure, Cube, cubes, Dataset, OverwriteMeasureValue};
