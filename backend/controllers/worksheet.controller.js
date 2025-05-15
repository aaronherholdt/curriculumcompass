import worksheetGenerator from '../services/worksheetGenerator.js';
import { chromium } from 'playwright';

/**
 * Generate a worksheet based on resource content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateWorksheet = async (req, res) => {
  try {
    const { resource, childName, grade, worksheetType } = req.body;
    
    if (!resource || !childName || !grade || !worksheetType) {
      return res.status(400).json({
        success: false,
        message: 'Resource, child name, grade, and worksheet type are required'
      });
    }
    
    // Check for content text
    if (!resource.contentText) {
      console.log('Warning: No contentText provided for worksheet generation');
    }
    
    // Generate worksheet content
    const worksheetContent = worksheetGenerator.generateWorksheetContent(
      resource,
      childName,
      grade,
      worksheetType
    );
    
    res.status(200).json({
      success: true,
      worksheet: worksheetContent
    });
  } catch (error) {
    console.error('Error in generateWorksheet:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating worksheet'
    });
  }
};

/**
 * Get available worksheet types for a subject and grade
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getWorksheetTypes = async (req, res) => {
  try {
    const { subject, grade } = req.query;
    
    if (!subject || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Subject and grade are required'
      });
    }
    
    // Get appropriate worksheet types
    const worksheetTypes = worksheetGenerator.getWorksheetTypesBySubject(subject, grade);
    
    res.status(200).json({
      success: true,
      worksheetTypes
    });
  } catch (error) {
    console.error('Error in getWorksheetTypes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting worksheet types'
    });
  }
};

/**
 * Generate an answer key for a worksheet
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const generateAnswerKey = async (req, res) => {
  try {
    const { resource, worksheetType } = req.body;
    
    if (!resource || !worksheetType) {
      return res.status(400).json({
        success: false,
        message: 'Resource and worksheet type are required'
      });
    }
    
    // Generate worksheet content (which includes answer key data)
    const worksheetContent = worksheetGenerator.generateWorksheetContent(
      resource,
      'Answer Key',
      'N/A',
      worksheetType
    );
    
    // Extract answer key information based on worksheet type
    let answerKey = {};
    
    switch (worksheetType) {
      case worksheetGenerator.WORKSHEET_TYPES.VOCABULARY:
        // For vocabulary, we don't have predefined answers
        answerKey = {
          note: 'Vocabulary definitions will vary. Check for accuracy and completeness.'
        };
        break;
        
      case worksheetGenerator.WORKSHEET_TYPES.MATCHING:
        // For matching, provide the correct pairs
        answerKey = {
          pairs: worksheetContent.content.leftItems.map((item, index) => ({
            left: item,
            right: worksheetContent.content.rightItems[index]
          }))
        };
        break;
        
      case worksheetGenerator.WORKSHEET_TYPES.FILL_IN_BLANK:
        // For fill in the blank, provide the words for each blank
        answerKey = {
          answers: worksheetContent.content.sentences.map((sentence, index) => ({
            sentence,
            answer: worksheetContent.content.wordBank[index % worksheetContent.content.wordBank.length]
          }))
        };
        break;
        
      case worksheetGenerator.WORKSHEET_TYPES.MULTIPLE_CHOICE:
        // For multiple choice, provide the correct options
        answerKey = {
          answers: worksheetContent.content.questions.map(q => ({
            question: q.question,
            correctOption: q.options[q.answer],
            correctIndex: q.answer
          }))
        };
        break;
        
      case worksheetGenerator.WORKSHEET_TYPES.SHORT_ANSWER:
        // For short answer, provide sample answers
        answerKey = {
          sampleAnswers: worksheetContent.content.questions.map((question, index) => ({
            question,
            sampleAnswer: worksheetContent.content.sampleAnswers[index]
          }))
        };
        break;
        
      case worksheetGenerator.WORKSHEET_TYPES.SEQUENCING:
        // For sequencing, provide the correct order
        answerKey = {
          correctOrder: worksheetContent.content.correctOrder.map((order, index) => ({
            position: order,
            event: worksheetContent.content.events[index]
          }))
        };
        break;
        
      case worksheetGenerator.WORKSHEET_TYPES.MATH_PRACTICE:
        // For math practice, provide the solutions
        answerKey = {
          solutions: worksheetContent.content.problems.map((problem, index) => ({
            problem,
            solution: worksheetContent.content.solutions[index]
          }))
        };
        break;
        
      default:
        answerKey = {
          note: 'Answer key not available for this worksheet type.'
        };
    }
    
    res.status(200).json({
      success: true,
      answerKey
    });
  } catch (error) {
    console.error('Error in generateAnswerKey:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating answer key'
    });
  }
};

/**
 * Fetch content from a resource URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const fetchResourceContent = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }
    
    // Skip processing for YouTube URLs (they require special handling)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return res.status(200).json({
        success: true,
        contentText: 'YouTube video content - please provide worksheet information manually.',
        source: 'YouTube'
      });
    }
    
    // Launch browser
    const browser = await chromium.launch();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
    });
    
    const page = await context.newPage();
    
    try {
      // Navigate to URL with timeout
      await page.goto(url, { timeout: 15000, waitUntil: 'domcontentloaded' });
      // Wait a bit for dynamic content
      await page.waitForTimeout(2000);
      
      // Extract content
      const content = await page.evaluate(() => {
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
        
        // Extract headings
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
        
        // Combine all content with reasonable formatting
        let combinedContent = extractedContent.join('\\n\\n');
        
        // Limit size but not too small for educational content
        return combinedContent.slice(0, 15000);
      });
      
      // Process the content to make it more usable
      const processedContent = processExtractedContent(content);
      
      await browser.close();
      
      res.status(200).json({
        success: true,
        contentText: processedContent,
        source: new URL(url).hostname
      });
    } catch (error) {
      console.error(`Error fetching content from ${url}:`, error);
      await browser.close();
      
      res.status(500).json({
        success: false,
        message: `Could not fetch content from URL: ${error.message}`
      });
    }
  } catch (error) {
    console.error('Error in fetchResourceContent:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resource content'
    });
  }
};

/**
 * Process and clean the extracted content
 * @param {string} content - Raw extracted content
 * @returns {string} - Processed content
 */
const processExtractedContent = (content) => {
  if (!content) {
    return "";
  }
  
  // Remove excessive whitespace
  content = content.replace(/\n{3,}/g, '\n\n');
  
  // Try to detect and mark sections in the content
  const sectionPatterns = [
    { pattern: /(Introduction|Overview|Summary):/, replacement: '\n\n===\$1===\n\n' },
    { pattern: /(Steps|Instructions|Procedure):/, replacement: '\n\n===\$1===\n\n' },
    { pattern: /(Materials|Supplies|Resources):/, replacement: '\n\n===\$1===\n\n' },
    { pattern: /(Conclusion|Results|Outcome):/, replacement: '\n\n===\$1===\n\n' },
    { pattern: /(Assessment|Evaluation|Quiz):/, replacement: '\n\n===\$1===\n\n' }
  ];
  
  for (const { pattern, replacement } of sectionPatterns) {
    content = content.replace(new RegExp(pattern, 'gi'), replacement);
  }
  
  // Standardize list formatting
  content = content.replace(/(?<=\n)[-•*](?=\s)/g, '-');
  
  // Make headings stand out
  content = content.replace(/Heading:\s*([^\n]+)/g, '=== \$1 ===');
  
  // Truncate to a reasonable length if needed
  if (content.length > 20000) {
    content = content.substring(0, 20000) + "...[content truncated]";
  }
  
  return content;
}
