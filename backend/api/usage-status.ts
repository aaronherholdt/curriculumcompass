import type { NextApiRequest, NextApiResponse } from 'next';

interface UsageStatusResponse {
  success: boolean;
  error?: string;
  currentCount?: number;
  limit?: number;
  limitReached?: boolean;
}

const SCRAPE_COUNT_COOKIE = 'scrape_count'; // Ensure this matches the cookie name in track-usage.ts
const MAX_SCRAPE_LIMIT = 2; // Users get 2 free scrapes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UsageStatusResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const cookies = req.cookies;
    const currentCount = cookies[SCRAPE_COUNT_COOKIE] ? parseInt(cookies[SCRAPE_COUNT_COOKIE] as string, 10) : 0;
    
    return res.status(200).json({
      success: true,
      currentCount,
      limit: MAX_SCRAPE_LIMIT,
      limitReached: currentCount >= MAX_SCRAPE_LIMIT // True if 2 or more scrapes already done
    });
  } catch (error) {
    console.error('Error fetching usage status:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 