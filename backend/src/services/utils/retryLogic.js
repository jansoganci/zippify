/**
 * Utility function for retrying async operations with exponential backoff
 * Useful for API calls that might fail temporarily due to rate limits or network issues
 */

/**
 * Executes an async function with retry logic and exponential backoff
 * 
 * @param {Function} fn - Async function to execute
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} initialDelay - Initial delay in milliseconds before first retry (default: 1000)
 * @returns {Promise<any>} - Result of the function execution
 * @throws {Error} - Throws the last error if all retries fail
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let currentRetry = 0;
  let delay = initialDelay;
  
  // Keep track of errors for better debugging
  const errors = [];
  
  while (currentRetry <= maxRetries) {
    try {
      // If this is a retry attempt, log it
      if (currentRetry > 0) {
        console.log(`Retry attempt ${currentRetry}/${maxRetries} (delay: ${delay}ms)...`);
      }
      
      // Execute the function
      return await fn();
      
    } catch (error) {
      // Store the error for debugging
      errors.push(error);
      
      // If we've exhausted all retries, throw the last error
      if (currentRetry >= maxRetries) {
        logger.error(`All ${maxRetries} retry attempts failed.`);
        logger.error(`Error history:`, errors.map(e => e.message));
        throw error;
      }
      
      // Log the error and prepare for retry
      logger.warn(`Attempt ${currentRetry + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
      
      // Wait before the next retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase retry counter and delay (exponential backoff)
      currentRetry++;
      delay *= 2; // Double the delay each time
    }
  }
}
