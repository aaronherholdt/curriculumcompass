import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Search } from 'lucide-react';
import { checkScrapeLimit, incrementScrapeCount } from '../../utils/scrapeTracker';

const CurriculumSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [enhancedSearch, setEnhancedSearch] = useState('');
  const [freeSearches, setFreeSearches] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [searchProgress, setSearchProgress] = useState(0);

  useEffect(() => {
    // Get profile data from location state or session storage
    const profile = location.state?.profile || JSON.parse(sessionStorage.getItem('currentProfile'));
    
    if (profile) {
      setProfileData(profile);
      
      // Generate search keywords based on profile data
      generateSearchKeywords(profile);
    } else {
      // If no profile data, redirect to create profile
      navigate('/create-profile');
    }

    // Initialize free searches from cookie
    const { remainingScrapes } = checkScrapeLimit();
    setFreeSearches(remainingScrapes);
  }, [location, navigate]);

  // Generate search keywords based on child profile
  const generateSearchKeywords = (profile) => {
    const keywords = [];
    const grade = profile.grade.toLowerCase();
    
    // Get all interests (main interests, sub-interests, and custom interests)
    const mainInterests = profile.mainInterests || [];
    const subInterests = profile.subInterests || [];
    const allInterests = profile.interests || [];
    
    // Add grade + interest combinations for main interests
    mainInterests.forEach(interest => {
      keywords.push(`${grade} ${interest.toLowerCase()}`);
      keywords.push(`${interest.toLowerCase()} for ${grade}`);
      keywords.push(`${grade} ${interest.toLowerCase()} curriculum`);
      keywords.push(`${grade} ${interest.toLowerCase()} lessons`);
    });
    
    // Add more specific keywords for sub-interests
    subInterests.forEach(fullSubInterest => {
      const [mainInterest, subInterest] = fullSubInterest.split(':');
      keywords.push(`${grade} ${subInterest.toLowerCase()}`);
      keywords.push(`${subInterest.toLowerCase()} for ${grade}`);
      keywords.push(`${grade} ${mainInterest.toLowerCase()} ${subInterest.toLowerCase()}`);
      keywords.push(`${subInterest.toLowerCase()} activities for ${grade}`);
    });
    
    // Add specific keywords for selected interests
    if (allInterests.includes('Math') || allInterests.includes('Basic Counting')) {
      keywords.push(`${grade} math`);
      keywords.push(`math for ${grade}`);
      keywords.push(`${grade} math curriculum`);
      keywords.push(`${grade} math lessons`);
      keywords.push(`${grade} math worksheets`);
    }
    
    if (allInterests.includes('Basic Counting')) {
      keywords.push(`${grade} basic counting`);
      keywords.push(`basic counting for ${grade}`);
      keywords.push(`basic counting lessons for ${grade}`);
    }
    
    // Add custom interest keywords
    if (profile.customInterests) {
      const customTerms = profile.customInterests.split(',').map(term => term.trim());
      customTerms.forEach(term => {
        if (term) {
          keywords.push(`${grade} ${term.toLowerCase()}`);
          keywords.push(`${term.toLowerCase()} for ${grade}`);
          keywords.push(`${term.toLowerCase()} activities for ${grade}`);
        }
      });
    }
    
    // Limit to reasonable number of keywords and set unique ones
    setSearchKeywords([...new Set(keywords)].slice(0, 20));
  };

  const handleStartSearch = () => {
    const { canScrape, isLimitReached } = checkScrapeLimit();
    
    if (isLimitReached || !canScrape) {
      toast.error('You have used all your free searches. Please sign up for unlimited searches.');
      return;
    }
    
    setIsSearching(true);
    setSearchProgress(0);
    
    // Increment the scrape count
    const { remainingScrapes } = incrementScrapeCount();
    setFreeSearches(remainingScrapes);
    
    // Simulate search progress
    const progressInterval = setInterval(() => {
      setSearchProgress(prevProgress => {
        const newProgress = prevProgress + Math.random() * 15;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 500);
    
    // In a real implementation, this would trigger an API call to search
    // For demo, we'll simulate a delay and then navigate to results
    setTimeout(() => {
      clearInterval(progressInterval);
      setSearchProgress(100);
      
      // Store the search query and profile in session storage
      const searchData = {
        profile: profileData,
        keywords: searchKeywords,
        enhancedSearch: enhancedSearch,
        timestamp: new Date().toISOString()
      };
      
      sessionStorage.setItem('lastSearch', JSON.stringify(searchData));
      
      // Navigate to search results page
      setTimeout(() => {
        setIsSearching(false);
        navigate('/search-results', { state: { searchData } });
      }, 500);
    }, 5000);
  };

  // Skip to max 12 keywords for "more" link
  const displayedKeywords = searchKeywords.slice(0, 12);
  const hasMoreKeywords = searchKeywords.length > 12;

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-4"></div>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full px-4">
        <div className="w-full max-w-2xl bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-4 text-center">Search Curriculum</h2>
          
          <div className="mb-4 text-center text-gray-300">
            <p>{freeSearches} free search{freeSearches === 1 ? '' : 'es'} remaining. <Link to="/signup" className="text-green-400 hover:underline">Sign up</Link> for unlimited searches.</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Profile Summary</h3>
            <div className="bg-gray-700 bg-opacity-50 p-6 rounded-lg">
              <div className="mb-2 text-white">
                <span className="font-semibold">Name:</span> {profileData.name}
              </div>
              <div className="mb-2 text-white">
                <span className="font-semibold">Grade:</span> {profileData.grade}
              </div>
              <div className="text-white">
                <span className="font-semibold">Interests:</span> {Array.isArray(profileData.interests) ? profileData.interests.join(', ') : profileData.interests}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Search Keywords:</h3>
            <div className="flex flex-wrap gap-2">
              {displayedKeywords.map((keyword, index) => (
                <span key={index} className="px-3 py-1 bg-gray-700 text-green-400 rounded-full text-sm">
                  {keyword}
                </span>
              ))}
              {hasMoreKeywords && (
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                  +{searchKeywords.length - 12} more
                </span>
              )}
            </div>
          </div>
          
          <div className="mb-3 relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
              <div 
                style={{ width: `${searchProgress}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-300"
              ></div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Searching for relevant curriculum...</h3>
            <p className="text-gray-300">This may take a minute or two. Please don't close this window.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="w-full max-w-2xl bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-white mb-4 text-center">Search Curriculum</h2>
        
        <div className="mb-4 text-center text-gray-300">
          <p>{freeSearches} free search{freeSearches === 1 ? '' : 'es'} remaining. <Link to="/signup" className="text-green-400 hover:underline">Sign up</Link> for unlimited searches.</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Profile Summary</h3>
          <div className="bg-gray-700 bg-opacity-50 p-6 rounded-lg">
            <div className="mb-2 text-white">
              <span className="font-semibold">Name:</span> {profileData.name}
            </div>
            <div className="mb-2 text-white">
              <span className="font-semibold">Grade:</span> {profileData.grade}
            </div>
            <div className="mb-2 text-white">
              <span className="font-semibold">Interests:</span> {Array.isArray(profileData.interests) ? profileData.interests.join(', ') : profileData.interests}
            </div>
            {profileData.subInterests && profileData.subInterests.length > 0 && (
              <div className="mt-2 text-white">
                <span className="font-semibold">Specific Topics:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profileData.subInterests.map((si, idx) => (
                    <span key={idx} className="inline-block px-2 py-1 bg-gray-800 text-green-400 text-xs rounded-full">
                      {si.split(':')[1]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Search Keywords:</h3>
          <div className="flex flex-wrap gap-2">
            {displayedKeywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-gray-700 text-green-400 rounded-full text-sm">
                {keyword}
              </span>
            ))}
            {hasMoreKeywords && (
              <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                +{searchKeywords.length - 12} more
              </span>
            )}
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Enhance Search (Optional)</h3>
          <textarea
            value={enhancedSearch}
            onChange={(e) => setEnhancedSearch(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
            placeholder="Add specific topics, keywords, or learning objectives to customize the search results. Example: 'Focus on hands-on activities about photosynthesis' or 'Include materials for visual learners'"
            rows={4}
          />
          <p className="text-sm text-gray-400 mt-2">
            Adding custom text helps tailor lesson materials to your specific needs.
          </p>
        </div>
        
        <motion.button
          onClick={handleStartSearch}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSearching}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-lg shadow-md 
          hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Search className="mr-2" size={20} />
          Start Curriculum Search
        </motion.button>
      </div>
    </div>
  );
};

export default CurriculumSearchPage; 