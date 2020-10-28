import alasql from 'alasql';
import {FieldDef, TableKeys, TableDef, Tables, TableMap} from './schema';
import {CubeDimension, Cube, cubes} from './cube';

function setupCube(): void {

  for (let dim of Tables) {
    let {fields, table, data} = dim;
    let fs = fields.map(f => `${f.name} ${f.type}`).join(', ');
    alasql(`CREATE TABLE ${table} (${fs})`);
    // @ts-ignore
    alasql.tables[table].data = data;
  }

}

interface Dataset {
  dimensions: any[];
  source: any[];
}


function query(options?: { dims: string[], cubeName?: string, measures?: string[], slice?: any }): Dataset {


  let {dims, cubeName, measures, slice} = options;

  let cube: Cube = cubes[cubeName || 'simple'];
  if (!cube) {
    throw new Error(`Cube ${cubeName} Not Exists.`);
  }

  let dimensionAndMeasures = [];

  let cubeDimensions = dims.map(dim => {
    let cubeDimension = cube.getDimension(dim);
    if (!cubeDimension) {
      throw new Error(`Dimension ${dim} Not Exists.`);
    }
    let field = cubeDimension.field;
    // {name: 'fhsf', displayName: '省份', type: 'ordinal'}
    let type = field.type === 'string' ? 'ordinal' : field.type;
    dimensionAndMeasures.push({name: cubeDimension.name, displayName: cubeDimension.desc, type});
    return cubeDimension;
  });


  if (!measures) {
    measures = [cube.defaultMeasure];
  }

  let measureFields = measures.map(measure => {
    let measureField = cube.getMeasure(measure);
    if (!measureField) {
      throw new Error(`Measure ${measure} Not Exists.`);
    }
    dimensionAndMeasures.push({name: measureField.name, displayName: measureField.desc, type: measureField.type});
    return measureField;
  });

  let measureClause = measureFields.map(measureField => {
    let measure = measureField.name;
    if (measure === 'count') {
      return `count(1) as [count]`;
    }
    return `sum(${measure}) as ${measure}`;
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

      conds.push(`${fieldName}=${(typeof value === 'number') ? value : '\'' + value + '\''}`);
    }
    if (conds.length > 0) {
      whereClause = conds.join(',');
    }
  }

  let factTable: TableDef = cube.factTable;

  let sql = `select ${measureClause},${groupByClause} from ${factTable.table}`;
  if (whereClause) {
    sql = sql + ' where ' + whereClause;
  }
  sql = sql + ' group by ' + groupByClause;
  console.log('Query: ' + sql);

  let data = alasql(sql);
  console.log(data);

// dataset: {
//   dimensions: [
//     {name: 'fhsf', displayName: '省份', type: 'ordinal'},
//     {name: 'zj', displayName: '总价', type: 'number'},
//     {name: 'yf', displayName: '运费', type: 'number'}
//   ],
//     source: data
// }
  return {dimensions: dimensionAndMeasures, source: data};
}

export {setupCube,query,CubeDimension, Cube, cubes};
