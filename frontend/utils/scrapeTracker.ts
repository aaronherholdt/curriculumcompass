import Cookies from 'js-cookie';

const SCRAPE_COUNT_COOKIE = 'scrape_count';
const MAX_SCRAPE_LIMIT = 2;

interface ScrapeTrackerResult {
  canScrape: boolean;
  scrapeCount: number;
  remainingScrapes: number;
  isLimitReached: boolean;
}

export const checkScrapeLimit = (): ScrapeTrackerResult => {
  // Get current count from cookie or default to 0
  const currentCount = parseInt(Cookies.get(SCRAPE_COUNT_COOKIE) || '0', 10);
  const remainingScrapes = Math.max(0, MAX_SCRAPE_LIMIT - currentCount);
  const isLimitReached = currentCount > MAX_SCRAPE_LIMIT;

  return {
    canScrape: currentCount <= MAX_SCRAPE_LIMIT,
    scrapeCount: currentCount,
    remainingScrapes,
    isLimitReached
  };
};

export const incrementScrapeCount = (): ScrapeTrackerResult => {
  const { scrapeCount } = checkScrapeLimit();
  const newCount = scrapeCount + 1;
  
  // Set cookie to expire in 30 days
  Cookies.set(SCRAPE_COUNT_COOKIE, newCount.toString(), { expires: 30 });
  
  const remainingScrapes = Math.max(0, MAX_SCRAPE_LIMIT - newCount);
  const isLimitReached = newCount > MAX_SCRAPE_LIMIT;

  return {
    canScrape: newCount <= MAX_SCRAPE_LIMIT,
    scrapeCount: newCount,
    remainingScrapes,
    isLimitReached
  };
};

export const resetScrapeCount = (): void => {
  Cookies.remove(SCRAPE_COUNT_COOKIE);
};
