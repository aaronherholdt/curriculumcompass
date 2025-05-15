import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Download, Calendar, Clock, FileText, Printer } from 'lucide-react';
import ResourceCard from '../components/ResourceCard';
import LearningPathway from '../components/LearningPathway';
import WorksheetPreview from '../components/WorksheetPreview';
import { saveResourceForLater, removeSavedResource } from '../utils/resourceHelpers';
import { checkScrapeLimit } from '../../utils/scrapeTracker';
import {
  determineProgressionCategory,
  estimateCompletionTime,
  sortByLearningProgression
} from '../utils/learningProgressionHelpers';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchData, setSearchData] = useState(null);
  const [results, setResults] = useState([]);
  const [lessonPlan, setLessonPlan] = useState(null);
  const [savedResources, setSavedResources] = useState([]);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  const [isScrapeLimitModalOpen, setIsScrapeLimitModalOpen] = useState(false);

  useEffect(() => {
    // Get search data from location state or session storage
    const data = location.state?.searchData || JSON.parse(sessionStorage.getItem('lastSearch'));

    if (data) {
      // Check scrape limit before proceeding
      const { canScrape, isLimitReached } = checkScrapeLimit();
      
      if (isLimitReached) {
        setIsScrapeLimitModalOpen(true);
        setIsLoading(false);
        return;
      }

      setSearchData(data);
      // Fetch real results from API
      fetchSearchResults(data);
    } else {
      // If no search data, redirect to search page
      navigate('/curriculum-search');
    }
  }, [location, navigate]);

  const fetchSearchResults = async (data) => {
    try {
      // For demo purposes, we'll use mock results for now
      // In a real implementation, you would call your API here
      setTimeout(() => {
        generateMockResults(data);
        setIsLoading(false);
      }, 1500);
      
      // Actual API call would look like this:
      /*
      const response = await fetch('/api/curriculum-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile: data.profile,
          keywords: data.keywords
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      const responseData = await response.json();
      
      if (responseData.resources) {
        // Process each resource to ensure it has a progression category
        const processedResources = responseData.resources.map(resource => {
          // Verify that estimatedTime is included in the API response
          console.log(`Resource '${resource.title}' estimatedTime: ${resource.estimatedTime}`);
          
          // Add progression category if not already present
          if (!resource.progressionCategory) {
            resource.progressionCategory = determineProgressionCategory(resource);
          }
          
          return resource;
        });
        
        // Sort resources by learning progression
        const sortedResults = sortByLearningProgression(processedResources);
        setResults(sortedResults);
        
        // Generate lesson plan based on the sorted results
        generateLessonPlan(data, sortedResults);
        setIsLoading(false);
      }
      */
    } catch (error) {
      console.error('Error fetching search results:', error);
      setIsLoading(false);
    }
  };

  const generateMockResults = (data) => {
    const mockResults = [];
    const profile = data.profile;

    // Get interests from profile
    const mainInterests = profile.mainInterests || [];
    const subInterests = profile.subInterests || [];
    const allInterests = profile.interests || [];

    // Map sub-interests by their main interest for easier access
    const subInterestsByMain = {};
    subInterests.forEach(si => {
      const [mainInterest, subInterestName] = si.split(':');
      if (!subInterestsByMain[mainInterest]) {
        subInterestsByMain[mainInterest] = [];
      }
      subInterestsByMain[mainInterest].push(subInterestName);
    });

    // Generate resources based on main interests
    mainInterests.forEach((interest, idx) => {
      // Generate 1-3 resources per main interest
      const numResources = Math.min(3, Math.floor(Math.random() * 3) + 1);

      for (let i = 0; i < numResources; i++) {
        // Generate a resource with a random type
        const resourceType = ['Worksheet', 'Video', 'Interactive', 'Lesson Plan', 'Game'][Math.floor(Math.random() * 5)];
        const resource = {
          id: `result-${mockResults.length + 1}`,
          title: `${profile.grade} ${interest} Resource ${i + 1}`,
          url: '#',
          description: `This comprehensive ${interest.toLowerCase()} resource is designed for ${profile.grade.toLowerCase()} students.`,
          subject: interest,
          type: resourceType,
          source: ['Khan Academy', 'PBS Kids', 'Education.com', 'Teachers Pay Teachers', 'ABCmouse'][Math.floor(Math.random() * 5)]
        };

        // Add learning progression category and estimated time
        resource.progressionCategory = determineProgressionCategory(resource);
        resource.estimatedTime = estimateCompletionTime(resource);

        mockResults.push(resource);
      }

      // Generate more specific resources based on sub-interests for this main interest
      if (subInterestsByMain[interest]) {
        subInterestsByMain[interest].forEach(subInterest => {
          // Generate a resource with a random type
          const resourceType = ['Worksheet', 'Video', 'Interactive', 'Activity', 'Project'][Math.floor(Math.random() * 5)];
          const resource = {
            id: `result-${mockResults.length + 1}`,
            title: `${profile.grade} ${subInterest}`,
            url: '#',
            description: `This focused resource on ${subInterest.toLowerCase()} is tailored for ${profile.grade.toLowerCase()} students.`,
            subject: interest,
            subSubject: subInterest,
            type: resourceType,
            source: ['Khan Academy', 'PBS Kids', 'Education.com', 'Teachers Pay Teachers', 'ABCmouse'][Math.floor(Math.random() * 5)]
          };

          // Add learning progression category and estimated time
          resource.progressionCategory = determineProgressionCategory(resource);
          resource.estimatedTime = estimateCompletionTime(resource);

          mockResults.push(resource);
        });
      }
    });

    // Process each resource to ensure it has a progression category
    const processedResources = mockResults.map(resource => {
      // Verify that estimatedTime is included
      console.log(`Resource '${resource.title}' estimatedTime: ${resource.estimatedTime}`);
      
      // Add progression category if not already present
      if (!resource.progressionCategory) {
        resource.progressionCategory = determineProgressionCategory(resource);
      }
      
      return resource;
    });
    
    // Sort resources by learning progression
    const sortedResults = sortByLearningProgression(processedResources);
    setResults(sortedResults);

    // Generate a lesson plan based on the profile and resources
    generateLessonPlan(data, sortedResults, mainInterests, subInterestsByMain);
  };

  const generateLessonPlan = (data, resources, mainInterests, subInterestsByMain) => {
    const profile = data.profile;
    const activities = [];
    const gradeLevel = profile.grade;

    // Define the Bloom's Taxonomy progression
    const bloomsLevels = ['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'];

    // Time blocks for a structured schedule
    const timeBlocks = [
      '9:00 - 9:30 AM',
      '9:35 - 10:10 AM',
      '10:15 - 10:50 AM',
      '10:55 - 11:25 AM',
      '11:30 - 12:00 PM'
    ];

    // Default activity durations
    const activityDurations = [
      '30 minutes',
      '35 minutes',
      '35 minutes',
      '30 minutes',
      '30 minutes'
    ];

    // Calculate total lesson duration
    let totalMinutes = 0;
    activityDurations.forEach(duration => {
      const minutes = parseInt(duration.split(' ')[0]);
      if (!isNaN(minutes)) {
        totalMinutes += minutes;
      }
    });

    // Prioritize interests that have sub-interests selected
    const prioritizedInterests = mainInterests
      .sort((a, b) => {
        const aHasSubInterests = subInterestsByMain[a]?.length > 0;
        const bHasSubInterests = subInterestsByMain[b]?.length > 0;

        if (aHasSubInterests && !bHasSubInterests) return -1;
        if (!aHasSubInterests && bHasSubInterests) return 1;
        return 0;
      })
      .slice(0, Math.min(5, mainInterests.length));

    // Create activities based on the prioritized interests
    prioritizedInterests.forEach((interest, index) => {
      // Get resources for this interest, ensuring we have a mix of progression categories
      const interestResources = resources.filter(r => r.subject === interest);

      // Try to get one resource from each progression category if possible
      const introResources = interestResources.filter(r => r.progressionCategory === 'Introduction').slice(0, 1);
      const practiceResources = interestResources.filter(r => r.progressionCategory === 'Practice').slice(0, 1);
      const masteryResources = interestResources.filter(r => r.progressionCategory === 'Mastery').slice(0, 1);

      // Combine resources in progression order
      const selectedResources = [...introResources, ...practiceResources, ...masteryResources].slice(0, 2);

      // Check if there are sub-interests for this interest
      const relatedSubInterests = subInterestsByMain[interest] || [];

      // Using Bloom's taxonomy based on position in the sequence
      const bloomsLevel = bloomsLevels[Math.min(index, bloomsLevels.length - 1)];

      let activityName = interest;
      let activityDescription = `Explore ${interest.toLowerCase()} through interactive lessons and activities.`;

      // If there are sub-interests, make the activity more specific
      if (relatedSubInterests.length > 0) {
        const subInterest = relatedSubInterests[0]; // Use the first sub-interest for this activity
        activityName = `${interest}: ${subInterest}`;
        activityDescription = `Focus on ${subInterest.toLowerCase()} through guided ${interest.toLowerCase()} activities.`;

        // Try to find resources specifically for this sub-interest
        const subInterestResources = resources.filter(r => r.subSubject === subInterest);
        if (subInterestResources.length > 0) {
          // Add one sub-interest specific resource, preferably an extension resource
          const extensionResource = subInterestResources.find(r => r.progressionCategory === 'Extension');
          if (extensionResource) {
            selectedResources.push(extensionResource);
          } else {
            selectedResources.push(subInterestResources[0]);
          }
        }
      }

      let objectiveText = '';
      let assessmentText = '';

      // Create learning objectives and assessments based on Bloom's level and interest/sub-interest
      switch (bloomsLevel) {
        case 'Remembering':
          objectiveText = `Student will recall and identify key facts about ${activityName.toLowerCase()}.`;
          assessmentText = `Verbal or written recall of ${activityName.toLowerCase()} key facts and terms.`;
          break;
        case 'Understanding':
          objectiveText = `Student will explain key concepts of ${activityName.toLowerCase()} in their own words.`;
          assessmentText = `Explanation of ${activityName.toLowerCase()} concepts showing comprehension.`;
          break;
        case 'Applying':
          objectiveText = `Student will apply ${activityName.toLowerCase()} concepts to solve problems or complete tasks.`;
          assessmentText = `Application of ${activityName.toLowerCase()} knowledge to new situations or problems.`;
          break;
        case 'Analyzing':
          objectiveText = `Student will analyze ${activityName.toLowerCase()} concepts and identify relationships between components.`;
          assessmentText = `Analysis of ${activityName.toLowerCase()} elements, showing understanding of structure and relationships.`;
          break;
        case 'Evaluating':
          objectiveText = `Student will evaluate approaches to ${activityName.toLowerCase()} and justify their reasoning.`;
          assessmentText = `Evaluation of ${activityName.toLowerCase()} methods or ideas with supported judgments.`;
          break;
        case 'Creating':
          objectiveText = `Student will create an original work demonstrating understanding of ${activityName.toLowerCase()}.`;
          assessmentText = `Creation of original work related to ${activityName.toLowerCase()}.`;
          break;
      }

      activities.push({
        name: activityName,
        description: activityDescription,
        timeBlock: timeBlocks[index],
        duration: activityDurations[index],
        bloomsLevel: bloomsLevel,
        resources: selectedResources,
        objective: {
          text: objectiveText,
          bloomsLevel: bloomsLevel
        },
        assessment: {
          text: assessmentText,
          rubric: `${bloomsLevel} assessment`
        }
      });
    });

    // Create the complete lesson plan
    const plan = {
      dailyPlan: {
        title: `${profile.name}'s Personalized Learning Plan`,
        description: `A customized learning plan for ${gradeLevel} focusing on ${prioritizedInterests.join(', ')}.`,
        activities: activities,
        totalDuration: `${totalMinutes} minutes`
      },
      resources: resources.slice(0, 10)
    };

    setLessonPlan(plan);
  };

  const handleBackToSearch = () => {
    navigate('/curriculum-search');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app this would generate and download a PDF
    alert('This would download the lesson plan as a PDF in a real application');
  };

  const handleOpenWorksheets = () => {
    setIsWorksheetModalOpen(true);
  };

  const handleCloseWorksheets = () => {
    setIsWorksheetModalOpen(false);
  };

  const handleSaveResource = (resource, isSaving) => {
    if (isSaving) {
      saveResourceForLater(resource);
      setSavedResources(prev => [...prev, resource.id]);
    } else {
      removeSavedResource(resource);
      setSavedResources(prev => prev.filter(id => id !== resource.id));
    }
  };

  const handleNewSearch = () => {
    const { isLimitReached, canScrape } = checkScrapeLimit();
    if (isLimitReached || !canScrape) {
      setIsScrapeLimitModalOpen(true);
    } else {
      navigate('/curriculum-search');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="ml-3 text-lg">Generating your lesson plan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 bg-opacity-70 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white">Curriculum Compass</Link>
          <nav className="flex space-x-4">
            <Link to="/dashboard" className="text-white hover:text-gray-200">
              Dashboard
            </Link>
            <Link to="/create-profile" className="text-white hover:text-gray-200">
              Edit Profile
            </Link>
            <Link to="/curriculum-search" className="text-white hover:text-gray-200">
              New Search
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto py-10 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <span className="ml-3 text-lg">Generating your lesson plan...</span>
          </div>
        ) : lessonPlan && searchData?.profile ? (
          <div className="max-w-4xl mx-auto bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl shadow-xl p-8 text-white">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">{searchData.profile.name}'s Lesson Plan</h1>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenWorksheets}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700"
                >
                  <Printer className="inline mr-2" size={18} />
                  Print Activities
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700"
                >
                  <Download className="inline mr-2" size={18} />
                  Download PDF
                </motion.button>
              </div>
            </div>

            <div className="bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg p-4 mb-6">
              <p className="text-lg mb-1"><span className="font-medium">Child:</span> {searchData.profile.name}</p>
              <p className="text-lg mb-1"><span className="font-medium">Grade:</span> {searchData.profile.grade}</p>
              <p className="text-lg mb-1"><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</p>
              <p className="text-lg"><span className="font-medium">Total Duration:</span> {lessonPlan.dailyPlan.totalDuration}</p>

              {searchData.profile.subInterests && searchData.profile.subInterests.length > 0 && (
                <div className="mt-3">
                  <p className="text-lg mb-1"><span className="font-medium">Focus Areas:</span></p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {searchData.profile.subInterests.map((si, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-gray-600 text-green-300 text-xs rounded-full">
                        {si.split(':')[1]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-green-400">{lessonPlan.dailyPlan.title}</h2>
              <p className="text-lg mb-6 text-gray-300">{lessonPlan.dailyPlan.description}</p>

              <h3 className="text-xl font-semibold mb-4 text-green-400">Daily Schedule</h3>
              <div className="space-y-6">
                {lessonPlan.dailyPlan.activities.map((activity, index) => (
                  <div key={index} className="border border-gray-700 bg-gray-800 bg-opacity-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-white">{activity.name}</h4>
                      <span className="bg-gray-700 text-green-300 text-sm px-3 py-1 rounded-full">
                        {activity.timeBlock} ({activity.duration})
                      </span>
                    </div>
                    <div className="mb-2">
                      <span className="inline-block bg-gray-700 text-green-300 text-xs px-2 py-1 rounded mr-2">
                        Bloom's Level: {activity.bloomsLevel}
                      </span>
                    </div>
                    <p className="mb-4 text-gray-300">{activity.description}</p>

                    <div className="mb-3 bg-gray-700 border border-gray-600 rounded p-3">
                      <h5 className="font-medium text-green-400">Learning Objective</h5>
                      <p className="text-gray-300">{activity.objective.text}</p>
                    </div>

                    <div className="mb-4 bg-gray-700 border border-gray-600 rounded p-3">
                      <h5 className="font-medium text-green-400">Assessment Strategy</h5>
                      <p className="text-gray-300">{activity.assessment.text}</p>
                    </div>

                    {activity.resources.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-3 text-green-400">Activity Resources:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activity.resources.map((resource, idx) => (
                            <ResourceCard
                              key={idx}
                              resource={resource}
                              childGrade={searchData.profile.grade}
                              onSave={handleSaveResource}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-400">Learning Pathway</h3>
              <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-6">
                <LearningPathway
                  resources={lessonPlan.resources}
                  childGrade={searchData.profile.grade}
                  onSaveResource={handleSaveResource}
                />
              </div>
            </div>

            <div className="flex justify-center mt-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrint}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mr-4
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                Print Page
              </motion.button>
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mr-4
                  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Back to Dashboard
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewSearch}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg
                hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500
                focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                New Search
              </motion.button>
            </div>

            {/* Worksheet Preview Modal */}
            {lessonPlan && (
              <WorksheetPreview
                resources={lessonPlan.resources}
                childName={searchData.profile.name}
                grade={searchData.profile.grade}
                onClose={handleCloseWorksheets}
                isOpen={isWorksheetModalOpen}
              />
            )}

            {/* Scrape Limit Modal */}
            {isScrapeLimitModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
                  <h3 className="text-2xl font-bold text-white mb-4">Search Limit Reached</h3>
                  <p className="text-gray-300 mb-6">
                    You've reached your free search limit. Sign up for unlimited searches and access to premium features.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/curriculum-search')}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                      Back to Search
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/signup')}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg
                      hover:from-green-600 hover:to-emerald-700"
                    >
                      Sign Up Now
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl shadow-xl p-8 text-center text-white">
            <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
              <p className="font-bold">Error</p>
              <p>An error occurred while loading the lesson plan. Please try again.</p>
            </div>
            <Link to="/curriculum-search">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg"
              >
                Try Again
              </motion.button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;