import { backendApi as apiClient } from "@/services/workflow/apiClient";

/**
 * Creates a new listing by sending data to the backend API
 * @param listingData The listing data to save
 * @returns The response from the API
 */
export async function createListing(listingData: {
  title: string;
  description: string;
  tags: string[];
  altTexts: string[];
  originalPrompt: string;
}) {
  try {
    console.log("💶 [createListing] Payload being sent:", listingData);
    const response = await apiClient.post("/api/save-listing", listingData);
    return response.data;
  } catch (error) {
    console.error("❌ [createListing] Failed to save listing:", error);
    throw error;
  }
}
