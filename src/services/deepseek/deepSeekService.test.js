import { optimizePattern, generatePDFContent, generateEtsyListing } from './deepSeekService.js';

// Sample knitting pattern for testing
const samplePattern = `
Cast on 20 stitches
Row 1: *K2, P2; repeat from * to end
Row 2: *P2, K2; repeat from * to end
Repeat rows 1-2 for ribbing pattern
Work in pattern for 10 inches
Bind off all stitches
`;

// Test Step 1: Content Optimization
console.log("\n🧶 Testing Pattern Optimization...");
const testOptimization = async () => {
  try {
    console.log("📝 Input Pattern:", samplePattern);
    
    const result = await optimizePattern(samplePattern);
    console.log("\n✅ Optimization Result:", result);
    
    if (result.error) {
      console.error("❌ Optimization failed:", result.error);
      return null;
    }
    
    return result.optimizedPattern;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return null;
  }
};

// Test Step 2: PDF Generation
const testPDFGeneration = async (optimizedPattern) => {
  if (!optimizedPattern) {
    console.error("❌ Cannot test PDF generation: No optimized pattern available");
    return null;
  }

  console.log("\n📄 Testing PDF Generation...");
  try {
    const result = await generatePDFContent(optimizedPattern);
    console.log("\n✅ PDF Generation Result:", result);
    
    if (result.error) {
      console.error("❌ PDF Generation failed:", result.error);
      return null;
    }
    
    return result.pdfContent;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return null;
  }
};

// Test Step 3: Etsy Listing Generation
const testEtsyListing = async (pattern) => {
  if (!pattern) {
    console.error("❌ Cannot test Etsy listing: No pattern available");
    return;
  }

  console.log("\n🏪 Testing Etsy Listing Generation...");
  try {
    const data = {
      pattern,
      title: "2x2 Ribbing Knitting Pattern",
      tags: ["knitting", "ribbing", "beginner-friendly"]
    };

    const result = await generateEtsyListing(data);
    console.log("\n✅ Etsy Listing Result:", result);
    
    if (result.error) {
      console.error("❌ Listing Generation failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

// Run all tests
(async () => {
  console.log("\n🚀 Starting DeepSeek Integration Tests...");
  console.log("=====================================");
  
  // Check environment variables
  console.log("\n🔑 Checking Environment Variables:");
  console.log("API Key configured:", !!import.meta.env.DEEPSEEK_API_KEY);
  console.log("API URL configured:", !!import.meta.env.DEEPSEEK_API_URL);
  console.log("Model configured:", !!import.meta.env.DEEPSEEK_MODEL);
  
  // Run tests in sequence
  const optimizedPattern = await testOptimization();
  const pdfContent = await testPDFGeneration(optimizedPattern);
  await testEtsyListing(optimizedPattern || pdfContent);
  
  console.log("\n=====================================");
  console.log("✨ Tests completed!");
})();
