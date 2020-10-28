import alasql from 'alasql';
import {FieldDef, TableKeys, TableDef, Tables, TableMap} from './schema';
import {CubeDimension, Measure, Cube, cubes} from './cube';

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
    let cubeDimension: CubeDimension = cube.getDimension(dim);
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

  let measureFields = measures.map(name => {
    let measure: Measure = cube.getMeasure(name);
    if (!measure) {
      throw new Error(`Measure ${name} Not Exists.`);
    }
    dimensionAndMeasures.push({name: measure.name, displayName: measure.desc, type: measure.type});
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

  let sql = `select ${measureClause},${groupByClause} from ${factTable.table}`;
  if (whereClause) {
    sql = sql + ' where ' + whereClause;
  }
  sql = sql + ' group by ' + groupByClause;
  sql = sql + ' order by ' + dimFieldNames[0];
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

export {setupCube, query, CubeDimension, Measure, Cube, cubes};
