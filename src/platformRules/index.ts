// Central registry for platform-specific system prompts
// This file exports a function to get the appropriate prompt rules based on platform

import { etsyRules } from './etsyRules';

/**
 * Returns the appropriate prompt rules for the specified platform
 * @param platform - The platform to get rules for (e.g., "etsy")
 * @returns The platform-specific prompt rules
 */
export function getPlatformPromptRules(platform: string) {
  if (platform.toLowerCase() === "etsy") {
    return etsyRules;
  }
  
  // Default to Etsy rules as fallback
  return etsyRules;
}
