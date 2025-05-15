import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

interface ApiResponse {
  success: boolean;
  error?: string;
  limitReached?: boolean;
  currentCount?: number;
}

const SCRAPE_COUNT_COOKIE = 'scrape_count';
const MAX_SCRAPE_LIMIT = 2;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get current count from cookie or default to 0
    const cookies = req.cookies;
    const currentCount = cookies[SCRAPE_COUNT_COOKIE] ? parseInt(cookies[SCRAPE_COUNT_COOKIE], 10) : 0;
    
    // Check if limit reached
    if (currentCount >= MAX_SCRAPE_LIMIT) {
      return res.status(200).json({
        success: true,
        limitReached: true,
        currentCount
      });
    }
    
    // Increment the count
    const newCount = currentCount + 1;
    const limitReached = newCount >= MAX_SCRAPE_LIMIT;
    
    // Set the cookie
    const cookie = serialize(SCRAPE_COUNT_COOKIE, newCount.toString(), {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    res.setHeader('Set-Cookie', cookie);
    
    return res.status(200).json({
      success: true,
      limitReached,
      currentCount: newCount
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 