import { testWorkflow, logWorkflowResults } from '../src/utils/testing.js';

console.log('Starting workflow test...\n');

testWorkflow()
  .then(results => {
    logWorkflowResults(results);
    process.exit(results.errors.length === 0 ? 0 : 1);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
