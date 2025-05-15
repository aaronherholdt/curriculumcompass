import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Repeat,
  CheckCircle,
  Rocket,
  ChevronRight,
  Clock
} from 'lucide-react';
import ResourceCard from './ResourceCard';
import {
  PROGRESSION_CATEGORIES,
  PROGRESSION_DESCRIPTIONS,
  groupByProgressionCategory,
  estimateCompletionTime
} from '../utils/learningProgressionHelpers';

// Map category names to their respective icons
const categoryIcons = {
  [PROGRESSION_CATEGORIES.INTRODUCTION]: BookOpen,
  [PROGRESSION_CATEGORIES.PRACTICE]: Repeat,
  [PROGRESSION_CATEGORIES.MASTERY]: CheckCircle,
  [PROGRESSION_CATEGORIES.EXTENSION]: Rocket
};

// Map category names to their respective colors
const categoryColors = {
  [PROGRESSION_CATEGORIES.INTRODUCTION]: 'blue',
  [PROGRESSION_CATEGORIES.PRACTICE]: 'green',
  [PROGRESSION_CATEGORIES.MASTERY]: 'purple',
  [PROGRESSION_CATEGORIES.EXTENSION]: 'orange'
};

// Get the appropriate color classes for a category
const getCategoryColorClasses = (category) => {
  switch (category) {
    case PROGRESSION_CATEGORIES.INTRODUCTION:
      return {
        bg: 'bg-blue-900 bg-opacity-20',
        border: 'border-blue-700',
        text: 'text-blue-400',
        hover: 'hover:bg-blue-800 hover:bg-opacity-30',
        iconBg: 'bg-blue-900 bg-opacity-50'
      };
    case PROGRESSION_CATEGORIES.PRACTICE:
      return {
        bg: 'bg-green-900 bg-opacity-20',
        border: 'border-green-700',
        text: 'text-green-400',
        hover: 'hover:bg-green-800 hover:bg-opacity-30',
        iconBg: 'bg-green-900 bg-opacity-50'
      };
    case PROGRESSION_CATEGORIES.MASTERY:
      return {
        bg: 'bg-purple-900 bg-opacity-20',
        border: 'border-purple-700',
        text: 'text-purple-400',
        hover: 'hover:bg-purple-800 hover:bg-opacity-30',
        iconBg: 'bg-purple-900 bg-opacity-50'
      };
    case PROGRESSION_CATEGORIES.EXTENSION:
      return {
        bg: 'bg-orange-900 bg-opacity-20',
        border: 'border-orange-700',
        text: 'text-orange-400',
        hover: 'hover:bg-orange-800 hover:bg-opacity-30',
        iconBg: 'bg-orange-900 bg-opacity-50'
      };
    default:
      return {
        bg: 'bg-gray-800',
        border: 'border-gray-700',
        text: 'text-gray-400',
        hover: 'hover:bg-gray-700',
        iconBg: 'bg-gray-800'
      };
  }
};

const LearningPathway = ({ resources, childGrade, onSaveResource, stageDurations }) => {
  const [expandedCategory, setExpandedCategory] = useState(PROGRESSION_CATEGORIES.INTRODUCTION);

  // Group resources by progression category
  const groupedResources = groupByProgressionCategory(resources);

  // Use the passed stageDurations or calculate if not provided
  const categoryTimes = stageDurations || Object.keys(groupedResources).reduce((acc, category) => {
    const resources = groupedResources[category];

    // If no resources in this category, set time to 0
    if (resources.length === 0) {
      acc[category] = 0;
      return acc;
    }

    const totalMinutes = resources.reduce((sum, resource) => {
      // Get estimated time for this resource
      const timeStr = resource.estimatedTime || estimateCompletionTime(resource);

      // Parse the time string to get an average time in minutes
      let avgTime = 0;

      if (timeStr) {
        // Handle ranges like "10-15 minutes"
        if (timeStr.includes('-')) {
          const times = timeStr.split('-').map(t => {
            const num = parseInt(t.trim(), 10);
            return isNaN(num) ? 0 : num;
          });

          if (times.length >= 2 && !isNaN(times[0]) && !isNaN(times[1])) {
            avgTime = (times[0] + times[1]) / 2;
          }
        }
        // Handle single values like "10 minutes"
        else {
          const match = timeStr.match(/(\d+)/);
          if (match && match[1]) {
            avgTime = parseInt(match[1], 10);
          }
        }
      }

      // Fallback to category-specific defaults if we couldn't parse a time
      if (avgTime <= 0) {
        switch (category) {
          case PROGRESSION_CATEGORIES.INTRODUCTION:
            avgTime = 12; // Default 12 minutes for introduction
            break;
          case PROGRESSION_CATEGORIES.PRACTICE:
            avgTime = 18; // Default 18 minutes for practice
            break;
          case PROGRESSION_CATEGORIES.MASTERY:
            avgTime = 12; // Default 12 minutes for mastery
            break;
          case PROGRESSION_CATEGORIES.EXTENSION:
            avgTime = 25; // Default 25 minutes for extension
            break;
          default:
            avgTime = 15; // General default
        }
      }

      return sum + avgTime;
    }, 0);

    acc[category] = Math.round(totalMinutes);
    return acc;
  }, {});

  // Handle category click to expand/collapse
  const handleCategoryClick = (category) => {
    setExpandedCategory(category === expandedCategory ? null : category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Learning Pathway</h3>
        <div className="text-sm text-gray-400">
          <span className="font-medium">Total Time:</span> {stageDurations 
            ? (stageDurations.Introduction + stageDurations.Practice + stageDurations.Mastery + stageDurations.Extension)
            : Object.values(categoryTimes).reduce((a, b) => a + b, 0)} minutes
        </div>
      </div>

      {/* Learning progression path visualization */}
      <div className="relative flex justify-between items-center mb-8 px-4">
        {Object.keys(PROGRESSION_CATEGORIES).map((key, index) => {
          const category = PROGRESSION_CATEGORIES[key];
          const Icon = categoryIcons[category];
          const colors = getCategoryColorClasses(category);
          const hasResources = groupedResources[category].length > 0;

          return (
            <div key={category} className="flex flex-col items-center relative z-10">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(category)}
                className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer
                  ${colors.iconBg} ${colors.border} border-2 ${hasResources ? '' : 'opacity-50'}`}
              >
                <Icon size={24} className={colors.text} />
              </motion.div>
              <div className="mt-2 text-center">
                <div className={`font-medium ${colors.text} text-sm`}>{category}</div>
                <div className="text-xs text-gray-400 flex items-center justify-center mt-1">
                  <Clock size={12} className="mr-1" />
                  {categoryTimes[category] || 0} min
                </div>
              </div>

              {/* Indicator for expanded category */}
              {expandedCategory === category && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent ${colors.border} mt-2`}
                />
              )}
            </div>
          );
        })}

        {/* Connecting line */}
        <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-700 -z-10"></div>
      </div>

      {/* Resources for the selected category */}
      {expandedCategory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className={`p-4 rounded-lg border ${getCategoryColorClasses(expandedCategory).border} ${getCategoryColorClasses(expandedCategory).bg} mb-6`}>
            <div className="flex items-center mb-3">
              {categoryIcons[expandedCategory] && (
                <div className="mr-2">
                  {(() => {
                    const Icon = categoryIcons[expandedCategory];
                    return <Icon size={20} className={getCategoryColorClasses(expandedCategory).text} />;
                  })()}
                </div>
              )}
              <h4 className={`font-semibold ${getCategoryColorClasses(expandedCategory).text}`}>
                {expandedCategory} Resources
              </h4>
            </div>
            <p className="text-gray-300 text-sm mb-4">{PROGRESSION_DESCRIPTIONS[expandedCategory]}</p>

            {groupedResources[expandedCategory].length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedResources[expandedCategory].map((resource, index) => (
                  <ResourceCard
                    key={index}
                    resource={resource}
                    childGrade={childGrade}
                    onSave={onSaveResource}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No resources available for this category.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LearningPathway;
