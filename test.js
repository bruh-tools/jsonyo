const { validate, format, minify, query, getKeys, getType, diff, stats } = require('./src/json-utils');

console.log('running tests... bruh.\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`✗ ${name}`);
    console.log(`  ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'assertion failed');
}

// validate tests
test('validate: valid JSON returns true', () => {
  const result = validate('{"name": "test"}');
  assert(result.valid === true);
});

test('validate: invalid JSON returns false', () => {
  const result = validate('{invalid}');
  assert(result.valid === false);
  assert(result.error !== null);
});

test('validate: empty object is valid', () => {
  const result = validate('{}');
  assert(result.valid === true);
});

test('validate: array is valid', () => {
  const result = validate('[1, 2, 3]');
  assert(result.valid === true);
});

// format tests
test('format: pretty prints with default indent', () => {
  const result = format('{"a":1}');
  assert(result.includes('\n'));
  assert(result.includes('  "a"'));
});

test('format: respects custom indent', () => {
  const result = format('{"a":1}', 4);
  assert(result.includes('    "a"'));
});

// minify tests
test('minify: removes whitespace', () => {
  const result = minify('{\n  "a": 1\n}');
  assert(result === '{"a":1}');
});

// query tests
test('query: simple path', () => {
  const result = query('{"name": "john"}', '$.name');
  assert(result === 'john');
});

test('query: nested path', () => {
  const result = query('{"user": {"name": "john"}}', '$.user.name');
  assert(result === 'john');
});

test('query: array index', () => {
  const result = query('{"items": [1, 2, 3]}', '$.items[1]');
  assert(result === 2);
});

test('query: returns undefined for missing path', () => {
  const result = query('{"a": 1}', '$.b');
  assert(result === undefined);
});

// getKeys tests
test('getKeys: returns top-level keys', () => {
  const result = getKeys('{"a": 1, "b": 2}');
  assert(result.includes('a'));
  assert(result.includes('b'));
});

test('getKeys: respects depth', () => {
  const result = getKeys('{"a": {"b": 1}}', 2);
  assert(result.includes('a'));
  assert(result.includes('a.b'));
});

// getType tests
test('getType: detects object', () => {
  const result = getType('{"a": 1}');
  assert(result.type === 'object');
  assert(result.keys === 1);
});

test('getType: detects array', () => {
  const result = getType('[1, 2, 3]');
  assert(result.type === 'array');
  assert(result.length === 3);
});

test('getType: detects null', () => {
  const result = getType('null');
  assert(result.type === 'null');
});

// diff tests
test('diff: no differences for identical JSON', () => {
  const result = diff('{"a": 1}', '{"a": 1}');
  assert(result.length === 0);
});

test('diff: detects value change', () => {
  const result = diff('{"a": 1}', '{"a": 2}');
  assert(result.length === 1);
  assert(result[0].type === 'value_change');
});

test('diff: detects added key', () => {
  const result = diff('{"a": 1}', '{"a": 1, "b": 2}');
  assert(result.some(d => d.type === 'added'));
});

test('diff: detects removed key', () => {
  const result = diff('{"a": 1, "b": 2}', '{"a": 1}');
  assert(result.some(d => d.type === 'removed'));
});

// stats tests
test('stats: counts objects', () => {
  const result = stats('{"a": {"b": 1}}');
  assert(result.objects === 2);
});

test('stats: counts arrays', () => {
  const result = stats('{"items": [1, 2, [3, 4]]}');
  assert(result.arrays === 2);
});

test('stats: calculates depth', () => {
  const result = stats('{"a": {"b": {"c": 1}}}');
  assert(result.maxDepth === 3);
});

console.log(`\n${passed}/${passed + failed} tests passed`);
process.exit(failed > 0 ? 1 : 0);
