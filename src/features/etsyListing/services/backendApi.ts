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
    // Payload prepared for API call
    // Çift /api/api sorununu önlemek için başındaki /api önekini kaldırıyoruz
    // apiClient'ın baseURL'i zaten /api içeriyor olabilir
    const response = await apiClient.post("save-listing", listingData);
    return response.data;
  } catch (error) {
    // Error handled by caller
    throw error;
  }
}
