#!/usr/bin/env python3
"""
HomeScraperEdu Web Scraper
--------------------------
This script handles web scraping for educational content based on profile keywords.
It uses Scrapy for static websites and Playwright for dynamic content, processes and filters results,
and stores them in a structured JSON format.
"""

import sys
import os
import json
import time
from datetime import datetime
import scrapy
from scrapy.crawler import CrawlerProcess
from playwright.async_api import async_playwright
import asyncio
import re

# Ensure data directories exist
os.makedirs('data/searches', exist_ok=True)

def update_status(search_id, status, message, progress):
    """Update the search status in the status file."""
    status_file = os.path.join('data', 'searches', f'{search_id}.json')
    
    if os.path.exists(status_file):
        with open(status_file, 'r') as f:
            search_status = json.load(f)
        
        search_status['status'] = status
        search_status['message'] = message
        search_status['progress'] = progress
        
        with open(status_file, 'w') as f:
            json.dump(search_status, f, indent=2)
        
        return True
    return False

# Scrapy Spider for static educational websites
class EduSpider(scrapy.Spider):
    name = 'edu_spider'
    
    def __init__(self, keywords=None, *args, **kwargs):
        super(EduSpider, self).__init__(*args, **kwargs)
        self.keywords = keywords or []
        
        # Dynamically generate allowed domains based on interests
        self.allowed_domains = []
        self.start_urls = []
        
        # General educational domains that might have content for most subjects
        general_domains = [
            'education.com',
            'pbskids.org',
            'scholastic.com',
            'brainpop.com',
            'edutopia.org',
            'teacherspayteachers.com',
            'commoncore.org',
            'readwritethink.org',
            'outschool.com'
        ]
        
        self.allowed_domains.extend(general_domains)
        
        # Add domain-specific educational sites based on keywords
        for keyword in self.keywords:
            keyword_lower = keyword.lower()
            
            # Art-related sites
            if 'art' in keyword_lower or 'draw' in keyword_lower or 'paint' in keyword_lower or 'craft' in keyword_lower:
                art_domains = [
                    'artforkidshub.com', 
                    'deepspacesparkle.com',
                    'kinderart.com', 
                    'artfulparent.com', 
                    'artsonia.com',
                    'theartofed.com',
                    'incredibleart.org',
                    'theartofeducation.edu',
                    'cassieStephens.com'
                ]
                self.allowed_domains.extend(art_domains)
                
                # Create search URLs for art sites
                self.start_urls.extend([
                    f'https://www.artforkidshub.com/?s={keyword}',
                    f'https://www.deepspacesparkle.com/?s={keyword}',
                    f'https://kinderart.com/search-results/?q={keyword}',
                    f'https://artfulparent.com/?s={keyword}'
                ])
            
            # Music-related sites
            if 'music' in keyword_lower or 'sing' in keyword_lower or 'instrument' in keyword_lower:
                music_domains = [
                    'musicplayhomeschool.com',
                    'mmb.org',
                    'musiceducationworks.org',
                    'nafme.org',
                    'makingmusicfun.net',
                    'teachingchildrenmusic.com',
                    'musicteachersgames.com',
                    'classicsforkids.com',
                    'musictechteacher.com'
                ]
                self.allowed_domains.extend(music_domains)
                
                # Create search URLs for music sites
                self.start_urls.extend([
                    f'https://makingmusicfun.net/htm/mmf_music_library/index.php?q={keyword}',
                    f'https://www.classicsforkids.com/search?query={keyword}',
                    f'https://teachingchildrenmusic.com/?s={keyword}'
                ])
            
            # Reading-related sites
            if 'read' in keyword_lower or 'book' in keyword_lower or 'literacy' in keyword_lower:
                reading_domains = [
                    'readinga-z.com',
                    'readworks.org',
                    'readingrockets.org',
                    'starfall.com',
                    'storylineonline.net',
                    'readwritethink.org',
                    'commonlit.org',
                    'raz-kids.com',
                    'literacycenter.net',
                    'k5learning.com',
                    'newsela.com',
                    'scholastic.com',
                    'readtheory.org',
                    'kidlit.tv',
                    'gutenberg.org'
                ]
                self.allowed_domains.extend(reading_domains)
                
                # Create search URLs for reading sites
                self.start_urls.extend([
                    f'https://www.readingrockets.org/search/site/{keyword}',
                    f'https://www.readwritethink.org/search?term={keyword}',
                    f'https://www.commonlit.org/en/texts?searchQuery={keyword}',
                    f'https://www.k5learning.com/search/node/{keyword}'
                ])
            
            # Writing-related sites
            if 'writ' in keyword_lower or 'journal' in keyword_lower or 'essay' in keyword_lower:
                writing_domains = [
                    'writeshop.com',
                    'nightzookeeper.com',
                    'bravewriter.com',
                    'readwritethink.org',
                    'nanowrimo.org',
                    'journalbuddies.com'
                ]
                self.allowed_domains.extend(writing_domains)
                
                # Create search URLs for writing sites
                self.start_urls.extend([
                    f'https://writeshop.com/?s={keyword}',
                    f'https://www.bravewriter.com/search?q={keyword}',
                    f'https://www.journalbuddies.com/?s={keyword}'
                ])
            
            # Math-related sites
            if 'math' in keyword_lower or 'number' in keyword_lower or 'geometry' in keyword_lower or 'algebra' in keyword_lower:
                math_domains = [
                    'khanacademy.org',
                    'mathplayground.com',
                    'prodigygame.com',
                    'ixl.com',
                    'coolmath.com',
                    'mathgames.com',
                    'illustrativemathematics.org'
                ]
                self.allowed_domains.extend(math_domains)
                
                # Create search URLs for math sites
                self.start_urls.extend([
                    f'https://www.khanacademy.org/search?page_search_query={keyword}',
                    f'https://www.mathplayground.com/search.html?q={keyword}',
                    f'https://www.coolmath.com/search?q={keyword}'
                ])
            
            # Science-related sites
            if 'science' in keyword_lower or 'biology' in keyword_lower or 'chemistry' in keyword_lower or 'physics' in keyword_lower:
                science_domains = [
                    'mysteryscience.com',
                    'sciencekids.co.nz',
                    'kids.nationalgeographic.com',
                    'generationgenius.com',
                    'sciencebuddies.org',
                    'exploratorium.edu'
                ]
                self.allowed_domains.extend(science_domains)
                
                # Create search URLs for science sites
                self.start_urls.extend([
                    f'https://www.sciencekids.co.nz/search.html?q={keyword}',
                    f'https://www.sciencebuddies.org/search?v=oli&s={keyword}',
                    f'https://www.exploratorium.edu/search?keyword={keyword}'
                ])
            
            # History-related sites
            if 'history' in keyword_lower or 'geography' in keyword_lower or 'civiliz' in keyword_lower:
                history_domains = [
                    'bighistoryproject.com',
                    'historyforkids.net',
                    'thecrashcourse.com',
                    'ducksters.com',
                    'worldhistory.org',
                    'historyextra.com'
                ]
                self.allowed_domains.extend(history_domains)
                
                # Create search URLs for history sites
                self.start_urls.extend([
                    f'https://www.historyforkids.net/search.html?searchword={keyword}',
                    f'https://www.ducksters.com/search.php?q={keyword}',
                    f'https://www.worldhistory.org/search/?q={keyword}'
                ])
            
            # Coding-related sites
            if 'cod' in keyword_lower or 'program' in keyword_lower or 'computer science' in keyword_lower:
                coding_domains = [
                    'code.org',
                    'scratch.mit.edu',
                    'tynker.com',
                    'codecademy.com',
                    'codingkids.com.au',
                    'codeforlife.education',
                    'codemonkey.com'
                ]
                self.allowed_domains.extend(coding_domains)
                
                # Create search URLs for coding sites
                self.start_urls.extend([
                    f'https://code.org/search?q={keyword}',
                    f'https://scratch.mit.edu/search/projects?q={keyword}',
                    f'https://www.tynker.com/search/?q={keyword}'
                ])
        
        # Remove duplicates
        self.allowed_domains = list(set(self.allowed_domains))
        self.start_urls = list(set(self.start_urls))
        
        # Add general educational search URLs as fallback if no specific URLs were generated
        if not self.start_urls:
            self.start_urls = [
                'https://www.education.com/resources/',
                'https://www.pbskids.org',
                'https://www.scholastic.com/teachers/teaching-tools/'
            ]

    def parse(self, response):
        # Extract all links from the page
        for link in response.css('a'):
            title = link.css('::text').get()
            url = link.css('::attr(href)').get()
            
            # Skip links without title or URL
            if not title or not url:
                continue
                
            # Parse URL to ensure it's absolute
            if not url.startswith('http'):
                url = response.urljoin(url)
            
            # Filter based on keywords
            if any(keyword.lower() in title.lower() for keyword in self.keywords):
                # Determine subject based on URL or title
                subject = self.determine_subject(url, title)
                
                yield {
                    'title': title.strip(),
                    'url': url,
                    'description': f"Educational resource: {title}",
                    'subject': subject,
                    'type': self.determine_resource_type(url, title)
                }
        
        # Follow next page links if available
        next_page = response.css('a.next::attr(href), a.nextpostslink::attr(href), a[rel="next"]::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)
    
    def determine_subject(self, url, title):
        """Determine the subject of a resource based on URL and title"""
        url_lower = url.lower()
        title_lower = title.lower()
        
        # Check for subject indicators in URL and title
        if any(term in url_lower or term in title_lower for term in ['art', 'draw', 'paint', 'craft']):
            return 'art'
        elif any(term in url_lower or term in title_lower for term in ['music', 'sing', 'instrument', 'song']):
            return 'music'
        elif any(term in url_lower or term in title_lower for term in ['read', 'book', 'literacy', 'phonics']):
            return 'reading'
        elif any(term in url_lower or term in title_lower for term in ['writ', 'essay', 'journal', 'grammar']):
            return 'writing'
        elif any(term in url_lower or term in title_lower for term in ['math', 'number', 'geometry', 'algebra']):
            return 'math'
        elif any(term in url_lower or term in title_lower for term in ['science', 'biology', 'chemistry', 'physics']):
            return 'science'
        elif any(term in url_lower or term in title_lower for term in ['history', 'geography', 'civil']):
            return 'history'
        elif any(term in url_lower or term in title_lower for term in ['cod', 'program', 'computer']):
            return 'coding'
        
        # Default fallback to educational
        return 'educational'
    
    def determine_resource_type(self, url, title):
        """Determine the type of resource based on URL and title"""
        url_lower = url.lower()
        title_lower = title.lower()
        
        if 'video' in url_lower or 'video' in title_lower or 'youtube' in url_lower:
            return 'video'
        elif 'worksheet' in url_lower or 'worksheet' in title_lower or 'pdf' in url_lower:
            return 'worksheet'
        elif 'lesson' in url_lower or 'lesson' in title_lower or 'tutorial' in title_lower:
            return 'lesson'
        elif 'game' in url_lower or 'game' in title_lower or 'interactive' in url_lower:
            return 'interactive'
        elif 'activity' in url_lower or 'activity' in title_lower or 'project' in title_lower:
            return 'activity'
        
        # Default fallback
        return 'resource'

# Playwright scraper for dynamic content (YouTube)
async def scrape_youtube(keywords):
    """Scrape YouTube for educational content based on keywords."""
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        # Process each keyword to create more specific educational searches
        for keyword in keywords:
            keyword_lower = keyword.lower()
            
            # Create educational search term based on keyword
            search_terms = [
                f"{keyword} tutorial",
                f"{keyword} for kids",
                f"{keyword} lesson",
                f"{keyword} homeschool",
                f"{keyword} educational"
            ]
            
            # Choose which search term to use based on keyword content
            if 'art' in keyword_lower or 'draw' in keyword_lower or 'craft' in keyword_lower:
                search_query = f"{keyword} art tutorial for kids"
            elif 'music' in keyword_lower or 'instrument' in keyword_lower:
                search_query = f"{keyword} music lesson"
            elif 'read' in keyword_lower or 'book' in keyword_lower:
                search_query = f"{keyword} reading activity"
            elif 'write' in keyword_lower or 'journal' in keyword_lower:
                search_query = f"{keyword} writing exercise"
            elif 'math' in keyword_lower or 'number' in keyword_lower:
                search_query = f"{keyword} math tutorial"
            elif 'science' in keyword_lower or 'experiment' in keyword_lower:
                search_query = f"{keyword} science experiment for kids"
            elif 'history' in keyword_lower or 'geography' in keyword_lower:
                search_query = f"{keyword} history lesson"
            elif 'cod' in keyword_lower or 'program' in keyword_lower:
                search_query = f"{keyword} coding tutorial for beginners"
            else:
                # Use a general educational search term if no specific category matches
                search_query = search_terms[0]
                
            # Make sure we only search for appropriate content for children
            if 'kid' not in search_query and 'children' not in search_query:
                search_query += " for students"
                
            # Search YouTube
            encoded_query = search_query.replace(' ', '+')
            await page.goto(f'https://www.youtube.com/results?search_query={encoded_query}&sp=EgIQAQ%253D%253D') # Add filter for educational content
            
            # Wait for content to load
            try:
                await page.wait_for_selector('ytd-video-renderer', timeout=5000)
                
                # Extract results
                videos = await page.evaluate("""() => {
                    return Array.from(document.querySelectorAll('ytd-video-renderer'))
                        .slice(0, 3) // Limit to top 3 results per keyword
                        .map(video => {
                            const titleElement = video.querySelector('a#video-title');
                            const channelElement = video.querySelector('a.yt-simple-endpoint.style-scope.ytd-channel-name');
                            
                            return {
                                title: titleElement?.title || '',
                                url: titleElement?.href || '',
                                channel: channelElement?.textContent?.trim() || '',
                                type: 'video'
                            };
                        })
                        .filter(video => video.url && video.title);
                }""")
                
                # Process results
                for video in videos:
                    # Categorize the video by subject
                    subject = determine_subject_from_keywords(keyword, video['title'])
                    
                    # Create a description
                    description = f"Educational video about {subject}: {video['title']} by {video['channel']}"
                    
                    results.append({
                        'title': video['title'],
                        'url': video['url'],
                        'description': description,
                        'subject': subject,
                        'type': 'video'
                    })
                    
                    # Limit total results
                    if len(results) >= 10:
                        break
                        
            except Exception as e:
                print(f"Error scraping YouTube for {search_query}: {e}")
                
            # Break if we have enough results
            if len(results) >= 10:
                break
        
        await browser.close()
        return results

def determine_subject_from_keywords(keyword, title):
    """Helper function to categorize content based on keywords and title."""
    keyword_lower = keyword.lower()
    title_lower = title.lower()
    
    if any(term in keyword_lower or term in title_lower for term in ['art', 'draw', 'paint', 'craft']):
        return 'art'
    elif any(term in keyword_lower or term in title_lower for term in ['music', 'sing', 'instrument', 'song']):
        return 'music'
    elif any(term in keyword_lower or term in title_lower for term in ['read', 'book', 'literacy', 'phonics']):
        return 'reading'
    elif any(term in keyword_lower or term in title_lower for term in ['writ', 'essay', 'journal', 'grammar']):
        return 'writing'
    elif any(term in keyword_lower or term in title_lower for term in ['math', 'number', 'geometry', 'algebra']):
        return 'math'
    elif any(term in keyword_lower or term in title_lower for term in ['science', 'biology', 'chemistry', 'physics']):
        return 'science'
    elif any(term in keyword_lower or term in title_lower for term in ['history', 'geography', 'civil']):
        return 'history'
    elif any(term in keyword_lower or term in title_lower for term in ['cod', 'program', 'computer']):
        return 'coding'
    
    # Default fallback to educational
    return keyword

# Playwright scraper for reading resources
async def scrape_reading_resources(keywords):
    """Scrape reading resources based on keywords and interests."""
    reading_resources = []
    grade_level = None
    
    # Extract grade level if present in keywords
    for keyword in keywords:
        keyword_lower = keyword.lower()
        for grade in ['preschool', 'kindergarten', '1st grade', '2nd grade', '3rd grade', 
                     '4th grade', '5th grade', '6th grade', '7th grade', '8th grade',
                     '9th grade', '10th grade', '11th grade', '12th grade']:
            if grade in keyword_lower:
                grade_level = grade
                break
        if grade_level:
            break
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        # Sites to check for reading resources - will be filtered by keywords
        reading_sites = [
            {
                'name': 'Reading Rockets',
                'url': 'https://www.readingrockets.org/search/site/{query}',
                'grade_param': False
            },
            {
                'name': 'ReadWorks',
                'url': 'https://www.readworks.org/find-content#{grade}/search?query={query}',
                'grade_param': True
            },
            {
                'name': 'CommonLit',
                'url': 'https://www.commonlit.org/en/texts?searchQuery={query}',
                'grade_param': False
            },
            {
                'name': 'K5 Learning',
                'url': 'https://www.k5learning.com/search/node/{query}',
                'grade_param': False
            }
        ]
        
        # Include sites focused on writing if writing-related keywords are present
        has_writing_keywords = any('writ' in keyword.lower() for keyword in keywords)
        if has_writing_keywords:
            writing_sites = [
                {
                    'name': 'WriteShop',
                    'url': 'https://writeshop.com/?s={query}',
                    'grade_param': False
                },
                {
                    'name': 'Brave Writer',
                    'url': 'https://bravewriter.com/search?q={query}',
                    'grade_param': False
                },
                {
                    'name': 'Journal Buddies',
                    'url': 'https://www.journalbuddies.com/?s={query}',
                    'grade_param': False
                }
            ]
            reading_sites.extend(writing_sites)
        
        # Process each keyword to find relevant resources
        for keyword in keywords:
            # Skip very general keywords
            if keyword.lower() in ['reading', 'writing', 'grade', 'school', 'homeschool', 'education']:
                continue
                
            # Format query for search
            query = keyword.replace(' ', '+')
            
            # Process each reading/writing site
            for site in reading_sites:
                try:
                    site_url = site['url'].replace('{query}', query)
                    
                    # Add grade parameter if supported and available
                    if site['grade_param'] and grade_level:
                        grade_formatted = grade_level.replace(' ', '-').lower()
                        site_url = site_url.replace('{grade}', grade_formatted)
                    else:
                        site_url = site_url.replace('{grade}/', '')
                    
                    # Navigate to search URL
                    await page.goto(site_url)
                    
                    # Wait for content to load
                    await page.wait_for_selector('a', timeout=5000)
                    
                    # Extract resource links
                    resources = await page.evaluate("""(siteName) => {
                        return Array.from(document.querySelectorAll('a[href*="lesson"], a[href*="resource"], a[href*="activity"], a[href*="worksheet"], a[href*="article"], a[href*="text"]'))
                            .slice(0, 3) // Limit to top 3 results per site
                            .map(link => {
                                // Get text content from parent element for better description
                                let descriptionElement = link.closest('div, li, article');
                                let description = '';
                                if (descriptionElement) {
                                    // Get text but limit length
                                    description = descriptionElement.textContent.trim().substring(0, 150) + '...';
                                } else {
                                    description = `Resource from ${siteName}`;
                                }
                                
                                return {
                                    title: link.textContent.trim() || 'Educational Resource',
                                    url: link.href,
                                    description: description,
                                    site: siteName
                                };
                            })
                            .filter(resource => resource.url && resource.title);
                    }""", site['name'])
                    
                    # Process results
                    for resource in resources:
                        # Determine subject and type
                        subject = determine_subject_from_keywords(keyword, resource['title'])
                        resource_type = 'reading resource' if not has_writing_keywords else 'writing resource'
                        
                        if 'worksheet' in resource['url'].lower() or 'worksheet' in resource['title'].lower():
                            resource_type = 'worksheet'
                        elif 'lesson' in resource['url'].lower() or 'lesson' in resource['title'].lower():
                            resource_type = 'lesson'
                        
                        reading_resources.append({
                            'title': resource['title'],
                            'url': resource['url'],
                            'description': resource['description'],
                            'subject': subject,
                            'type': resource_type
                        })
                    
                    # Limit total results
                    if len(reading_resources) >= 15:
                        break
                        
                except Exception as e:
                    print(f"Error scraping {site['name']}: {e}")
                    continue
            
            # Break if we have enough results
            if len(reading_resources) >= 15:
                break
                
        await browser.close()
        
    # Return unique resources (avoid duplicates)
    seen_urls = set()
    unique_resources = []
    
    for resource in reading_resources:
        if resource['url'] not in seen_urls:
            seen_urls.add(resource['url'])
            unique_resources.append(resource)
    
    return unique_resources[:10]  # Return top 10 unique resources

def filter_results(results, keywords):
    """Filter and prioritize results based on keywords."""
    filtered = []
    
    # Identify potential sub-interest keywords (more specific, longer keywords)
    main_subject_keywords = ['math', 'science', 'reading', 'writing', 'history', 'art', 'music', 'coding', 'sports', 'nature', 'geography', 'languages']
    grade_keywords = ['preschool', 'kindergarten', '1st grade', '2nd grade', '3rd grade', '4th grade', '5th grade', 
                     '6th grade', '7th grade', '8th grade', '9th grade', '10th grade', '11th grade', '12th grade']
    
    # Art-specific terminology to boost relevance scoring
    art_technique_keywords = [
        'drawing', 'painting', 'watercolor', 'acrylic', 'oil', 'pastels', 'sculpture', 
        'ceramics', 'printmaking', 'collage', 'mixed media', 'color theory', 'perspective',
        'shading', 'texture', 'composition', 'portrait', 'landscape', 'figure', 'abstract',
        'art history', 'digital art', 'crafts', 'clay', 'fiber arts', 'weaving', '3d art'
    ]
    
    # Music-specific terminology to boost relevance scoring
    music_terminology_keywords = [
        'rhythm', 'melody', 'harmony', 'notes', 'scale', 'chord', 'tempo', 'dynamics',
        'singing', 'song', 'instrument', 'percussion', 'recorder', 'ukulele', 'piano',
        'guitar', 'orchestra', 'band', 'ensemble', 'composition', 'musical', 'notation',
        'sheet music', 'music theory', 'pitch', 'tone', 'staff', 'clef', 'time signature',
        'beat', 'measure', 'vocal', 'performance', 'concert', 'music history', 'composer',
        'symphony', 'sonata', 'music genre', 'folk music', 'classical music', 'jazz',
        'digital music', 'recording', 'music production', 'sound', 'audio', 'music technology'
    ]
    
    # Reading-specific terminology to boost relevance scoring
    reading_terminology_keywords = [
        'phonics', 'phonological awareness', 'letter recognition', 'alphabet', 'sight words', 
        'phonemes', 'fluency', 'decoding', 'blending', 'comprehension', 'vocabulary',
        'story elements', 'characters', 'setting', 'plot', 'theme', 'fiction', 'nonfiction',
        'literature', 'genre', 'author study', 'inference', 'prediction', 'summarizing',
        'reading strategies', 'reading skills', 'chapter book', 'picture book', 'anthology',
        'reader', 'literacy', 'literary elements', 'literary devices', 'poetry', 'novel',
        'biography', 'autobiography', 'narrative', 'fairy tale', 'folktale', 'myth', 'legend',
        'research', 'text features', 'text structure', 'main idea', 'details', 'critical reading',
        'author\'s purpose', 'author\'s craft', 'literary analysis', 'literature circles',
        'reading response', 'reading workshop', 'guided reading', 'independent reading',
        'shared reading', 'fluent reading', 'reading assessment', 'reading level', 'lexile',
        'textual evidence', 'annotation', 'close reading', 'metacognition', 'context clues',
        'figurative language', 'rhetoric', 'argumentative text', 'persuasive text', 'digital literacy',
        'media literacy', 'compare and contrast', 'cause and effect', 'fact and opinion',
        'american literature', 'world literature', 'british literature', 'classic literature',
        'contemporary literature', 'literary criticism', 'literary theory', 'comparative literature'
    ]
    
    # Writing-specific terminology to boost relevance scoring
    writing_terminology_keywords = [
        'handwriting', 'letter formation', 'scribbling', 'name writing', 'sentence writing',
        'paragraph', 'essay', 'narrative', 'informative', 'opinion', 'persuasive', 'argumentative',
        'creative writing', 'journal', 'story development', 'revising', 'editing', 'publishing',
        'grammar', 'spelling', 'vocabulary', 'voice', 'style', 'thesis', 'research paper',
        'technical writing', 'rhetoric', 'writing process', 'drafting', 'proofreading',
        'writing workshop', 'author\'s craft', 'sentence structure', 'character development',
        'plot development', 'setting description', 'dialogue writing', 'memoir', 'journalism',
        'expository writing', 'descriptive writing', 'poetry writing', 'digital composition',
        'multimedia presentation', 'academic writing', 'citations', 'bibliography', 'annotation',
        'college essay', 'analytical writing', 'critical analysis', 'research synthesis',
        'professional writing', 'writing portfolio', 'publication'
    ]
    
    # Sports-specific terminology to boost relevance scoring
    sports_terminology_keywords = [
        'movement skills', 'motor skills', 'coordination', 'balance', 'flexibility', 'agility',
        'ball skills', 'throwing', 'catching', 'kicking', 'running', 'jumping', 'hopping',
        'team games', 'sportsmanship', 'rules', 'physical activity', 'exercise', 'fitness', 
        'sports equipment', 'gymnastics', 'dance', 'swimming', 'soccer', 'basketball', 'baseball',
        'volleyball', 'football', 'tennis', 'hockey', 'track and field', 'physical education',
        'outdoor games', 'movement exploration', 'body awareness', 'spatial awareness', 'rhythm',
        'movement patterns', 'relay races', 'obstacle courses', 'cooperative games', 'recreational'
    ]
    
    # Coding-specific terminology to boost relevance scoring
    coding_terminology_keywords = [
        'programming', 'code', 'coding', 'algorithm', 'sequence', 'debugging', 'computational thinking',
        'block coding', 'scratch', 'python', 'javascript', 'html', 'css', 'web development',
        'app development', 'game development', 'robotics', 'loops', 'conditionals', 'variables',
        'functions', 'data structures', 'data types', 'boolean logic', 'control flow', 'syntax',
        'commands', 'programming language', 'computer science', 'software', 'hardware', 'interface',
        'database', 'digital storytelling', 'animation', 'unplugged activities', 'binary', 'logic',
        'decomposition', 'abstraction', 'patterns', 'algorithms', 'logic gates', 'problem-solving',
        'project planning', 'testing', 'debugging', 'software development', 'cybersecurity',
        'mobile apps', 'web apps', 'user interface', 'user experience', 'front-end', 'back-end',
        'full-stack', 'APIs', 'object-oriented', 'functional programming', 'game mechanics'
    ]
    
    # Nature-specific terminology to boost relevance scoring
    nature_terminology_keywords = [
        'ecosystem', 'habitat', 'environment', 'biodiversity', 'conservation', 'sustainable',
        'wildlife', 'plants', 'animals', 'botany', 'zoology', 'ecology', 'biomes', 'forest',
        'ocean', 'marine', 'desert', 'jungle', 'rainforest', 'wetland', 'prairie', 'tundra',
        'species', 'life cycle', 'food web', 'food chain', 'adaptation', 'evolution', 'natural',
        'nature', 'outdoors', 'environmental', 'climate', 'weather', 'seasons', 'resources',
        'earth', 'geology', 'rocks', 'minerals', 'water cycle', 'water conservation', 'energy',
        'renewable', 'recycling', 'pollution', 'environmental impact', 'stewardship', 'preservation',
        'sustainability', 'biology', 'carbon', 'footprint', 'deforestation', 'endangered',
        'extinct', 'organic', 'climate change', 'global warming', 'earth day', 'green living',
        'earth science', 'environmental science', 'ecology', 'biogeochemical', 'population dynamics'
    ]
    
    # Animals-specific terminology to boost relevance scoring
    animals_terminology_keywords = [
        'zoology', 'animal', 'wildlife', 'pet', 'mammal', 'bird', 'reptile', 'amphibian', 'fish',
        'insect', 'invertebrate', 'vertebrate', 'species', 'breed', 'habitat', 'adaptation',
        'behavior', 'carnivore', 'herbivore', 'omnivore', 'predator', 'prey', 'endangered',
        'extinct', 'conservation', 'life cycle', 'migration', 'hibernation', 'domesticated',
        'wild', 'farm animal', 'marine animal', 'zoo', 'aquarium', 'safari', 'ecosystem',
        'food chain', 'classification', 'taxonomy', 'phylum', 'genus', 'species', 'fauna',
        'biodiversity', 'evolution', 'natural selection', 'genetics', 'DNA', 'heredity',
        'anatomy', 'physiology', 'skeletal', 'circulatory', 'digestive', 'reproductive',
        'respiratory', 'ethology', 'instinct', 'camouflage', 'communication', 'mating',
        'offspring', 'incubation', 'metamorphosis', 'nesting', 'herd', 'pack', 'pride',
        'flock', 'school', 'colony', 'hive', 'veterinary', 'animal care', 'animal welfare'
    ]
    
    # Space-specific terminology to boost relevance scoring
    space_terminology_keywords = [
        'astronomy', 'space', 'planet', 'solar system', 'galaxy', 'universe', 'cosmos',
        'star', 'constellation', 'moon', 'sun', 'earth', 'mars', 'jupiter', 'saturn',
        'venus', 'mercury', 'uranus', 'neptune', 'pluto', 'asteroid', 'comet', 'meteor',
        'orbit', 'gravity', 'telescope', 'observatory', 'satellite', 'spacecraft', 'rocket',
        'astronaut', 'nasa', 'esa', 'spacex', 'iss', 'international space station',
        'eclipse', 'lunar', 'solar', 'celestial', 'cosmic', 'nebula', 'supernova', 'black hole',
        'milky way', 'light year', 'parsec', 'astronomer', 'astrophysics', 'cosmology',
        'exoplanet', 'extraterrestrial', 'mission', 'launch', 'touchdown', 'rover', 'probe',
        'hubble', 'james webb', 'observatory', 'space shuttle', 'apollo', 'gemini', 'mercury program',
        'day/night cycle', 'rotation', 'revolution', 'axis', 'equinox', 'solstice',
        'astronomical unit', 'big bang', 'dark matter', 'dark energy', 'quasar', 'pulsar',
        'dwarf planet', 'space exploration', 'space travel', 'interstellar', 'spacewalk',
        'zero gravity', 'weightlessness', 'astronavigation', 'cosmonauts', 'planetary science'
    ]
    
    # Categorize keywords into main subjects and specific topics
    specific_topic_keywords = []
    art_related_keywords = []
    music_related_keywords = []
    reading_related_keywords = []
    writing_related_keywords = []
    sports_related_keywords = []
    coding_related_keywords = []
    nature_related_keywords = []
    animals_related_keywords = []
    space_related_keywords = []
    
    for keyword in keywords:
        is_generic = False
        # Check if keyword contains just a grade or main subject
        for grade in grade_keywords:
            if grade in keyword.lower() and len(keyword.split()) <= 2:
                is_generic = True
                break
                
        for subject in main_subject_keywords:
            if subject in keyword.lower() and len(keyword.split()) <= 2:
                is_generic = True
                break
                
        if not is_generic and len(keyword.split()) >= 2:
            specific_topic_keywords.append(keyword)
            
        # Identify art-specific keywords
        if 'art' in keyword.lower():
            art_related_keywords.append(keyword)
            for technique in art_technique_keywords:
                if technique in keyword.lower():
                    specific_topic_keywords.append(keyword)  # Double count important art technique keywords
        
        # Identify music-specific keywords
        if 'music' in keyword.lower():
            music_related_keywords.append(keyword)
            for term in music_terminology_keywords:
                if term in keyword.lower():
                    specific_topic_keywords.append(keyword)  # Double count important music terminology keywords
        
        # Identify reading-specific keywords
        if 'reading' in keyword.lower():
            reading_related_keywords.append(keyword)
            for term in reading_terminology_keywords:
                if term in keyword.lower():
                    specific_topic_keywords.append(keyword)  # Double count important reading terminology keywords
                    
        # Identify writing-specific keywords
        if 'writing' in keyword.lower():
            writing_related_keywords.append(keyword)
            for term in writing_terminology_keywords:
                if term in keyword.lower():
                    specific_topic_keywords.append(keyword)  # Double count important writing terminology keywords
                    
        # Identify sports-specific keywords
        if 'sports' in keyword.lower() or 'physical' in keyword.lower() or 'movement' in keyword.lower():
            sports_related_keywords.append(keyword)
            for term in sports_terminology_keywords:
                if term in keyword.lower():
                    specific_topic_keywords.append(keyword)  # Double count important sports terminology keywords
                    
        # Identify coding-specific keywords
        if 'coding' in keyword.lower() or 'programming' in keyword.lower() or 'computer science' in keyword.lower():
            coding_related_keywords.append(keyword)
            for term in coding_terminology_keywords:
                if term in keyword.lower():
                    specific_topic_keywords.append(keyword)  # Double count important coding terminology keywords
                    
        # Identify nature-specific keywords
        if 'nature' in keyword.lower() or 'environment' in keyword.lower() or 'ecology' in keyword.lower() or 'biology' in keyword.lower() or 'earth' in keyword.lower():
            nature_related_keywords.append(keyword)
            for term in nature_terminology_keywords:
                if term in keyword.lower():
                    specific_topic_keywords.append(keyword)  # Double count important nature terminology keywords
                    
        # Identify animals-specific keywords
        if 'animal' in keyword.lower() or 'zoology' in keyword.lower() or 'wildlife' in keyword.lower() or 'pet' in keyword.lower() or 'species' in keyword.lower():
            animals_related_keywords.append(keyword)
            for term in animals_terminology_keywords:
                if term in keyword.lower():
                    specific_topic_keywords.append(keyword)  # Double count important animals terminology keywords
                    
        # Identify space-specific keywords
        if 'space' in keyword.lower() or 'astronomy' in keyword.lower() or 'planet' in keyword.lower() or 'solar system' in keyword.lower() or 'universe' in keyword.lower() or 'galaxy' in keyword.lower() or 'star' in keyword.lower() or 'celestial' in keyword.lower():
            space_related_keywords.append(keyword)
            for term in space_terminology_keywords:
                if term in keyword.lower():
                    specific_topic_keywords.append(keyword)  # Double count important space terminology keywords
    
    for result in results:
        # Ensure required fields exist
        if 'title' not in result or not result['title']:
            continue
            
        if 'url' not in result or not result['url']:
            continue
            
        # Add default values for required fields if they don't exist
        if 'description' not in result or not result['description']:
            result['description'] = f"Educational resource about {result.get('subject', 'various topics')}"
            
        if 'subject' not in result or not result['subject']:
            result['subject'] = 'Educational'
            
        if 'type' not in result or not result['type']:
            result['type'] = determine_resource_type_from_url(result.get('url', ''))
            
        if 'estimatedTime' not in result:
            result['estimatedTime'] = estimate_completion_time(result)
        
        # Combine title and description for matching
        text_to_match = (result['title'] + " " + result['description']).lower()
        
        # Score based on keyword matches with weighting
        score = 0
        
        # Higher score for specific topic matches - these are more important
        for keyword in specific_topic_keywords:
            if keyword.lower() in text_to_match:
                # Specific topic keywords get 3 points
                score += 3
                
                # Extra points if it's in the title (more relevant)
                if keyword.lower() in result['title'].lower():
                    score += 2
        
        # Base points for any keyword match
        for keyword in keywords:
            if keyword.lower() in text_to_match:
                score += 1
                
        # Extra points for art technique matches in art-related results
        if 'art' in text_to_match or result.get('subject', '').lower() == 'art':
            for technique in art_technique_keywords:
                if technique in text_to_match:
                    score += 2
                    
                    # Even more points for title matches of art techniques
                    if technique in result['title'].lower():
                        score += 1
            
            # Boost resources that match specific art-related keywords
            for keyword in art_related_keywords:
                if keyword.lower() in text_to_match:
                    score += 1
        
        # Extra points for music terminology matches in music-related results
        if 'music' in text_to_match or result.get('subject', '').lower() == 'music':
            for term in music_terminology_keywords:
                if term in text_to_match:
                    score += 2
                    
                    # Even more points for title matches of music terminology
                    if term in result['title'].lower():
                        score += 1
            
            # Boost resources that match specific music-related keywords
            for keyword in music_related_keywords:
                if keyword.lower() in text_to_match:
                    score += 1
                    
            # Additional scoring for music instrument tutorials and lessons
            instruments = ['piano', 'guitar', 'violin', 'ukulele', 'recorder', 'drums', 'flute', 'percussion']
            for instrument in instruments:
                if instrument in text_to_match and ('learn' in text_to_match or 'lesson' in text_to_match or 'tutorial' in text_to_match):
                    score += 3
        
        # Extra points for reading terminology matches in reading-related results
        if 'reading' in text_to_match or result.get('subject', '').lower() == 'reading':
            for term in reading_terminology_keywords:
                if term in text_to_match:
                    score += 2
                    
                    # Even more points for title matches of reading terminology
                    if term in result['title'].lower():
                        score += 1
            
            # Boost resources that match specific reading-related keywords
            for keyword in reading_related_keywords:
                if keyword.lower() in text_to_match:
                    score += 1
        
        # Extra points for writing terminology matches in writing-related results
        if 'writing' in text_to_match or result.get('subject', '').lower() == 'writing':
            for term in writing_terminology_keywords:
                if term in text_to_match:
                    score += 2
                    
                    # Even more points for title matches of writing terminology
                    if term in result['title'].lower():
                        score += 1
            
            # Boost resources that match specific writing-related keywords
            for keyword in writing_related_keywords:
                if keyword.lower() in text_to_match:
                    score += 1
        
        # Extra points for sports terminology matches in sports-related results
        if 'sports' in text_to_match or 'physical education' in text_to_match or result.get('subject', '').lower() == 'sports':
            for term in sports_terminology_keywords:
                if term in text_to_match:
                    score += 2
                    
                    # Even more points for title matches of sports terminology
                    if term in result['title'].lower():
                        score += 1
            
            # Boost resources that match specific sports-related keywords
            for keyword in sports_related_keywords:
                if keyword.lower() in text_to_match:
                    score += 1
        
        # Extra points for coding terminology matches in coding-related results
        if 'coding' in text_to_match or 'programming' in text_to_match or 'computer science' in text_to_match or result.get('subject', '').lower() == 'coding':
            for term in coding_terminology_keywords:
                if term in text_to_match:
                    score += 2
                    
                    # Even more points for title matches of coding terminology
                    if term in result['title'].lower():
                        score += 1
            
            # Boost resources that match specific coding-related keywords
            for keyword in coding_related_keywords:
                if keyword.lower() in text_to_match:
                    score += 1
        
        # Extra points for nature terminology matches in nature-related results
        if 'nature' in text_to_match or 'environment' in text_to_match or 'ecology' in text_to_match or result.get('subject', '').lower() == 'nature':
            for term in nature_terminology_keywords:
                if term in text_to_match:
                    score += 2
                    
                    # Even more points for title matches of nature terminology
                    if term in result['title'].lower():
                        score += 1
            
            # Boost resources that match specific nature-related keywords
            for keyword in nature_related_keywords:
                if keyword.lower() in text_to_match:
                    score += 1
        
        # Extra points for animals terminology matches in animals-related results
        if 'animal' in text_to_match or 'wildlife' in text_to_match or 'zoology' in text_to_match or 'pet' in text_to_match or result.get('subject', '').lower() == 'animals':
            for term in animals_terminology_keywords:
                if term in text_to_match:
                    score += 2
                    
                    # Even more points for title matches of animals terminology
                    if term in result['title'].lower():
                        score += 1
            
            # Boost resources that match specific animals-related keywords
            for keyword in animals_related_keywords:
                if keyword.lower() in text_to_match:
                    score += 1
        
        # Extra points for space terminology matches in space-related results
        if 'space' in text_to_match or 'astronomy' in text_to_match or 'planet' in text_to_match or 'solar system' in text_to_match or 'universe' in text_to_match or result.get('subject', '').lower() == 'space':
            for term in space_terminology_keywords:
                if term in text_to_match:
                    score += 2
                    
                    # Even more points for title matches of space terminology
                    if term in result['title'].lower():
                        score += 1
            
            # Boost resources that match specific space-related keywords
            for keyword in space_related_keywords:
                if keyword.lower() in text_to_match:
                    score += 1
        
        # Add result if it has a score greater than 0
        if score > 0:
            result['relevance_score'] = score
            filtered.append(result)
    
    # Sort by relevance
    return sorted(filtered, key=lambda x: x['relevance_score'], reverse=True)[:10]

def determine_resource_type_from_url(url):
    """Determine the type of resource based on URL."""
    url_lower = url.lower()
    
    if 'youtube.com' in url_lower or 'youtu.be' in url_lower or 'vimeo.com' in url_lower:
        return 'Video'
    elif '.pdf' in url_lower or 'worksheet' in url_lower or 'printable' in url_lower:
        return 'Worksheet'
    elif 'game' in url_lower or 'interactive' in url_lower or 'play' in url_lower:
        return 'Interactive'
    elif 'lesson' in url_lower or 'curriculum' in url_lower or 'plan' in url_lower:
        return 'Lesson Plan'
    elif 'activity' in url_lower or 'project' in url_lower or 'experiment' in url_lower:
        return 'Activity'
    else:
        return 'Resource'

def estimate_completion_time(resource):
    """Estimate completion time based on resource type."""
    resource_type = resource.get('type', '').lower()
    
    if 'video' in resource_type:
        # For videos, use the title or description to try to parse duration
        # Format might be: "... (5:20)" or "... [10 min]" or similar
        title = resource.get('title', '').lower()
        description = resource.get('description', '').lower()
        
        # Look for patterns like (MM:SS) or (H:MM:SS)
        duration_pattern = r'\((\d+:)?\d+:\d+\)'
        
        match = re.search(duration_pattern, title)
        if not match:
            match = re.search(duration_pattern, description)
        
        if match:
            return f"{match.group(0).strip('()')}"
            
        # Look for patterns like "X min" or "X minutes"
        min_pattern = r'(\d+)\s*min(ute)?s?'
        match = re.search(min_pattern, title)
        if not match:
            match = re.search(min_pattern, description)
            
        if match:
            return f"{match.group(1)} minutes"
        
        # Default for videos if no duration found
        return '10 minutes'
        
    elif 'worksheet' in resource_type:
        return '15 minutes'
        
    elif 'interactive' in resource_type or 'game' in resource_type:
        return '10 minutes'
        
    # Default for all other types
    return '5 minutes'

def scrape_resources(search_id, keywords):
    """Scrape educational resources using Scrapy and Playwright based on profile interests."""
    # Step 1: Clean and validate keywords
    if not keywords or len(keywords) == 0:
        update_status(search_id, "error", "No search keywords provided", 0)
        return {
            'resources': [],
            'keywordStats': {
                'totalKeywords': 0,
                'keywordsSearched': 0,
                'resourcesFound': 0
            }
        }
    
    # Clean keywords - remove duplicates and standardize
    clean_keywords = []
    for keyword in keywords:
        # Skip empty keywords
        if not keyword or len(keyword.strip()) == 0:
            continue
        
        # Clean and add the keyword
        clean_keyword = keyword.strip()
        if clean_keyword not in clean_keywords:
            clean_keywords.append(clean_keyword)
    
    # Step 2: Scrape static sites with Scrapy
    update_status(search_id, "scraping", "Searching educational websites for personalized content...", 20)
    
    scrapy_results = []
    process = CrawlerProcess(settings={
        'FEEDS': {
            f'data/searches/{search_id}_scrapy.json': {'format': 'json'},
        },
        'LOG_LEVEL': 'INFO',
    })
    process.crawl(EduSpider, keywords=clean_keywords)
    process.start()
    
    # Load Scrapy results
    scrapy_file = f'data/searches/{search_id}_scrapy.json'
    if os.path.exists(scrapy_file):
        with open(scrapy_file, 'r') as f:
            scrapy_results = json.load(f)
    
    # Step 3: Analyze keywords to determine which dynamic scrapers to use
    update_status(search_id, "scraping", "Searching for specialized resources based on interests...", 40)
    
    # Initialize results containers
    youtube_results = []
    reading_results = []
    loop = asyncio.get_event_loop()
    
    # Analyze keywords to determine interests
    interest_categories = {
        'art': ['art', 'draw', 'paint', 'craft', 'color', 'design'],
        'music': ['music', 'song', 'instrument', 'singing', 'notes', 'melody'],
        'reading': ['read', 'book', 'story', 'literature', 'phonics', 'comprehension'],
        'writing': ['writ', 'journal', 'essay', 'grammar', 'composition', 'letter'],
        'math': ['math', 'number', 'geometry', 'algebra', 'count', 'calculation'],
        'science': ['science', 'biology', 'chemistry', 'physics', 'experiment', 'nature'],
        'history': ['history', 'past', 'geography', 'civil', 'culture', 'ancient'],
        'coding': ['cod', 'program', 'computer science', 'algorithm', 'software']
    }
    
    detected_interests = set()
    for keyword in clean_keywords:
        keyword_lower = keyword.lower()
        for interest, terms in interest_categories.items():
            if any(term in keyword_lower for term in terms):
                detected_interests.add(interest)
    
    # Step 4: Scrape resources based on detected interests
    
    # Always scrape YouTube for educational videos - it has content for all subjects
    update_status(search_id, "scraping", "Finding educational videos based on interests...", 50)
    youtube_results = loop.run_until_complete(scrape_youtube(clean_keywords))
    
    # Scrape reading/writing resources if relevant interests are detected
    if 'reading' in detected_interests or 'writing' in detected_interests:
        update_status(search_id, "scraping", f"Finding {'reading and writing' if 'reading' in detected_interests and 'writing' in detected_interests else 'reading' if 'reading' in detected_interests else 'writing'} resources...", 60)
        reading_results = loop.run_until_complete(scrape_reading_resources(clean_keywords))
    
    # Step 5: Combine and filter results
    update_status(search_id, "processing", "Processing and filtering results based on your interests...", 70)
    all_results = scrapy_results + youtube_results + reading_results
    
    # Remove duplicate results (based on URL)
    unique_urls = set()
    unique_results = []
    
    for result in all_results:
        if result.get('url') and result['url'] not in unique_urls:
            unique_urls.add(result['url'])
            unique_results.append(result)
    
    # Apply relevance filtering to prioritize best matches
    filtered_results = filter_results(unique_results, clean_keywords)
    
    # Ensure all required fields are present
    standardized_results = []
    for result in filtered_results:
        standardized_result = {
            'title': result.get('title', 'Educational Resource'),
            'url': result.get('url', '#'),
            'description': result.get('description', 'Educational resource'),
            'subject': result.get('subject', 'Educational'),
            'type': result.get('type', 'Resource'),
            'estimatedTime': result.get('estimatedTime') or estimate_completion_time(result)
        }
        standardized_results.append(standardized_result)
    
    return standardized_results

async def extract_resource_content(url):
    """
    Extract meaningful content from a resource URL using Playwright.
    Focuses on article text, lists, and headings.
    """
    try:
        # Special case for YouTube videos - we can't get the transcript easily
        # but we can extract the video description which is often informative
        if 'youtube.com' in url or 'youtu.be' in url:
            return await extract_youtube_content(url)
            
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
            )
            page = await context.new_page()
            
            # Set a timeout for navigation
            try:
                await page.goto(url, timeout=15000, wait_until='domcontentloaded')
                # Wait a bit for dynamic content to load
                await page.wait_for_timeout(2000)
            except Exception as e:
                print(f"Navigation error for {url}: {e}")
                await browser.close()
                return ""
            
            # Extract meaningful content - article, lists, headings
            content = await page.evaluate("""() => {
                // Helper function to clean text
                const cleanText = (text) => {
                    if (!text) return '';
                    return text.replace(/\\s+/g, ' ').trim();
                };
                
                let extractedContent = [];
                
                // Try to find article content first (usually most relevant)
                const articles = document.querySelectorAll('article');
                if (articles.length > 0) {
                    for (const article of articles) {
                        extractedContent.push(cleanText(article.textContent));
                    }
                }
                
                // Get main content if no articles found
                if (extractedContent.length === 0) {
                    const mainContent = document.querySelector('main');
                    if (mainContent) {
                        extractedContent.push(cleanText(mainContent.textContent));
                    }
                }
                
                // Extract headings, very valuable for educational content structure
                const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                let headingTexts = [];
                for (const heading of headings) {
                    // Skip very short headings or navigation headings
                    const headingText = cleanText(heading.textContent);
                    if (headingText.length > 3 && !['menu', 'navigation', 'search'].includes(headingText.toLowerCase())) {
                        headingTexts.push(`Heading: ${headingText}`);
                    }
                }
                if (headingTexts.length > 0) {
                    extractedContent.push(headingTexts.join('\\n'));
                }
                
                // Extract lists (often contain educational content like steps or key points)
                const lists = document.querySelectorAll('ol, ul');
                for (const list of lists) {
                    // Skip tiny lists or navigation lists
                    if (list.children.length < 2) continue;
                    if (list.closest('nav') || list.closest('header') || list.closest('footer')) continue;
                    
                    const listItems = list.querySelectorAll('li');
                    const listType = list.tagName === 'OL' ? 'Ordered List:' : 'Unordered List:';
                    let listContent = `${listType}\\n`;
                    
                    let itemsText = [];
                    for (const item of listItems) {
                        const itemText = cleanText(item.textContent);
                        if (itemText.length > 0) {
                            itemsText.push(`- ${itemText}`);
                        }
                    }
                    
                    if (itemsText.length > 0) {
                        listContent += itemsText.join('\\n');
                        extractedContent.push(listContent);
                    }
                }
                
                // Look for content in common educational site containers
                if (extractedContent.length === 0 || extractedContent[0].length < 200) {
                    const contentAreas = document.querySelectorAll('.content, #content, .main-content, #main, .lesson, .resource, .worksheet, .activity, .article');
                    for (const area of contentAreas) {
                        const paragraphs = area.querySelectorAll('p');
                        let paragraphTexts = [];
                        for (const p of paragraphs) {
                            const pText = cleanText(p.textContent);
                            if (pText.length > 30) { // Skip very short paragraphs, likely UI elements
                                paragraphTexts.push(pText);
                            }
                        }
                        if (paragraphTexts.length > 0) {
                            extractedContent.push(paragraphTexts.join('\\n\\n'));
                        }
                    }
                }
                
                // If still no specific content found, get important paragraphs
                if (extractedContent.length === 0 || extractedContent.join('').length < 200) {
                    const paragraphs = document.querySelectorAll('p');
                    let paragraphTexts = [];
                    for (const p of paragraphs) {
                        // Skip paragraphs in navigation, header, footer
                        if (p.closest('nav') || p.closest('header') || p.closest('footer')) continue;
                        
                        const pText = cleanText(p.textContent);
                        if (pText.length > 40) { // Only substantial paragraphs
                            paragraphTexts.push(pText);
                        }
                    }
                    if (paragraphTexts.length > 0) {
                        extractedContent.push(paragraphTexts.join('\\n\\n'));
                    }
                }
                
                // Add any definitions or key terms (common in educational content)
                const definitions = document.querySelectorAll('dl, .definition, .key-term, .glossary');
                let definitionTexts = [];
                for (const def of definitions) {
                    definitionTexts.push(cleanText(def.textContent));
                }
                if (definitionTexts.length > 0) {
                    extractedContent.push('Key Terms and Definitions:\\n' + definitionTexts.join('\\n'));
                }
                
                // Combine all content with reasonable formatting
                let combinedContent = extractedContent.join('\\n\\n');
                
                // Limit size but not too small for educational content (which can be comprehensive)
                return combinedContent.slice(0, 15000); // Allow larger content than before
            }""")
            
            await browser.close()
            
            # Process the content to make it more usable
            if content:
                content = process_extracted_content(content)
            
            return content
    except Exception as e:
        print(f"Error extracting content from {url}: {e}")
        return ""

async def extract_youtube_content(url):
    """Extract content from YouTube videos (title, description, etc.)"""
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            context = await browser.new_context(
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
            )
            page = await context.new_page()
            
            try:
                await page.goto(url, timeout=20000, wait_until='domcontentloaded')
                await page.wait_for_timeout(3000)  # Wait for dynamic content
            except Exception as e:
                print(f"YouTube navigation error for {url}: {e}")
                await browser.close()
                return "YouTube video - content unavailable"
            
            # Extract YouTube video metadata
            content = await page.evaluate("""() => {
                const cleanText = (text) => {
                    if (!text) return '';
                    return text.replace(/\\s+/g, ' ').trim();
                };
                
                // Get video title
                const title = document.querySelector('h1.title') || 
                             document.querySelector('h1') ||
                             document.querySelector('h1 yt-formatted-string');
                
                // Get video description
                const description = document.querySelector('#description-inline-expander') || 
                                   document.querySelector('#description') ||
                                   document.querySelector('.ytd-expandable-video-description-body-renderer');
                
                // Get channel name
                const channel = document.querySelector('#owner-name a') ||
                               document.querySelector('#channel-name') ||
                               document.querySelector('.ytd-channel-name');
                
                // Additional educational information that might be available
                const infoRows = document.querySelectorAll('#info-rows .ytd-video-secondary-info-renderer');
                let additionalInfo = '';
                for (const row of infoRows) {
                    additionalInfo += cleanText(row.textContent) + '\\n';
                }
                
                let result = 'YouTube Video Content:\\n\\n';
                
                if (title) {
                    result += 'Title: ' + cleanText(title.textContent) + '\\n\\n';
                }
                
                if (channel) {
                    result += 'Channel: ' + cleanText(channel.textContent) + '\\n\\n';
                }
                
                if (description) {
                    result += 'Description:\\n' + cleanText(description.textContent) + '\\n\\n';
                }
                
                if (additionalInfo) {
                    result += 'Additional Info:\\n' + additionalInfo;
                }
                
                return result;
            }""")
            
            await browser.close()
            return content
    except Exception as e:
        print(f"Error extracting YouTube content from {url}: {e}")
        return "YouTube video - content extraction failed"

def process_extracted_content(content):
    """Process and clean the extracted content to make it more useful"""
    if not content:
        return ""
        
    # Remove excessive whitespace
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # Try to detect and mark sections in the content
    section_patterns = [
        (r'(Introduction|Overview|Summary):', r'\n\n===\1===\n\n'),
        (r'(Steps|Instructions|Procedure):', r'\n\n===\1===\n\n'),
        (r'(Materials|Supplies|Resources):', r'\n\n===\1===\n\n'),
        (r'(Conclusion|Results|Outcome):', r'\n\n===\1===\n\n'),
        (r'(Assessment|Evaluation|Quiz):', r'\n\n===\1===\n\n')
    ]
    
    for pattern, replacement in section_patterns:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
    
    # Standardize list formatting
    content = re.sub(r'(?<=\n)[-•*](?=\s)', '-', content)
    
    # Make headings stand out
    content = re.sub(r'Heading:\s*([^\n]+)', r'=== \1 ===', content)
    
    # Truncate to a reasonable length if needed
    if len(content) > 20000:
        content = content[:20000] + "...[content truncated]"
    
    return content

async def fetch_resource_content(standardized_results):
    """Extract and add content for each resource"""
    update_resources = []
    
    # Process resources in batches to avoid overwhelming the system
    batch_size = 3
    for i in range(0, len(standardized_results), batch_size):
        batch = standardized_results[i:i+batch_size]
        tasks = []
        
        for resource in batch:
            if resource['url'] != '#' and not resource['url'].startswith('file://'):
                tasks.append(extract_resource_content(resource['url']))
            else:
                tasks.append(asyncio.sleep(0))  # Dummy task for resources without valid URLs
        
        # Wait for all content extraction tasks in this batch to complete
        contents = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Add content to resources
        for j, resource in enumerate(batch):
            content = contents[j] if not isinstance(contents[j], Exception) else ""
            resource['contentText'] = content if content else ""
            update_resources.append(resource)
    
    return update_resources

def main():
    """Main entry point for the scraper."""
    if len(sys.argv) < 2:
        print("Usage: python main.py <search_id> [keywords...]")
        sys.exit(1)
    
    search_id = sys.argv[1]
    
    # Get keywords from command line arguments
    keywords = sys.argv[2:] if len(sys.argv) > 2 else []
    
    # Validate inputs
    if not search_id:
        print("Error: Search ID is required")
        sys.exit(1)
    
    if not keywords or len(keywords) == 0:
        print("Warning: No keywords provided. Will use default educational keywords.")
        # Provide some basic fallback keywords for educational content
        keywords = ["educational", "learning", "homeschool", "student resources"]
    
    # Log the search process
    print(f"Starting search {search_id} with {len(keywords)} keywords")
    print(f"Sample keywords: {', '.join(keywords[:5])}" + ("..." if len(keywords) > 5 else ""))
    
    # Create the status file if it doesn't exist
    status_file = os.path.join('data', 'searches', f'{search_id}.json')
    if not os.path.exists(status_file):
        initial_status = {
            "id": search_id,
            "status": "initializing",
            "message": "Starting search...",
            "progress": 0,
            "startTime": datetime.now().isoformat(),
            "keywords": keywords
        }
        with open(status_file, 'w') as f:
            json.dump(initial_status, f, indent=2)
    
    # Update status to scraping
    update_status(search_id, "initializing", "Starting search for educational resources based on profile interests...", 10)
    
    try:
        # Scrape resources
        results = scrape_resources(search_id, keywords)
        
        # Update status to processing
        update_status(search_id, "processing", "Extracting content from resources...", 80)
        
        # Extract content from each resource
        loop = asyncio.get_event_loop()
        results_with_content = loop.run_until_complete(fetch_resource_content(results))
        
        # Update status to processing
        update_status(search_id, "processing", "Finalizing your personalized educational resources...", 90)
        
        # Store results in the status file
        with open(status_file, 'r') as f:
            search_status = json.load(f)
        
        search_status["status"] = "success"
        search_status["message"] = "Search completed successfully!"
        search_status["progress"] = 100
        search_status["endTime"] = datetime.now().isoformat()
        search_status["results"] = results_with_content
        
        with open(status_file, 'w') as f:
            json.dump(search_status, f, indent=2)
        
        print(f"Search completed successfully! Found {len(results_with_content)} resources.")
        
    except Exception as e:
        # Handle any unexpected errors
        print(f"Error during search: {e}")
        
        # Update status to error
        error_message = str(e)
        update_status(search_id, "error", f"An error occurred: {error_message[:100]}", 0)
        
        sys.exit(1)

if __name__ == "__main__":
    main() 