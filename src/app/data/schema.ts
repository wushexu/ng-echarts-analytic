interface FieldDef {
  name: string;
  type: 'int' | 'number' | 'string';
  desc?: string;
}

interface TableDef {
  key: string;
  name: string;
  fields: FieldDef[];
  table: string;
  data: any[];
}

const TableKeys = {
  LogisComp: 'LogisComp',
  Vehicle: 'Vehicle',
  Customer: 'Customer',
  City: 'City',
  Province: 'Province',
  Category: 'Category',
  Site: 'Site',
  Invoice: 'Invoice'
};

const Tables: TableDef[] = [
  {
    key: TableKeys.LogisComp,
    name: '物流公司',
    fields: [{name: 'id', type: 'int'},
      {name: 'name', type: 'string', desc: '名称'}],
    table: 'comp',
    data: []
  },
  {
    key: TableKeys.Vehicle,
    name: '车辆',
    fields: [{name: 'id', type: 'int'},
      {name: 'plate', type: 'string', desc: '车牌号'},
      {name: 'vehicleType', type: 'string', desc: '车型'}],
    table: 'vehicle',
    data: []
  },
  {
    key: TableKeys.Customer,
    name: '物流客户',
    fields: [{name: 'id', type: 'int'},
      {name: 'name', type: 'string', desc: '名称'},
      {name: 'province', type: 'string', desc: '省份'},
      {name: 'city', type: 'string', desc: '城市'}],
    table: 'customer',
    data: []
  },
  {
    key: TableKeys.City,
    name: '城市',
    fields: [{name: 'province', type: 'string', desc: '省份'},
      {name: 'name', type: 'string', desc: '城市'},
      {name: 'longitude', type: 'number', desc: '经度'},
      {name: 'latitude', type: 'number', desc: '维度'}],
    table: 'city',
    data: []
  },
  {
    key: TableKeys.Province,
    name: '省份',
    fields: [{name: 'name', type: 'string', desc: '省份'},
      {name: 'capital', type: 'string', desc: '省会'},
      {name: 'longitude', type: 'number', desc: '经度'},
      {name: 'latitude', type: 'number', desc: '维度'}],
    table: 'province',
    data: []
  },
  {
    key: TableKeys.Category,
    name: '商品分类',
    fields: [{name: 'id', type: 'int'},
      {name: 'name', type: 'string', desc: '分类'},
      {name: 'secondary', type: 'string', desc: '二级分类'}],
    table: 'category',
    data: []
  },
  {
    key: TableKeys.Site,
    name: '物流点',
    fields: [{name: 'id', type: 'int'},
      {name: 'name', type: 'string', desc: '名称'},
      {name: 'type', type: 'string', desc: '类型'},
      {name: 'district', type: 'string', desc: '县区'}
    ],
    table: 'site',
    data: []
  },
  {
    key: TableKeys.Invoice,
    name: '运单',
    fields: [{name: 'id', type: 'int'},
      {name: 'wl_id', type: 'int', desc: '物流公司id'},
      {name: 'fhf_id', type: 'int', desc: '发货方id'},
      {name: 'fhCity', type: 'string', desc: '发货城市'},
      {name: 'fhd_id', type: 'int', desc: '发货点id'},
      {name: 'fhDate', type: 'string', desc: '发货日期'},
      {name: 'yjdhDate', type: 'string', desc: '预计到货日期'},
      {name: 'sjdhDate', type: 'string', desc: '到货日期'},
      {name: 'shf_id', type: 'int', desc: '收货方id'},
      {name: 'cl_id', type: 'int', desc: '车辆id'},
      {name: 'shCity', type: 'string', desc: '收货城市'},
      {name: 'shd_id', type: 'int', desc: '收货点id'},
      {name: 'cat_id', type: 'int', desc: '商品分类id'},
      {name: 'quantity', type: 'int', desc: '数量'},
      {name: 'weight', type: 'int', desc: '重量'},
      {name: 'zj', type: 'int', desc: '总价'},
      {name: 'yf', type: 'int', desc: '运费'},
      {name: 'fhsf', type: 'string', desc: '发货省份'},
      {name: 'shsf', type: 'string', desc: '收货省份'},
      {name: 'cat', type: 'string', desc: '商品分类'},
      {name: 'wlComp', type: 'string', desc: '物流公司'},
      {name: 'vehicleType', type: 'string', desc: '车型'},
      {name: 'site', type: 'string', desc: '物流园区'},
      {name: 'siteDistrict', type: 'string', desc: '县区'}
    ],
    table: 'invoice',
    data: []
  }
];

const TableMap: Map<string, TableDef> = new Map(Tables.map(d => [d.key, d]));


function loadDataBulk(bulk: string, fields: FieldDef[]): any[] {
  return loadDataRows(bulk.split('\n'), fields);
}

function loadDataRows(rs: string[], fields: FieldDef[]): any[] {
  const data = [];

  let rows = 0;
  for (const row of rs) {
    rows++;
    if (rows === 1) {
      continue;
    }
    if (!row) {
      continue;
    }
    let obj = {};
    const values = row.split('\t');
    for (let index = 0; index < values.length; index++) {
      let value = values[index];
      let field = fields[index];
      let name = field.name;
      if (field.type === 'int') {
        obj[name] = parseInt(value, 10);
      } else if (field.type === 'number') {
        obj[name] = parseFloat(value);
      } else {
        obj[name] = value;
      }
    }
    data.push(obj);
  }

  return data;
}


export {FieldDef, TableDef, TableKeys, Tables, TableMap, loadDataBulk, loadDataRows};
