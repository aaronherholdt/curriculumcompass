import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  FileText,
  Video,
  Gamepad2,
  FileSpreadsheet,
  Lightbulb,
  Clock,
  BookOpen,
  Repeat,
  CheckCircle,
  Rocket
} from 'lucide-react';
import { PROGRESSION_CATEGORIES } from '../utils/learningProgressionHelpers';

// Function to determine the appropriate icon based on resource type
const getResourceTypeIcon = (type) => {
  const typeStr = type ? type.toLowerCase() : '';

  if (typeStr.includes('video')) return Video;
  if (typeStr.includes('worksheet') || typeStr.includes('pdf')) return FileSpreadsheet;
  if (typeStr.includes('game') || typeStr.includes('interactive')) return Gamepad2;
  if (typeStr.includes('lesson') || typeStr.includes('plan')) return FileText;
  if (typeStr.includes('activity') || typeStr.includes('project')) return Lightbulb;

  // Default icon
  return FileText;
};

// Function to generate a thumbnail URL or fallback image based on resource type and URL
const getThumbnailUrl = (resource) => {
  const { url, type } = resource;

  // YouTube video thumbnail extraction
  if (url && url.includes('youtube.com')) {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (videoId && videoId[1]) {
      return `https://img.youtube.com/vi/${videoId[1]}/mqdefault.jpg`;
    }
  }

  // Type-based fallback images
  const typeStr = type ? type.toLowerCase() : '';

  if (typeStr.includes('video')) {
    return '/images/video-thumbnail.jpg';
  } else if (typeStr.includes('worksheet') || typeStr.includes('pdf')) {
    return '/images/worksheet-thumbnail.jpg';
  } else if (typeStr.includes('game') || typeStr.includes('interactive')) {
    return '/images/interactive-thumbnail.jpg';
  } else if (typeStr.includes('lesson') || typeStr.includes('plan')) {
    return '/images/lesson-thumbnail.jpg';
  } else if (typeStr.includes('activity') || typeStr.includes('project')) {
    return '/images/activity-thumbnail.jpg';
  }

  // Default fallback image
  return '/images/resource-thumbnail.jpg';
};

// Function to determine age/grade appropriateness label
const getAgeLabel = (resource, childGrade) => {
  if (!childGrade) return null;

  // If the resource has a specific grade mentioned, use that
  if (resource.grade) {
    return resource.grade;
  }

  // Otherwise, use the child's grade as the default
  return childGrade;
};

// Function to get the appropriate icon for a progression category
const getProgressionCategoryIcon = (category) => {
  switch (category) {
    case PROGRESSION_CATEGORIES.INTRODUCTION:
      return BookOpen;
    case PROGRESSION_CATEGORIES.PRACTICE:
      return Repeat;
    case PROGRESSION_CATEGORIES.MASTERY:
      return CheckCircle;
    case PROGRESSION_CATEGORIES.EXTENSION:
      return Rocket;
    default:
      return BookOpen;
  }
};

// Function to get the appropriate color for a progression category
const getProgressionCategoryColor = (category) => {
  switch (category) {
    case PROGRESSION_CATEGORIES.INTRODUCTION:
      return 'text-blue-400 bg-blue-900 bg-opacity-30';
    case PROGRESSION_CATEGORIES.PRACTICE:
      return 'text-green-400 bg-green-900 bg-opacity-30';
    case PROGRESSION_CATEGORIES.MASTERY:
      return 'text-purple-400 bg-purple-900 bg-opacity-30';
    case PROGRESSION_CATEGORIES.EXTENSION:
      return 'text-orange-400 bg-orange-900 bg-opacity-30';
    default:
      return 'text-gray-400 bg-gray-800';
  }
};

const ResourceCard = ({ resource, childGrade, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);

  // Get the appropriate icon component based on resource type
  const TypeIcon = getResourceTypeIcon(resource.type);

  // Get progression category and icon
  const progressionCategory = resource.progressionCategory || PROGRESSION_CATEGORIES.INTRODUCTION;
  const ProgressionIcon = getProgressionCategoryIcon(progressionCategory);
  const progressionColorClass = getProgressionCategoryColor(progressionCategory);

  // Handle save for later
  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (onSave) {
      onSave(resource, !isSaved);
    }
  };

  // Handle open resource
  const handleOpenResource = () => {
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-gray-800 bg-opacity-70 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-300"
    >
      {/* Thumbnail Section */}
      <div className="relative h-36 overflow-hidden bg-gray-700">
        <img
          src={getThumbnailUrl(resource)}
          alt={resource.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/resource-thumbnail.jpg';
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>

        {/* Resource Type Badge */}
        <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-80 rounded-full px-2 py-1 flex items-center">
          <TypeIcon size={14} className="text-green-400 mr-1" />
          <span className="text-xs font-medium text-white">{resource.type || 'Resource'}</span>
        </div>

        {/* Age/Grade Appropriateness */}
        {getAgeLabel(resource, childGrade) && (
          <div className="absolute top-2 right-2 bg-blue-900 bg-opacity-80 rounded-full px-2 py-1">
            <span className="text-xs font-medium text-blue-300">
              {getAgeLabel(resource, childGrade)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">{resource.title}</h3>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{resource.description}</p>

        {/* Learning Progression Category */}
        <div className={`flex items-center mb-2 px-2 py-1 rounded-md ${progressionColorClass}`}>
          <ProgressionIcon size={14} className="mr-1" />
          <span className="text-xs font-medium">{progressionCategory}</span>
          {resource.estimatedTime && (
            <div className="ml-auto flex items-center">
              <Clock size={12} className="mr-1" />
              <span className="text-xs">{resource.estimatedTime}</span>
            </div>
          )}
        </div>

        {/* Subject Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="inline-block text-xs bg-gray-700 text-white rounded-full px-2 py-1">
            {resource.subject}
          </span>
          {resource.subSubject && (
            <span className="inline-block text-xs bg-gray-700 text-white rounded-full px-2 py-1">
              {resource.subSubject}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenResource}
            className="py-1.5 px-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white
            text-sm font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900
            inline-flex items-center"
          >
            <ExternalLink size={14} className="mr-1" />
            Open Resource
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={`p-1.5 rounded-full ${isSaved ? 'bg-green-500 bg-opacity-20' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {isSaved ? (
              <BookmarkCheck size={18} className="text-green-400" />
            ) : (
              <Bookmark size={18} className="text-gray-400" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard;
