/**
 * Utility functions for handling learning progression and sequencing
 */

// Learning progression categories
export const PROGRESSION_CATEGORIES = {
  INTRODUCTION: 'Introduction',
  PRACTICE: 'Practice',
  MASTERY: 'Mastery',
  EXTENSION: 'Extension'
};

// Icons for each progression category
export const PROGRESSION_ICONS = {
  [PROGRESSION_CATEGORIES.INTRODUCTION]: 'BookOpen',
  [PROGRESSION_CATEGORIES.PRACTICE]: 'Repeat',
  [PROGRESSION_CATEGORIES.MASTERY]: 'CheckCircle',
  [PROGRESSION_CATEGORIES.EXTENSION]: 'Rocket'
};

// Colors for each progression category
export const PROGRESSION_COLORS = {
  [PROGRESSION_CATEGORIES.INTRODUCTION]: 'blue',
  [PROGRESSION_CATEGORIES.PRACTICE]: 'green',
  [PROGRESSION_CATEGORIES.MASTERY]: 'purple',
  [PROGRESSION_CATEGORIES.EXTENSION]: 'orange'
};

// Descriptions for each progression category
export const PROGRESSION_DESCRIPTIONS = {
  [PROGRESSION_CATEGORIES.INTRODUCTION]: 'Introduces new concepts and foundational knowledge',
  [PROGRESSION_CATEGORIES.PRACTICE]: 'Reinforces learning through guided practice and application',
  [PROGRESSION_CATEGORIES.MASTERY]: 'Demonstrates understanding and mastery of concepts',
  [PROGRESSION_CATEGORIES.EXTENSION]: 'Extends learning with advanced exploration and challenges'
};

/**
 * Determine the learning progression category based on resource type and content
 * @param {Object} resource - The resource object
 * @returns {string} - The progression category
 */
export const determineProgressionCategory = (resource) => {
  const { type, title, description, url } = resource;

  // Convert to lowercase for easier matching
  const typeStr = type ? type.toLowerCase() : '';
  const titleLower = title ? title.toLowerCase() : '';
  const descLower = description ? description.toLowerCase() : '';
  const urlLower = url ? url.toLowerCase() : '';

  // Check for introduction resources
  if (
    titleLower.includes('introduction') ||
    titleLower.includes('intro ') ||
    titleLower.includes('getting started') ||
    titleLower.includes('basics') ||
    titleLower.includes('fundamental') ||
    descLower.includes('introduction to') ||
    descLower.includes('introduces') ||
    descLower.includes('learn about') ||
    descLower.includes('basic concepts')
  ) {
    return PROGRESSION_CATEGORIES.INTRODUCTION;
  }

  // Check for practice resources
  if (
    titleLower.includes('practice') ||
    titleLower.includes('worksheet') ||
    titleLower.includes('exercise') ||
    titleLower.includes('activity') ||
    typeStr.includes('worksheet') ||
    typeStr.includes('activity') ||
    descLower.includes('practice') ||
    descLower.includes('reinforce') ||
    descLower.includes('apply what you') ||
    descLower.includes('try these')
  ) {
    return PROGRESSION_CATEGORIES.PRACTICE;
  }

  // Check for mastery resources
  if (
    titleLower.includes('quiz') ||
    titleLower.includes('test') ||
    titleLower.includes('assessment') ||
    titleLower.includes('mastery') ||
    titleLower.includes('demonstrate') ||
    descLower.includes('demonstrate your') ||
    descLower.includes('show what you') ||
    descLower.includes('mastery') ||
    descLower.includes('assessment')
  ) {
    return PROGRESSION_CATEGORIES.MASTERY;
  }

  // Check for extension resources
  if (
    titleLower.includes('advanced') ||
    titleLower.includes('extension') ||
    titleLower.includes('challenge') ||
    titleLower.includes('project') ||
    titleLower.includes('explore further') ||
    descLower.includes('extension') ||
    descLower.includes('advanced') ||
    descLower.includes('challenge yourself') ||
    descLower.includes('dig deeper')
  ) {
    return PROGRESSION_CATEGORIES.EXTENSION;
  }

  // Default categorization based on resource type
  if (typeStr.includes('video') || typeStr.includes('lesson')) {
    return PROGRESSION_CATEGORIES.INTRODUCTION;
  } else if (typeStr.includes('worksheet') || typeStr.includes('activity')) {
    return PROGRESSION_CATEGORIES.PRACTICE;
  } else if (typeStr.includes('quiz') || typeStr.includes('assessment')) {
    return PROGRESSION_CATEGORIES.MASTERY;
  } else if (typeStr.includes('game') || typeStr.includes('project')) {
    return PROGRESSION_CATEGORIES.EXTENSION;
  }

  // Default to introduction if no other matches
  return PROGRESSION_CATEGORIES.INTRODUCTION;
};

/**
 * Estimate completion time for a resource based on type, content, and metadata
 * @param {Object} resource - The resource object
 * @returns {string} - Estimated completion time (e.g., "10 minutes")
 */
export const estimateCompletionTime = (resource) => {
  // If the resource already has a duration or time estimate, use that
  if (resource.duration) {
    return resource.duration;
  }

  if (resource.estimatedTime) {
    return resource.estimatedTime;
  }

  const { type, title, description } = resource;
  const typeStr = type ? type.toLowerCase() : '';
  const titleLower = title ? title.toLowerCase() : '';
  const descLower = description ? description.toLowerCase() : '';

  // Try to extract time from title or description (e.g., "15-minute activity")
  const timeRegex = /(\d+)[\s-]*(min|minute|minutes)/i;
  const titleMatch = titleLower.match(timeRegex);
  const descMatch = descLower.match(timeRegex);

  if (titleMatch && titleMatch[1]) {
    const minutes = parseInt(titleMatch[1], 10);
    return `${minutes} minutes`;
  }

  if (descMatch && descMatch[1]) {
    const minutes = parseInt(descMatch[1], 10);
    return `${minutes} minutes`;
  }

  // Base times by resource type and progression category (in minutes)
  const category = resource.progressionCategory || determineProgressionCategory(resource);

  // More specific time estimates based on type and category
  if (typeStr.includes('video')) {
    return category === PROGRESSION_CATEGORIES.INTRODUCTION ? '8-12 minutes' : '10-15 minutes';
  } else if (typeStr.includes('worksheet')) {
    return category === PROGRESSION_CATEGORIES.PRACTICE ? '15-20 minutes' : '10-15 minutes';
  } else if (typeStr.includes('lesson')) {
    return category === PROGRESSION_CATEGORIES.INTRODUCTION ? '25-35 minutes' : '30-45 minutes';
  } else if (typeStr.includes('activity')) {
    return category === PROGRESSION_CATEGORIES.PRACTICE ? '20-30 minutes' : '15-25 minutes';
  } else if (typeStr.includes('game') || typeStr.includes('interactive')) {
    return category === PROGRESSION_CATEGORIES.EXTENSION ? '20-30 minutes' : '15-25 minutes';
  } else if (typeStr.includes('quiz') || typeStr.includes('assessment')) {
    return category === PROGRESSION_CATEGORIES.MASTERY ? '10-15 minutes' : '5-10 minutes';
  } else if (typeStr.includes('project')) {
    return category === PROGRESSION_CATEGORIES.EXTENSION ? '45-60 minutes' : '30-45 minutes';
  }

  // Default times by category
  switch (category) {
    case PROGRESSION_CATEGORIES.INTRODUCTION:
      return '10-15 minutes';
    case PROGRESSION_CATEGORIES.PRACTICE:
      return '15-20 minutes';
    case PROGRESSION_CATEGORIES.MASTERY:
      return '10-15 minutes';
    case PROGRESSION_CATEGORIES.EXTENSION:
      return '20-30 minutes';
    default:
      return '15-20 minutes';
  }
};

/**
 * Sort resources by learning progression sequence
 * @param {Array} resources - Array of resource objects
 * @returns {Array} - Sorted array of resources
 */
export const sortByLearningProgression = (resources) => {
  // Define the order of progression categories
  const order = {
    [PROGRESSION_CATEGORIES.INTRODUCTION]: 1,
    [PROGRESSION_CATEGORIES.PRACTICE]: 2,
    [PROGRESSION_CATEGORIES.MASTERY]: 3,
    [PROGRESSION_CATEGORIES.EXTENSION]: 4
  };

  // Sort resources by progression category
  return [...resources].sort((a, b) => {
    const categoryA = a.progressionCategory || determineProgressionCategory(a);
    const categoryB = b.progressionCategory || determineProgressionCategory(b);

    return order[categoryA] - order[categoryB];
  });
};

/**
 * Group resources by learning progression category
 * @param {Array} resources - Array of resource objects
 * @returns {Object} - Object with resources grouped by category
 */
export const groupByProgressionCategory = (resources) => {
  const result = {
    [PROGRESSION_CATEGORIES.INTRODUCTION]: [],
    [PROGRESSION_CATEGORIES.PRACTICE]: [],
    [PROGRESSION_CATEGORIES.MASTERY]: [],
    [PROGRESSION_CATEGORIES.EXTENSION]: []
  };

  resources.forEach(resource => {
    const category = resource.progressionCategory || determineProgressionCategory(resource);
    result[category].push(resource);
  });

  return result;
};
