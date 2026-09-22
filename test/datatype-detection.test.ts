import test from 'node:test';
import assert from 'node:assert/strict';
import { inferValueType, processParsedJsonToDataset } from '../app/lib/json-processor.ts';

test('inferValueType: numbers (integers)', () => {
  assert.equal(inferValueType(42), 'number');
  assert.equal(inferValueType(-10), 'number');
  assert.equal(inferValueType(0), 'number');
  assert.equal(inferValueType('42'), 'number');
  assert.equal(inferValueType('-10'), 'number');
  assert.equal(inferValueType('0'), 'number');
});

test('inferValueType: decimals (floating point numbers & decimal strings)', () => {
  assert.equal(inferValueType(3.14), 'decimal');
  assert.equal(inferValueType(19.99), 'decimal');
  assert.equal(inferValueType(-0.5), 'decimal');
  assert.equal(inferValueType('3.14'), 'decimal');
  assert.equal(inferValueType('19.99'), 'decimal');
  assert.equal(inferValueType('-0.5'), 'decimal');
});

test('inferValueType: strings with leading zeros remain strings', () => {
  assert.equal(inferValueType('00123'), 'string');
  assert.equal(inferValueType('01'), 'string');
  assert.equal(inferValueType('007'), 'string');
});

test('inferValueType: dates (date-only)', () => {
  assert.equal(inferValueType('2024-03-29'), 'date');
  assert.equal(inferValueType('2023/12/31'), 'date');
  assert.equal(inferValueType('2024-01-01'), 'date');
});

test('inferValueType: datetimes (with time component)', () => {
  assert.equal(inferValueType('2024-03-29T14:30:00Z'), 'datetime');
  assert.equal(inferValueType('2024-03-29 14:30:00'), 'datetime');
  assert.equal(inferValueType('2023-01-15T09:30:00.000Z'), 'datetime');
  assert.equal(inferValueType('2024-03-29T14:30:00+05:30'), 'datetime');
});

test('inferValueType: timestamps (unix epoch)', () => {
  // 10-digit epoch seconds with timestamp-like key hint
  assert.equal(inferValueType(1711713600, 'timestamp'), 'timestamp');
  assert.equal(inferValueType(1711713600, 'created_at'), 'timestamp');
  assert.equal(inferValueType(1711713600, 'updatedAt'), 'timestamp');
  assert.equal(inferValueType('1711713600', 'timestamp'), 'timestamp');

  // 13-digit epoch milliseconds
  assert.equal(inferValueType(1711713600000), 'timestamp');
  assert.equal(inferValueType('1711713600000', 'epoch_time'), 'timestamp');

  // Non-timestamp ID fields should stay as numbers
  assert.equal(inferValueType(1711713600, 'user_id'), 'number');
  assert.equal(inferValueType(1711713600, 'order_id'), 'number');
});

test('inferValueType: booleans', () => {
  assert.equal(inferValueType(true), 'boolean');
  assert.equal(inferValueType(false), 'boolean');
  assert.equal(inferValueType('true'), 'boolean');
  assert.equal(inferValueType('false'), 'boolean');
});

test('inferValueType: nulls and objects/arrays', () => {
  assert.equal(inferValueType(null), 'null');
  assert.equal(inferValueType(undefined), 'null');
  assert.equal(inferValueType({ a: 1 }), 'object');
  assert.equal(inferValueType([1, 2, 3]), 'array');
});

test('processParsedJsonToDataset: dominant column type inference', async () => {
  const sampleData = [
    {
      id: 1,
      name: 'Alice',
      price: 10,
      birth_date: '1990-05-15',
      created_at: '2024-01-01T10:00:00Z',
      timestamp: 1711713600,
      active: true,
      code: '007'
    },
    {
      id: 2,
      name: 'Bob',
      price: 19.99, // presence of decimal upgrades column 'price' to decimal
      birth_date: '1995-11-20',
      created_at: '2024-01-02T12:30:00Z',
      timestamp: 1711713700,
      active: false,
      code: '042'
    },
    {
      id: 3,
      name: 'Charlie',
      price: 5.5,
      birth_date: '2000-08-01',
      created_at: '2024-01-03T15:45:00Z',
      timestamp: 1711713800,
      active: true,
      code: '099'
    }
  ];

  const dataset = await processParsedJsonToDataset(
    sampleData,
    JSON.stringify(sampleData),
    'test_data'
  );

  const colMap = new Map(dataset.columns.map((c) => [c.key, c.type]));

  assert.equal(colMap.get('id'), 'number');
  assert.equal(colMap.get('name'), 'string');
  assert.equal(colMap.get('price'), 'decimal');
  assert.equal(colMap.get('birth_date'), 'date');
  assert.equal(colMap.get('created_at'), 'datetime');
  assert.equal(colMap.get('timestamp'), 'timestamp');
  assert.equal(colMap.get('active'), 'boolean');
  assert.equal(colMap.get('code'), 'string'); // leading zeros preserved as string
});

test('processParsedJsonToDataset: sample datasets detection accuracy', async () => {
  const { SAMPLE_USERS, SAMPLE_ORDERS, SAMPLE_PRODUCTS } = await import('../app/lib/sample-data.ts');

  // Test users dataset
  const usersDs = await processParsedJsonToDataset(SAMPLE_USERS, JSON.stringify(SAMPLE_USERS), 'users.json');
  const userCols = new Map(usersDs.columns.map((c) => [c.key, c.type]));
  assert.equal(userCols.get('id'), 'number');
  assert.equal(userCols.get('name'), 'string');
  assert.equal(userCols.get('age'), 'number');
  assert.equal(userCols.get('active'), 'boolean');
  assert.equal(userCols.get('joined_date'), 'datetime');
  assert.equal(userCols.get('address.geo.lat'), 'decimal');
  assert.equal(userCols.get('address.geo.lng'), 'decimal');

  // Test orders dataset
  const ordersDs = await processParsedJsonToDataset(SAMPLE_ORDERS, JSON.stringify(SAMPLE_ORDERS), 'orders.json');
  const orderCols = new Map(ordersDs.columns.map((c) => [c.key, c.type]));
  assert.equal(orderCols.get('order_id'), 'number');
  assert.equal(orderCols.get('user_id'), 'number');
  assert.equal(orderCols.get('total'), 'decimal'); // 249.50, 78.40, etc.
  assert.equal(orderCols.get('status'), 'string');
  assert.equal(orderCols.get('created_at'), 'date'); // "2024-01-10", etc.

  // Test products dataset
  const productsDs = await processParsedJsonToDataset(SAMPLE_PRODUCTS, JSON.stringify(SAMPLE_PRODUCTS), 'products.json');
  const productCols = new Map(productsDs.columns.map((c) => [c.key, c.type]));
  assert.equal(productCols.get('product_id'), 'string'); // "P-101"
  assert.equal(productCols.get('price'), 'decimal'); // 199.99, 129.50
  assert.equal(productCols.get('rating'), 'decimal'); // 4.7, 4.9
  assert.equal(productCols.get('in_stock'), 'boolean');
  assert.equal(productCols.get('stock'), 'number'); // 45, 18, 120
});

