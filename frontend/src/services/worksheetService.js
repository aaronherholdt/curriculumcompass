/**
 * Worksheet Service
 * 
 * Service for interacting with the worksheet API
 */

/**
 * Generate a worksheet via the API
 * @param {Object} resource - The resource object including contentText
 * @param {string} childName - Child's name
 * @param {string} grade - Grade level
 * @param {string} worksheetType - Type of worksheet
 * @returns {Promise} - Promise resolving to worksheet data
 */
export const generateWorksheet = async (resource, childName, grade, worksheetType) => {
  try {
    const response = await fetch('/api/worksheets/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resource,
        childName,
        grade,
        worksheetType
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating worksheet:', error);
    throw error;
  }
};

/**
 * Fetch content from a resource URL
 * @param {string} url - The URL to fetch content from
 * @returns {Promise} - Promise resolving to content data
 */
export const fetchResourceContent = async (url) => {
  try {
    const response = await fetch('/api/worksheets/fetch-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching resource content:', error);
    throw error;
  }
};

/**
 * Get available worksheet types for a subject and grade
 * @param {string} subject - The subject
 * @param {string} grade - The grade level
 * @returns {Promise} - Promise resolving to worksheet types
 */
export const getWorksheetTypes = async (subject, grade) => {
  try {
    const response = await fetch(`/api/worksheets/types?subject=${encodeURIComponent(subject)}&grade=${encodeURIComponent(grade)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting worksheet types:', error);
    throw error;
  }
};

/**
 * Generate an answer key for a worksheet
 * @param {Object} resource - The resource object
 * @param {string} worksheetType - The worksheet type
 * @returns {Promise} - Promise resolving to answer key data
 */
export const generateAnswerKey = async (resource, worksheetType) => {
  try {
    const response = await fetch('/api/worksheets/answer-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resource,
        worksheetType
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating answer key:', error);
    throw error;
  }
};

export default {
  generateWorksheet,
  fetchResourceContent,
  getWorksheetTypes,
  generateAnswerKey
}; 