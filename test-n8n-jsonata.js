const jsonata = require('jsonata');

const expressionStr = `
json{
    \`ISWCCde\`: {
        "disputeFlag": disputeFlag,
        "totalBMIShareMessage": totalBMIShareMessage
    }
}
`;

const expression = jsonata(expressionStr);

// Mock n8n input data - replace with your actual data structure
const mockInput = {
  json: {
    ISWCCde: "T1234567890",
    disputeFlag: true,
    totalBMIShareMessage: "Some message here"
  }
};

async function evaluate() {
  try {
    const result = await expression.evaluate(mockInput.json);
    return result;
  } catch (error) {
    console.error('JSONata Error:', error.message);
    throw error;
  }
}

// Main execution
(async () => {
  console.log('Input data 👇');
  console.log(JSON.stringify(mockInput.json, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  const result = await evaluate();  // MUST await here!

  console.log('Result 👇');
  console.log(JSON.stringify(result, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('\nFinal output (what n8n would return):');
  console.log(JSON.stringify([{ json: result }], null, 2));
})();
