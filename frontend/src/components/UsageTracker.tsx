import React, { useEffect, useState } from 'react';

interface UsageData {
  usageCount: number;
  remainingUsage: number;
  limitReached: boolean;
}

const UsageTracker: React.FC = () => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch usage data when component mounts
    const fetchUsageData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/usage');
        const data = await response.json();
        
        if (data.success) {
          setUsageData({
            usageCount: data.usageCount,
            remainingUsage: data.remainingUsage,
            limitReached: data.limitReached
          });
        }
      } catch (error) {
        console.error('Error fetching usage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading usage data...</div>;
  }

  if (!usageData) {
    return null;
  }

  // If user has reached limit
  if (usageData.limitReached) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You've used all your free searches. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user has remaining free searches
  return (
    <div className="text-sm text-gray-500 mb-4">
      <p>{usageData.remainingUsage} free searches remaining.</p>
    </div>
  );
};

export default UsageTracker; 