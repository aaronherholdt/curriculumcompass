import type { NextApiRequest, NextApiResponse } from 'next';

// Define response type
interface ApiResponse {
  success: boolean;
  usageCount?: number;
  remainingUsage?: number;
  limitReached?: boolean;
  error?: string;
}

const SCRAPE_COUNT_COOKIE = 'scrape_count';
const MAX_SCRAPE_LIMIT = 2;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get current count from cookie or default to 0
    const cookies = req.cookies;
    const currentCount = cookies[SCRAPE_COUNT_COOKIE] ? parseInt(cookies[SCRAPE_COUNT_COOKIE], 10) : 0;
    
    const remainingUsage = Math.max(0, MAX_SCRAPE_LIMIT - currentCount);
    const limitReached = currentCount >= MAX_SCRAPE_LIMIT;

    return res.status(200).json({
      success: true,
      usageCount: currentCount,
      remainingUsage,
      limitReached
    });
  } catch (error) {
    console.error('Error checking usage:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 