/**
 * Utility functions for handling educational resources
 */

// Default thumbnail images for different resource types
const DEFAULT_THUMBNAILS = {
  video: '/images/video-thumbnail.jpg',
  worksheet: '/images/worksheet-thumbnail.jpg',
  interactive: '/images/interactive-thumbnail.jpg',
  lesson: '/images/lesson-thumbnail.jpg',
  activity: '/images/activity-thumbnail.jpg',
  default: '/images/resource-thumbnail.jpg'
};

/**
 * Extract a thumbnail URL from a resource based on its type and URL
 * @param {Object} resource - The resource object
 * @returns {string} - URL for the thumbnail image
 */
export const extractThumbnail = (resource) => {
  const { url, type } = resource;
  
  // Try to extract YouTube video ID for thumbnail
  if (url && url.includes('youtube.com')) {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoId && videoId[1]) {
      return `https://img.youtube.com/vi/${videoId[1]}/mqdefault.jpg`;
    }
  }
  
  // For Khan Academy
  if (url && url.includes('khanacademy.org')) {
    return '/images/khan-academy-thumbnail.jpg';
  }
  
  // For PBS Kids
  if (url && url.includes('pbskids.org')) {
    return '/images/pbs-kids-thumbnail.jpg';
  }
  
  // For Education.com
  if (url && url.includes('education.com')) {
    return '/images/education-com-thumbnail.jpg';
  }
  
  // For Teachers Pay Teachers
  if (url && url.includes('teacherspayteachers.com')) {
    return '/images/tpt-thumbnail.jpg';
  }
  
  // Fallback to type-based default thumbnails
  const typeStr = type ? type.toLowerCase() : '';
  
  if (typeStr.includes('video')) {
    return DEFAULT_THUMBNAILS.video;
  } else if (typeStr.includes('worksheet') || typeStr.includes('pdf')) {
    return DEFAULT_THUMBNAILS.worksheet;
  } else if (typeStr.includes('game') || typeStr.includes('interactive')) {
    return DEFAULT_THUMBNAILS.interactive;
  } else if (typeStr.includes('lesson') || typeStr.includes('plan')) {
    return DEFAULT_THUMBNAILS.lesson;
  } else if (typeStr.includes('activity') || typeStr.includes('project')) {
    return DEFAULT_THUMBNAILS.activity;
  }
  
  // Default fallback
  return DEFAULT_THUMBNAILS.default;
};

/**
 * Determine the type of resource based on URL and title
 * @param {Object} resource - The resource object
 * @returns {string} - The resource type
 */
export const determineResourceType = (resource) => {
  const { url, title, type } = resource;
  
  // If type is already provided, use it
  if (type) return type;
  
  // Otherwise try to determine from URL and title
  const urlLower = url ? url.toLowerCase() : '';
  const titleLower = title ? title.toLowerCase() : '';
  
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be') || 
      titleLower.includes('video') || urlLower.includes('video')) {
    return 'Video';
  }
  
  if (urlLower.includes('.pdf') || titleLower.includes('worksheet') || 
      titleLower.includes('printable') || urlLower.includes('worksheet')) {
    return 'Worksheet';
  }
  
  if (titleLower.includes('game') || urlLower.includes('game') || 
      titleLower.includes('interactive') || urlLower.includes('interactive')) {
    return 'Interactive';
  }
  
  if (titleLower.includes('lesson') || urlLower.includes('lesson') || 
      titleLower.includes('plan') || urlLower.includes('plan')) {
    return 'Lesson Plan';
  }
  
  if (titleLower.includes('activity') || urlLower.includes('activity') || 
      titleLower.includes('project') || urlLower.includes('project')) {
    return 'Activity';
  }
  
  return 'Resource';
};

/**
 * Save a resource to local storage for later access
 * @param {Object} resource - The resource to save
 * @returns {boolean} - Success status
 */
export const saveResourceForLater = (resource) => {
  try {
    // Get existing saved resources
    const savedResources = JSON.parse(localStorage.getItem('savedResources') || '[]');
    
    // Check if resource is already saved
    const isAlreadySaved = savedResources.some(item => item.url === resource.url);
    
    if (!isAlreadySaved) {
      // Add to saved resources
      savedResources.push({
        ...resource,
        savedAt: new Date().toISOString()
      });
      
      // Save back to localStorage
      localStorage.setItem('savedResources', JSON.stringify(savedResources));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving resource:', error);
    return false;
  }
};

/**
 * Remove a saved resource from local storage
 * @param {Object} resource - The resource to remove
 * @returns {boolean} - Success status
 */
export const removeSavedResource = (resource) => {
  try {
    // Get existing saved resources
    const savedResources = JSON.parse(localStorage.getItem('savedResources') || '[]');
    
    // Filter out the resource to remove
    const updatedResources = savedResources.filter(item => item.url !== resource.url);
    
    // Save back to localStorage
    localStorage.setItem('savedResources', JSON.stringify(updatedResources));
    
    return true;
  } catch (error) {
    console.error('Error removing saved resource:', error);
    return false;
  }
};

/**
 * Get all saved resources from local storage
 * @returns {Array} - Array of saved resources
 */
export const getSavedResources = () => {
  try {
    return JSON.parse(localStorage.getItem('savedResources') || '[]');
  } catch (error) {
    console.error('Error getting saved resources:', error);
    return [];
  }
};
