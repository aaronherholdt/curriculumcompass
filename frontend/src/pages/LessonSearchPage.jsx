import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Search, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const LessonSearchPage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [childProfile, setChildProfile] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  
  // Custom search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // Fetch the child profile data when the component mounts
  useEffect(() => {
    const fetchChildProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/child-profiles/${profileId}`, {
          withCredentials: true
        });
        
        if (response.data.success) {
          setChildProfile(response.data.childProfile);
          
          // Initialize search query based on child's interests and grade
          const initialQuery = `${response.data.childProfile.grade} lessons`;
          setSearchQuery(initialQuery);
          
          // If the child has interests, select the first one as the initial subject
          if (response.data.childProfile.interests && response.data.childProfile.interests.length > 0) {
            setSelectedSubject(response.data.childProfile.interests[0]);
          }
        } else {
          setError('Failed to load child profile');
        }
      } catch (err) {
        console.error('Error fetching child profile:', err);
        setError('Failed to load child profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (profileId) {
      fetchChildProfile();
    }
  }, [profileId]);
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    
    try {
      setIsSearching(true);
      setError(null);
      
      // Combine the search query with subject if selected
      const fullQuery = selectedSubject 
        ? `${searchQuery} ${selectedSubject}`
        : searchQuery;
      
      // In a real application, this would call an API endpoint to search for lessons
      // For demonstration purposes, we'll simulate a response
      
      // TODO: Replace with actual API call in production
      // const response = await axios.get(`${API_BASE_URL}/lesson-plans/search`, {
      //   params: { query: fullQuery, profileId },
      //   withCredentials: true
      // });
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const mockResults = [
        {
          id: '1',
          title: `${selectedSubject || 'General'} Lesson Plan for ${childProfile?.grade}`,
          description: `A personalized ${selectedSubject || 'general'} lesson plan for ${childProfile?.grade} students.`,
          subject: selectedSubject || 'Multiple Subjects',
          grade: childProfile?.grade,
          duration: '1 week',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: `Interactive ${selectedSubject || 'Learning'} Activities`,
          description: `Fun and engaging ${selectedSubject || ''} activities designed for ${childProfile?.grade} level.`,
          subject: selectedSubject || 'Activities',
          grade: childProfile?.grade,
          duration: '2 days',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          title: `${childProfile?.grade} Curriculum Guide`,
          description: `A comprehensive curriculum guide covering ${selectedSubject || 'all subjects'} for ${childProfile?.grade} students.`,
          subject: selectedSubject || 'Curriculum',
          grade: childProfile?.grade,
          duration: '1 semester',
          createdAt: new Date().toISOString()
        }
      ];
      
      setSearchResults(mockResults);
    } catch (err) {
      console.error('Error searching for lessons:', err);
      setError('Failed to search for lessons. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle selecting a lesson plan
  const handleSelectLessonPlan = (lessonId) => {
    // In a real application, this would navigate to the lesson plan details page
    // For now, simulate this with a toast notification
    toast.success('Lesson plan selected! This would normally open the lesson details.');
    // navigate(`/lesson-plan/${lessonId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-center text-white">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p>Loading profile information...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full p-4">
        <div className="w-full max-w-lg bg-gray-800 bg-opacity-70 p-8 rounded-xl shadow-xl text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
            font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4">
      <div className="w-full max-w-4xl bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Find Learning Resources</h2>
        
        {childProfile && (
          <div className="mb-6 p-4 bg-gray-700 bg-opacity-50 rounded-lg">
            <p className="text-gray-300">
              Searching for <span className="text-green-400 font-medium">{childProfile.name}'s</span> curriculum - 
              Grade: <span className="text-green-400 font-medium">{childProfile.grade}</span>
              {childProfile.interests && childProfile.interests.length > 0 && (
                <> • Interests: <span className="text-green-400 font-medium">
                  {childProfile.interests.join(', ')}
                </span></>
              )}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-gray-300 mb-2">Search Query</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter search terms..."
              />
            </div>
            
            <div className="md:w-1/3">
              <label className="block text-gray-300 mb-2">Subject (Optional)</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Subjects</option>
                {childProfile?.interests?.map((interest) => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
            </div>
          </div>
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSearching}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
            font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search size={18} className="mr-2" />
                Search Curriculum
              </>
            )}
          </motion.button>
        </form>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-4">
              Search Results
            </h3>
            
            <div className="space-y-4">
              {searchResults.map((lesson) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-700 bg-opacity-50 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => handleSelectLessonPlan(lesson.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-1">{lesson.title}</h4>
                      <p className="text-gray-300 text-sm mb-2">{lesson.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded-md">
                          {lesson.subject}
                        </span>
                        <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-md">
                          {lesson.grade}
                        </span>
                        <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded-md">
                          {lesson.duration}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Empty Search Results */}
        {searchResults.length === 0 && !isSearching && !isLoading && (
          <div className="text-center p-8 border border-gray-700 rounded-lg">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-semibold text-white mb-2">No Results Yet</h3>
            <p className="text-gray-400">
              Use the search form above to find curriculum resources for your child.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonSearchPage; 