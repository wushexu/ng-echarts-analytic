import {FieldDef, TableKeys, TableDef, Tables, TableMap} from './schema';


interface CubeDimension {
  name: string;
  desc: string;
  field: FieldDef;// fact
  type: 'table' | 'regression';
  dimTable?: TableDef;
  dimTableField?: FieldDef;
}


//   {name: 'wl_id', type: 'string', desc: '物流公司id'},
//   {name: 'fhf_id', type: 'int', desc: '发货方id'},
//   {name: 'fhd_id', type: 'int', desc: '发货点id'},
//   {name: 'shf_id', type: 'int', desc: '收货方id'},
//   {name: 'cl_id', type: 'int', desc: '车辆id'},
//   {name: 'shd_id', type: 'int', desc: '收货点id'},
//   {name: 'cat_id', type: 'int', desc: '商品分类id'},

//   {name: 'fhCity', type: 'string', desc: '发货城市'},
//   {name: 'fhDate', type: 'string', desc: '发货时间'},
//   {name: 'yjdhDate', type: 'string', desc: '预计到货时间'},
//   {name: 'sjdhDate', type: 'string', desc: '实际到货时间'},
//   {name: 'shCity', type: 'string', desc: '收货城市'},
//   {name: 'fhsf', type: 'string', desc: '发货省份'},
//   {name: 'shsf', type: 'string', desc: '收货省份'},
//   {name: 'cat', type: 'string', desc: '商品分类'}];

let invoiceDims: { [name: string]: CubeDimension } = {};
TableMap.get(TableKeys.Invoice).fields.forEach(field => {
  invoiceDims[field.name] = {
    name: field.name,
    desc: field.desc || field.name,
    field,
    type: 'regression'
  };
});

class Cube {
  factTable: TableDef = TableMap.get(TableKeys.Invoice);
  measures: FieldDef[] = [
    {name: 'quantity', type: 'int', desc: '数量'},
    {name: 'weight', type: 'int', desc: '重量'},
    {name: 'zj', type: 'int', desc: '总价'},
    {name: 'yf', type: 'int', desc: '运费'}];// agg: sum
  defaultMeasure? = 'zj';
  dimensions: CubeDimension[] = [
    invoiceDims.fhCity, // 发货城市
    invoiceDims.fhsf, // 发货省份
    invoiceDims.fhDate, // 发货时间
    invoiceDims.shCity, // 收货城市
    invoiceDims.shsf, // 收货省份
    invoiceDims.yjdhDate, // 预计到货时间
    invoiceDims.sjdhDate, // 实际到货时间
    invoiceDims.cat // 商品分类
  ];

  dimensionMap: Map<string, CubeDimension>;
  measureMap: Map<string, FieldDef>;

  constructor() {
    this.dimensionMap = new Map();
    this.dimensions.forEach(dim => {
      this.dimensionMap.set(dim.name, dim);
      this.dimensionMap.set(dim.desc, dim);
    });

    this.measureMap = new Map();
    this.measures.forEach(measure => {
      this.measureMap.set(measure.name, measure);
      this.measureMap.set(measure.desc, measure);
    });
  }

  getDimension(name: string): CubeDimension {
    return this.dimensionMap.get(name);
  }

  getMeasure(name: string): FieldDef {
    return this.measureMap.get(name);
  }
}

// 发货分析
const simpleCube: Cube = new Cube();

const cubeNames = {simple: 'simple'};

const cubes = {simple: simpleCube};

export {CubeDimension, Cube, cubes, cubeNames};
