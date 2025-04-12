// Etsy-specific listing prompt rules
// This file stores structured prompt templates for Etsy listing generation
// Each rule group includes type, instruction, variables, and the full prompt template

// etsyRules.ts

export const etsyRules = {
  title: {
    type: "title",
    instruction:
      "Generate an Etsy product title (max 130 characters). Front-load high-volume keywords, include material/style/usage details, and ensure grammatical correctness.",
    variables: ["productDescription", "targetKeywords"],
    formatExample:
      "[Keyword 1] [Product Type] – [Key Feature] – [Audience or Occasion]",
    fullPrompt: `Task: Generate a single clean product title for an Etsy listing.

Product Description: [productDescription]  
Target Keywords: [targetKeywords]  
Character Limit: 130

Format suggestion:  
[Keyword 1] [Product Type] – [Key Feature] – [Audience or Occasion]

Rules:  
- Return exactly ONE title without variations or options  
- Do not use markdown formatting (no asterisks, bold, or italics)  
- Do not include explanatory notes or comments  
- Prioritize important keywords (front-load)  
- Max 130 characters, mobile-optimized for first 70  
- Ensure natural grammar and phrasing  
- No ALL CAPS words  
- Use separators like "–" or "|" sparingly and consistently  
- Include seasonal/trend keywords if relevant  
`,
  },

  description: {
    type: "description",
    instruction:
      "Write a warm, SEO-friendly Etsy product description that informs, reassures, and encourages purchase.",
    variables: [
      "productName",
      "productDetails",
      "targetAudience",
      "keywords",
      "tone",
      "length",
      "format",
      "callToAction",
      "digitalDisclaimer",
      "productType",
      "productDimensions",
    ],
    fullPrompt: `Task: Write a compelling Etsy product description.

Product Name: [productName]
Details: [productDetails]
Target Audience: [targetAudience]
Keywords: [keywords]
Tone: [tone]
Length: [length]
Format: [format]
Call to Action: [callToAction]
Digital Product Disclaimer: [digitalDisclaimer]
Product Type: [productType]

Structure:
1. Intro (2–3 sentences, keywords + emotional hook)
2. Features (bulleted: materials, size, method)
   ✔ Versatile Size – Measures [productDimensions]
3. Benefits / Use Cases
4. Digital disclaimer (only if [productType] === "digital")
5. Optional soft CTA
6. Personalization instructions (if applicable)

Guidelines:
- Use natural tone (warm, helpful, inviting)
- No FAQ section
- Avoid repetition and keyword stuffing
- Use short paragraphs and bullet lists for mobile readability
`,
  },

  tags: {
    type: "tags",
    instruction:
      "Generate 13 Etsy tags (each max 20 characters, min 2 words, no special characters), with SEO-balanced competition levels.",
    variables: [
      "productName",
      "productDescription",
      "targetAudience",
      "broadAndSpecificKeywords",
      "category",
      "attributes",
    ],
    fullPrompt: `Task: Generate exactly 13 Etsy tags for the product as a plain list.

Product Name: [productName]  
Product Description: [productDescription]  
Target Audience: [targetAudience]  
Keywords: [broadAndSpecificKeywords]  
Category: [category]  
Attributes: [attributes]  

Rules:  
- Return only an array of 13 strings (no markdown, no extra text)  
- Each tag max 20 characters, min 2 words  
- No special characters (no hyphens, apostrophes, emojis)  
- All tags must be directly relevant  
- Mix of styles, functions, materials, and audiences  
- Ensure variety of competition levels (high/med/low SEO competition)  
- No duplicate or similar phrases  
- Do not include headers, categories, or commentary
Example Output:  
["wooden breakfast tray", "teak wood decor", "handmade home gift", "cozy rustic style", ...]  
`,
  },

  altText: {
    type: "altText",
    instruction:
      "Write SEO-friendly, accessible alt text for Etsy product images (max 130 characters each).",
    variables: [
      "productName",
      "productDescription",
      "targetAudience",
      "keywords",
      "images",
    ],
    fullPrompt: `Task: Write alt text for Etsy product images.

Product Name: [productName]
Description: [productDescription]
Audience: [targetAudience]
Keywords: [keywords]
Images:
- [image1]
- [image2]
- [image3]

Guidelines:
- Each alt text max 130 characters
- Include 1 natural keyword per image
- Describe content, usage, material, setting/action if applicable
- Each alt text must be unique
- Avoid generic phrases, keyword stuffing, or vague terms
`,
  },

  general: {
    type: "general",
    instruction:
      "Follow Etsy policy-compliant listing strategies. Ensure accuracy, clarity, and conversion-boosting content.",
    variables: [],
    fullPrompt: `Task: Ensure general listing optimization and compliance.

Rules:
- Be accurate and transparent (no exaggeration or false claims)
- Do not mention pricing or discounts in descriptions
- Use emotional storytelling when possible
- Include niche search terms naturally (e.g., unisex, cottagecore, gift)
- Fill Etsy's category and occasion fields
- Use "digital download" disclaimer if applicable
- Recommend light updates every 2–3 weeks for renewal strategy

Tips:
- Use A/B testing for listing improvement
- Match tone to successful Etsy reviews (warm, relatable)
- Optimize for mobile viewing
- If selling globally, localize keywords and measurements
`,
  },
};
