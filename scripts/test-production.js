import dotenv from 'dotenv';
import { testWorkflow, logWorkflowResults } from '../src/utils/testing.js';
import logger from '../src/services/workflow/utils/logger.js';

// Load production environment variables
dotenv.config({ path: '.env.production' });

// Override any test-specific settings
process.env.NODE_ENV = 'production';
process.env.ENABLE_MOCK_MODE = 'false';

// Configure logger for production testing
logger.level = process.env.LOG_LEVEL || 'info';

console.log('Starting production workflow test...\n');

const runProductionTests = async () => {
  try {
    // Test data
    const testPattern = `
      Knitting Pattern: Basic Scarf
      Materials:
      - 200g worsted weight yarn
      - 5mm knitting needles
      
      Instructions:
      1. Cast on 40 stitches
      2. Knit in garter stitch for 60 inches
      3. Cast off loosely
      
      Gauge: 20 stitches = 4 inches
    `.trim();

    // Test with real pattern
    const results = await testWorkflow(testPattern);
    logWorkflowResults(results);

    // Additional production-specific tests
    await testRateLimiting();
    await testErrorHandling();
    await testPerformance();

    return results.errors.length === 0;
  } catch (error) {
    console.error('Production test failed:', error);
    return false;
  }
};

const testRateLimiting = async () => {
  console.log('\nTesting rate limiting...');
  const start = Date.now();
  const requests = Array(5).fill().map(() => testWorkflow());
  const results = await Promise.all(requests);
  const duration = Date.now() - start;
  
  console.log(`Rate limiting test completed in ${duration}ms`);
  console.log(`Average request time: ${(duration / requests.length).toFixed(2)}ms`);
};

const testErrorHandling = async () => {
  console.log('\nTesting error handling...');
  
  // Test with invalid input
  const invalidResult = await testWorkflow('');
  console.log('Invalid input test:', invalidResult.errors.length > 0 ? '✅' : '❌');
  
  // Test with malformed input
  const malformedResult = await testWorkflow('Not a valid pattern');
  console.log('Malformed input test:', malformedResult.errors.length > 0 ? '✅' : '❌');
  
  // Test with API timeout
  const originalTimeout = process.env.DEEPSEEK_TIMEOUT;
  process.env.DEEPSEEK_TIMEOUT = '1';
  const timeoutResult = await testWorkflow();
  console.log('Timeout handling test:', timeoutResult.errors.length > 0 ? '✅' : '❌');
  
  // Reset timeout
  process.env.DEEPSEEK_TIMEOUT = originalTimeout;
  
  // Test with rate limiting
  const originalRateLimit = process.env.DEEPSEEK_RATE_LIMIT;
  process.env.DEEPSEEK_RATE_LIMIT = '1';
  const rateLimitResult = await testWorkflow();
  console.log('Rate limit test:', rateLimitResult.errors.length > 0 ? '✅' : '❌');
  
  // Reset rate limit
  process.env.DEEPSEEK_RATE_LIMIT = originalRateLimit;
};

const testPerformance = async () => {
  console.log('\nTesting performance...');
  
  const testPatterns = [
    'Basic Scarf Pattern',
    'Complex Sweater Pattern',
    'Simple Hat Pattern'
  ].map(name => `
    Knitting Pattern: ${name}
    Materials:
    - Yarn
    - Needles
    
    Instructions:
    1. Cast on
    2. Knit rows
    3. Cast off
  `.trim());
  
  const durations = [];
  
  for (const pattern of testPatterns) {
    const start = Date.now();
    await testWorkflow(pattern);
    durations.push(Date.now() - start);
  }
  
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  console.log('Performance Results:');
  console.log(`- Average duration: ${avgDuration.toFixed(2)}ms`);
  console.log(`- Minimum duration: ${minDuration.toFixed(2)}ms`);
  console.log(`- Maximum duration: ${maxDuration.toFixed(2)}ms`);
  console.log(`- Variance: ${(maxDuration - minDuration).toFixed(2)}ms`);
};

runProductionTests()
  .then(success => {
    if (success) {
      console.log('\n✅ Production tests passed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Production tests failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\nTest execution failed:', error);
    process.exit(1);
  });
