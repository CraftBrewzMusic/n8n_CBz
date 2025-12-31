const jsonata = require('jsonata');

// Sample data
const data = {
  "name": "John",
  "age": 30,
  "orders": [
    { "id": 1, "total": 50 },
    { "id": 2, "total": 75 },
    { "id": 3, "total": 100 }
  ]
};

// Test your JSONata expressions here
const expressions = [
  'name',
  'age * 2',
  'orders.total',
  'orders[total > 50].id',
  '$sum(orders.total)'
];

async function test() {
  console.log('Testing JSONata expressions:\n');
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  for (const expr of expressions) {
    try {
      const expression = jsonata(expr);
      const result = await expression.evaluate(data);
      console.log(`Expression: ${expr}`);
      console.log(`Result: ${JSON.stringify(result, null, 2)}`);
      console.log('-'.repeat(50));
    } catch (error) {
      console.log(`Expression: ${expr}`);
      console.log(`Error: ${error.message}`);
      console.log('-'.repeat(50));
    }
  }

  console.log('\nTo test your own expression, use:');
  console.log('const j=require(\'jsonata\'); j(\'YOUR_EXPR\').evaluate({your:\'data\'}).then(console.log)');
}

test();
