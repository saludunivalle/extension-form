/**
 * Utility functions for handling API calls with retry logic and rate limiting
 */

/**
 * Creates a delay for the specified number of milliseconds
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after the delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes a function with exponential backoff retry logic
 * Specifically designed to handle Google Sheets API rate limiting (429 errors)
 * 
 * @param {Function} fn - The async function to execute
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000ms)
 * @returns {Promise} - Result of the function execution
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Handle rate limiting errors (429) specifically
      if (error.response?.status === 429 && attempt < maxRetries - 1) {
        const delayTime = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limit hit, retrying in ${delayTime}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await delay(delayTime);
        continue;
      }
      
      // Handle other server errors with shorter delays
      if (error.response?.status >= 500 && attempt < maxRetries - 1) {
        const delayTime = baseDelay * 0.5 * Math.pow(1.5, attempt);
        console.log(`Server error ${error.response.status}, retrying in ${delayTime}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await delay(delayTime);
        continue;
      }
      
      // If we've exhausted retries or it's a non-retryable error, throw
      throw error;
    }
  }
};

/**
 * Wrapper for axios requests with built-in retry logic
 * @param {Object} axiosConfig - Axios request configuration
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay for exponential backoff
 * @returns {Promise} - Axios response
 */
export const apiRequestWithRetry = async (axiosConfig, maxRetries = 3, baseDelay = 1000) => {
  const axios = await import('axios');
  return retryWithBackoff(() => axios.default(axiosConfig), maxRetries, baseDelay);
};

/**
 * Throttle function to limit the rate of function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Debounce function to delay function execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return function() {
    const args = arguments;
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(context, args), delay);
  };
}; 