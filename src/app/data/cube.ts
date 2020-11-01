import {FieldDef, TableKeys, TableDef, TableMap} from './schema';


interface CubeDimension {
  name: string;
  desc: string;
  field: FieldDef;// fact
  type: 'table' | 'regression';
  dimTable?: TableDef;
  dimTableField?: FieldDef;
}

interface Measure extends FieldDef {
  aggSql?: string;
}

class Cube {
  name: string;
  factTable: TableDef = TableMap.get(TableKeys.Invoice);
  dimensions: CubeDimension[];
  measures: Measure[];
  defaultMeasure?;

  dimensionMap: Map<string, CubeDimension>;
  measureMap: Map<string, Measure>;

  constructor(name: string, dimensions: CubeDimension[], measures: Measure[], defaultMeasure?: string) {
    this.name = name;
    this.dimensions = dimensions;
    this.measures = measures;
    this.defaultMeasure = defaultMeasure;

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

  getMeasure(name: string): Measure {
    return this.measureMap.get(name);
  }
}


let invoiceDims: { [name: string]: CubeDimension } = {};
TableMap.get(TableKeys.Invoice).fields.forEach(field => {
  invoiceDims[field.name] = {
    name: field.name,
    desc: field.desc || field.name,
    field,
    type: 'regression'
  };
});

const invoiceCube: Cube = new Cube(
  'invoice',
  [
    invoiceDims.fhCity, // 发货城市
    invoiceDims.fhsf, // 发货省份
    invoiceDims.fhDate, // 发货日期
    invoiceDims.shCity, // 收货城市
    invoiceDims.shsf, // 收货省份
    // invoiceDims.yjdhDate, // 预计到货日期
    invoiceDims.sjdhDate, // 实际到货日期
    invoiceDims.cat // 商品分类
  ],
  [
    {name: 'quantity', type: 'int', desc: '数量（件）'},
    {name: 'weight', type: 'int', desc: '重量（千克）'},
    {name: 'zj', type: 'int', desc: '交易量（元）'},
    {name: 'yf', type: 'int', desc: '运费（元）'},
    {name: 'count', type: 'int', desc: '单数', aggSql: 'count(1) as [count]'}],
  'zj');

const siteCube: Cube = new Cube(
  'site',
  [
    Object.assign({}, invoiceDims.fhDate, {desc: '日期'}), // 日期
    invoiceDims.cat, // 商品分类
    invoiceDims.wlComp, // 物流公司
    invoiceDims.vehicleType, // 车型
    invoiceDims.site, // 物流园
    invoiceDims.siteDistrict  // 县区
  ],
  [
    {name: 'weight', type: 'int', desc: '商品重量（千克）'},
    {name: 'zj', type: 'int', desc: '商品总价（元）'},
    {name: 'count', type: 'int', desc: '车辆数', aggSql: 'count(1) as [count]'}],
  'count');


const cubes = {[invoiceCube.name]: invoiceCube, [siteCube.name]: siteCube};

export {CubeDimension, Measure, Cube, cubes};
