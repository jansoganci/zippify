import { etsyRules } from "@/platformRules/etsyRules";

/**
 * Generates an optimized Etsy description based on user input and platform rules.
 * @param options - Object containing input parameters
 * @param options.promptInput - The input prompt containing product information
 * @param options.productType - The type of product (digital or physical)
 * @param options.productDimensions - The dimensions of the product
 * @returns Generated description response
 */
export async function generateDescription({
  promptInput,
  productType = "physical",
  productDimensions = ""
}: {
  promptInput: string;
  productType?: "digital" | "physical";
  productDimensions?: string;
}): Promise<any> {
  const systemPrompt = etsyRules.description.fullPrompt;

  const digitalDisclaimer = productType === "digital" ? "yes" : "no";

  const finalPrompt = systemPrompt
    .replace("[productName]", promptInput)
    .replace("[productDetails]", promptInput)
    .replace("[targetAudience]", "Etsy shoppers")
    .replace("[keywords]", "")
    .replace("[tone]", "warm and conversational")
    .replace("[length]", "medium")
    .replace("[format]", "paragraphs with bullet points")
    .replace("[callToAction]", "yes")
    .replace("[digitalDisclaimer]", digitalDisclaimer)
    .replace("[productType]", productType)
    .replace("[productDimensions]", productDimensions);

  // JWT token'ı localStorage'dan al
  const token = localStorage.getItem('zippify_token');

  // Return AI call structure (adjust model/provider if needed)
  const response = await fetch("/api/deepseek", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({
      system: systemPrompt,
      prompt: finalPrompt,
      featureKey: "create-listing"
    }),
  });

  const data = await response.json();
  return data;
}
