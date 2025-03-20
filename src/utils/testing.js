/**
 * Utility functions for testing the workflow
 */

/**
 * Tests the complete workflow with a sample pattern
 * @returns {Promise<Object>} Test results
 */
export const testWorkflow = async () => {
  const results = {
    steps: [],
    errors: [],
    duration: 0
  };

  const startTime = Date.now();

  try {
    // Sample pattern for testing
    const samplePattern = `
Basic Beanie Pattern
Materials:
- Worsted weight yarn (100g)
- 5mm circular needles
- Stitch markers

Instructions:
Cast on 88 stitches, join in round
Round 1-6: *K2, P2* repeat
Round 7-20: Knit all stitches
Decrease rounds: *K2tog* repeat
Cast off remaining stitches
    `.trim();

    // Step 1: Pattern Optimization
    const { optimizePattern } = await import('../services/workflow/optimizePattern.js');
    const optimizeResult = await optimizePattern(samplePattern);
    results.steps.push({
      name: 'Pattern Optimization',
      success: optimizeResult.success,
      error: optimizeResult.error
    });

    if (!optimizeResult.success) {
      throw new Error(`Pattern optimization failed: ${optimizeResult.error}`);
    }

    // Step 2: PDF Generation
    const { generatePDF } = await import('../services/workflow/generatePDF.js');
    const pdfResult = await generatePDF(optimizeResult);
    results.steps.push({
      name: 'PDF Generation',
      success: pdfResult.success,
      error: pdfResult.error
    });

    if (!pdfResult.success) {
      throw new Error(`PDF generation failed: ${pdfResult.error}`);
    }

    // Step 3: Etsy Listing
    const { generateEtsyListing } = await import('../services/workflow/generateEtsyListing.js');
    const etsyResult = await generateEtsyListing({
      optimizedPattern: optimizeResult.optimizedPattern,
      pdfUrl: pdfResult.pdfUrl
    });
    results.steps.push({
      name: 'Etsy Listing Generation',
      success: etsyResult.success,
      error: etsyResult.error
    });

    if (!etsyResult.success) {
      throw new Error(`Etsy listing generation failed: ${etsyResult.error}`);
    }

  } catch (error) {
    results.errors.push(error.message);
  } finally {
    results.duration = Date.now() - startTime;
  }

  return results;
};

/**
 * Logs workflow test results in a formatted way
 * @param {Object} results - Test results from testWorkflow
 */
export const logWorkflowResults = (results) => {
  console.log('\n=== Workflow Test Results ===\n');
  
  // Log step results
  results.steps.forEach(step => {
    const status = step.success ? '✅' : '❌';
    console.log(`${status} ${step.name}`);
    if (!step.success && step.error) {
      console.log(`   Error: ${step.error}`);
    }
  });

  // Log any errors
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(error => {
      console.log(`❌ ${error}`);
    });
  }

  // Log duration
  console.log(`\nTotal Duration: ${(results.duration / 1000).toFixed(2)}s`);
};
