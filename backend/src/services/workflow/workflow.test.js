import WorkflowController from './workflowController.js';

// Sample knitting pattern for testing
const samplePattern = `
Cast on 20 stitches
Row 1: *K2, P2; repeat from * to end
Row 2: *P2, K2; repeat from * to end
Repeat rows 1-2 for ribbing pattern
Work in pattern for 10 inches
Bind off all stitches
`;

const testData = {
  pattern: samplePattern,
  title: "2x2 Ribbing Pattern",
  tags: ["knitting", "ribbing", "beginner"]
};

// Test individual steps
const testIndividualSteps = async () => {
  console.log("\n🧪 Testing Individual Steps...");
  const workflow = new WorkflowController();

  try {
    // Step 1: Pattern Optimization
    console.log("\n🧶 Step 1: Pattern Optimization");
    const optimizationResult = await workflow.runStep('pattern_optimization', testData.pattern);
    console.log("Result:", optimizationResult.success ? "✅ Success" : "❌ Failed");
    if (!optimizationResult.success) throw new Error(optimizationResult.error);

    // Step 2: PDF Generation
    console.log("\n📄 Step 2: PDF Generation");
    const pdfResult = await workflow.runStep('pdf_generation', optimizationResult);
    console.log("Result:", pdfResult.success ? "✅ Success" : "❌ Failed");
    if (!pdfResult.success) throw new Error(pdfResult.error);

    // Step 3: Etsy Listing Generation
    console.log("\n🏪 Step 3: Etsy Listing Generation");
    const listingResult = await workflow.runStep('etsy_listing', pdfResult, {
      title: testData.title,
      tags: testData.tags
    });
    console.log("Result:", listingResult.success ? "✅ Success" : "❌ Failed");
    if (!listingResult.success) throw new Error(listingResult.error);

    return true;
  } catch (error) {
    console.error("\n❌ Test Failed:", error.message);
    return false;
  }
};

// Test full workflow
const testFullWorkflow = async () => {
  console.log("\n🔄 Testing Full Workflow...");
  const workflow = new WorkflowController();

  try {
    const result = await workflow.runFullWorkflow(testData);
    console.log("\nWorkflow Result:", result.success ? "✅ Success" : "❌ Failed");
    
    if (result.success) {
      console.log("\n📊 Results Summary:");
      console.log("Pattern Optimization:", result.results.pattern_optimization?.success ? "✅" : "❌");
      console.log("PDF Generation:", result.results.pdf_generation?.success ? "✅" : "❌");
      console.log("Etsy Listing:", result.results.etsy_listing?.success ? "✅" : "❌");
    } else {
      throw new Error(result.error);
    }

    return true;
  } catch (error) {
    console.error("\n❌ Test Failed:", error.message);
    return false;
  }
};

// Run all tests
(async () => {
  console.log("\n🚀 Starting Workflow Tests");
  console.log("======================");

  // Test individual steps
  const individualStepsResult = await testIndividualSteps();
  
  // Test full workflow
  const fullWorkflowResult = await testFullWorkflow();

  console.log("\n======================");
  console.log("📝 Test Summary");
  console.log("Individual Steps:", individualStepsResult ? "✅ Passed" : "❌ Failed");
  console.log("Full Workflow:", fullWorkflowResult ? "✅ Passed" : "❌ Failed");
  console.log("======================\n");
})();
