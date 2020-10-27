import alasql from 'alasql';
import {FieldDef, DimensionKeys, DimensionDef, Dimensions, DimensionMap} from './schema';

export function setupSql(): void {

  for (let dim of Dimensions) {
    let {fields, table, data} = dim;
    let fs = fields.map(f => `${f.name} ${f.type}`).join(', ');
    alasql(`CREATE TABLE ${table} (${fs})`);
    // @ts-ignore
    alasql.tables[table].data = data;
  }

}

