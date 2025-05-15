/**
 * Worksheet Generator Service
 * 
 * This service provides functions to generate printable worksheets from lesson resources.
 * It creates age-appropriate activities based on the content of web resources.
 */

// Worksheet types
const WORKSHEET_TYPES = {
  VOCABULARY: 'vocabulary',
  MATCHING: 'matching',
  FILL_IN_BLANK: 'fill-in-blank',
  MULTIPLE_CHOICE: 'multiple-choice',
  SHORT_ANSWER: 'short-answer',
  DRAWING: 'drawing',
  LABELING: 'labeling',
  SEQUENCING: 'sequencing',
  MATH_PRACTICE: 'math-practice',
};

/**
 * Extract vocabulary words (nouns) from content text
 * @param {string} contentText - The content text to extract vocabulary from
 * @param {number} limit - Maximum number of vocabulary words to extract
 * @returns {Array} - Array of vocabulary words
 */
const extractVocabulary = (contentText, limit = 10) => {
  if (!contentText) return [];
  
  // Split text into words
  const words = contentText.split(/\s+/);
  
  // Filter to likely nouns (somewhat naive approach, could be improved with NLP)
  const possibleNouns = words
    .filter(word => {
      // Clean the word of punctuation
      const cleaned = word.replace(/[^\w\s']/g, '').trim();
      
      // Skip empty strings, short words, and common non-nouns
      if (!cleaned || cleaned.length < 4) return false;
      
      // Check for capitalization (proper nouns) or typical noun endings
      const isPossibleNoun = 
        (cleaned.charAt(0) === cleaned.charAt(0).toUpperCase()) ||
        cleaned.endsWith('tion') || 
        cleaned.endsWith('ness') || 
        cleaned.endsWith('ity') ||
        cleaned.endsWith('ment') ||
        cleaned.endsWith('ology') ||
        cleaned.endsWith('ics');
        
      return isPossibleNoun;
    })
    .map(word => word.replace(/[^\w\s']/g, '').trim());
  
  // Remove duplicates and limit to requested number
  const uniqueNouns = [...new Set(possibleNouns)];
  return uniqueNouns.slice(0, limit);
};

/**
 * Extract meaningful sentences from content text
 * @param {string} contentText - The content text to extract sentences from
 * @param {number} count - Number of sentences to extract
 * @returns {Array} - Array of sentences
 */
const extractSentences = (contentText, count = 5) => {
  if (!contentText) return [];
  
  // Split text into sentences (basic splitting)
  const sentences = contentText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 150); // Filter for reasonable length sentences
  
  // If we have fewer sentences than requested, return what we have
  if (sentences.length <= count) {
    return sentences.map(s => s.trim() + '.');
  }
  
  // Otherwise, select evenly distributed sentences
  const step = Math.floor(sentences.length / count);
  const result = [];
  
  for (let i = 0; i < count; i++) {
    const index = Math.min(i * step, sentences.length - 1);
    result.push(sentences[index].trim() + '.');
  }
  
  return result;
};

/**
 * Extract a list of topics from content text
 * @param {string} contentText - The content text to extract topics from
 * @param {number} count - Maximum number of topics to extract
 * @returns {Array} - Array of topic strings
 */
const extractTopicsList = (contentText, count = 5) => {
  if (!contentText) return [];
  
  // Look for HTML list items
  let listItems = [];
  const listItemRegex = /<li[^>]*>(.*?)<\/li>/g;
  let match;
  
  while ((match = listItemRegex.exec(contentText)) !== null && listItems.length < count) {
    // Skip if too short or just a number
    if (match[1] && match[1].trim().length > 5 && !/^\d+$/.test(match[1].trim())) {
      // Remove HTML tags from the content
      const plainText = match[1].replace(/<[^>]*>/g, '').trim();
      listItems.push(plainText);
    }
  }
  
  // If we didn't find enough list items, look for headings or text sections
  if (listItems.length < count) {
    // Try to find headings
    const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/g;
    
    while ((match = headingRegex.exec(contentText)) !== null && listItems.length < count) {
      if (match[1] && match[1].trim().length > 3) {
        const plainText = match[1].replace(/<[^>]*>/g, '').trim();
        listItems.push(plainText);
      }
    }
    
    // If still not enough, look for paragraphs and extract the first line
    if (listItems.length < count) {
      const paragraphs = contentText.split(/\n+/);
      
      for (let i = 0; i < paragraphs.length && listItems.length < count; i++) {
        const paragraph = paragraphs[i].trim();
        if (paragraph.length > 10 && paragraph.length < 100) {
          // Extract first sentence or whole paragraph if it's short enough
          const firstSentence = paragraph.split(/[.!?]/)[0].trim();
          if (firstSentence.length > 10) {
            listItems.push(firstSentence + '.');
          }
        }
      }
    }
  }
  
  return listItems.slice(0, count);
};

/**
 * Determine appropriate worksheet types based on subject and grade
 * @param {string} subject - The subject of the lesson
 * @param {string} grade - The grade level
 * @returns {Array} - Array of appropriate worksheet types
 */
const getWorksheetTypesBySubject = (subject, grade) => {
  const subjectLower = subject.toLowerCase();
  const gradeLevel = parseGradeLevel(grade);
  
  // Early elementary (K-2)
  if (gradeLevel <= 2) {
    if (subjectLower.includes('math')) {
      return [WORKSHEET_TYPES.MATCHING, WORKSHEET_TYPES.DRAWING, WORKSHEET_TYPES.MATH_PRACTICE];
    } else if (subjectLower.includes('science')) {
      return [WORKSHEET_TYPES.LABELING, WORKSHEET_TYPES.DRAWING, WORKSHEET_TYPES.MATCHING];
    } else if (subjectLower.includes('reading') || subjectLower.includes('language')) {
      return [WORKSHEET_TYPES.MATCHING, WORKSHEET_TYPES.FILL_IN_BLANK, WORKSHEET_TYPES.DRAWING];
    } else {
      return [WORKSHEET_TYPES.DRAWING, WORKSHEET_TYPES.MATCHING, WORKSHEET_TYPES.LABELING];
    }
  }
  
  // Upper elementary (3-5)
  else if (gradeLevel <= 5) {
    if (subjectLower.includes('math')) {
      return [WORKSHEET_TYPES.MATH_PRACTICE, WORKSHEET_TYPES.MULTIPLE_CHOICE, WORKSHEET_TYPES.FILL_IN_BLANK];
    } else if (subjectLower.includes('science')) {
      return [WORKSHEET_TYPES.LABELING, WORKSHEET_TYPES.SEQUENCING, WORKSHEET_TYPES.SHORT_ANSWER];
    } else if (subjectLower.includes('reading') || subjectLower.includes('language')) {
      return [WORKSHEET_TYPES.VOCABULARY, WORKSHEET_TYPES.FILL_IN_BLANK, WORKSHEET_TYPES.SHORT_ANSWER];
    } else {
      return [WORKSHEET_TYPES.MULTIPLE_CHOICE, WORKSHEET_TYPES.SHORT_ANSWER, WORKSHEET_TYPES.SEQUENCING];
    }
  }
  
  // Middle school and up (6+)
  else {
    if (subjectLower.includes('math')) {
      return [WORKSHEET_TYPES.MATH_PRACTICE, WORKSHEET_TYPES.SHORT_ANSWER, WORKSHEET_TYPES.MULTIPLE_CHOICE];
    } else if (subjectLower.includes('science')) {
      return [WORKSHEET_TYPES.LABELING, WORKSHEET_TYPES.SHORT_ANSWER, WORKSHEET_TYPES.SEQUENCING];
    } else if (subjectLower.includes('reading') || subjectLower.includes('language')) {
      return [WORKSHEET_TYPES.VOCABULARY, WORKSHEET_TYPES.SHORT_ANSWER, WORKSHEET_TYPES.FILL_IN_BLANK];
    } else {
      return [WORKSHEET_TYPES.SHORT_ANSWER, WORKSHEET_TYPES.MULTIPLE_CHOICE, WORKSHEET_TYPES.SEQUENCING];
    }
  }
};

/**
 * Parse grade level to a number
 * @param {string} grade - Grade level string (e.g., "3rd Grade", "Kindergarten")
 * @returns {number} - Numeric grade level (K=0)
 */
const parseGradeLevel = (grade) => {
  const gradeLower = grade.toLowerCase();
  
  if (gradeLower.includes('kindergarten') || gradeLower.includes('k-')) {
    return 0;
  }
  
  const gradeMatch = gradeLower.match(/(\d+)(st|nd|rd|th)?/);
  if (gradeMatch && gradeMatch[1]) {
    return parseInt(gradeMatch[1], 10);
  }
  
  // Default to middle elementary if we can't determine
  return 3;
};

/**
 * Generate worksheet content based on resource and type
 * @param {Object} resource - The resource object
 * @param {string} childName - Child's name
 * @param {string} grade - Grade level
 * @param {string} worksheetType - Type of worksheet to generate
 * @returns {Object} - Worksheet content object
 */
const generateWorksheetContent = (resource, childName, grade, worksheetType) => {
  const title = `${resource.title} - Activity Worksheet`;
  const date = new Date().toLocaleDateString();
  const instructions = getWorksheetInstructions(resource, worksheetType);
  
  // Generate content based on worksheet type
  let content = {};
  
  switch (worksheetType) {
    case WORKSHEET_TYPES.VOCABULARY:
      content = generateVocabularyContent(resource);
      break;
    case WORKSHEET_TYPES.MATCHING:
      content = generateMatchingContent(resource);
      break;
    case WORKSHEET_TYPES.FILL_IN_BLANK:
      content = generateFillInBlankContent(resource);
      break;
    case WORKSHEET_TYPES.MULTIPLE_CHOICE:
      content = generateMultipleChoiceContent(resource);
      break;
    case WORKSHEET_TYPES.SHORT_ANSWER:
      content = generateShortAnswerContent(resource);
      break;
    case WORKSHEET_TYPES.DRAWING:
      content = generateDrawingContent(resource);
      break;
    case WORKSHEET_TYPES.LABELING:
      content = generateLabelingContent(resource);
      break;
    case WORKSHEET_TYPES.SEQUENCING:
      content = generateSequencingContent(resource);
      break;
    case WORKSHEET_TYPES.MATH_PRACTICE:
      content = generateMathContent(resource);
      break;
    default:
      content = { items: ['Complete the activities below.'] };
      break;
  }
  
  return {
    title,
    childName,
    grade,
    date,
    instructions,
    type: worksheetType,
    content,
    source: resource.source || 'Educational Resource'
  };
};

/**
 * Get appropriate instructions based on worksheet type
 */
const getWorksheetInstructions = (resource, worksheetType) => {
  switch (worksheetType) {
    case WORKSHEET_TYPES.VOCABULARY:
      return 'Define each vocabulary word and use it in a sentence.';
    case WORKSHEET_TYPES.MATCHING:
      return 'Draw a line to match each item in the left column with its correct match in the right column.';
    case WORKSHEET_TYPES.FILL_IN_BLANK:
      return 'Fill in each blank with the correct word from the word bank.';
    case WORKSHEET_TYPES.MULTIPLE_CHOICE:
      return 'Circle the letter of the best answer for each question.';
    case WORKSHEET_TYPES.SHORT_ANSWER:
      return 'Answer each question with complete sentences.';
    case WORKSHEET_TYPES.DRAWING:
      return 'Draw a picture based on the instructions for each section.';
    case WORKSHEET_TYPES.LABELING:
      return 'Label each part of the diagram using the words provided.';
    case WORKSHEET_TYPES.SEQUENCING:
      return 'Number the events in the correct order.';
    case WORKSHEET_TYPES.MATH_PRACTICE:
      return 'Solve each math problem. Show your work.';
    default:
      return 'Complete the activities on this worksheet.';
  }
};

// Helper functions for different worksheet types
// These would be expanded with more sophisticated content generation in a real implementation

/**
 * Generate vocabulary content
 * @param {Object} resource - The resource object
 * @returns {Object} - Vocabulary content object
 */
const generateVocabularyContent = (resource) => {
  // Extract vocabulary from resource contentText if available
  let words = ['Term 1', 'Term 2', 'Term 3', 'Term 4', 'Term 5'];
  
  if (resource.contentText) {
    const extractedWords = extractVocabulary(resource.contentText, 8);
    if (extractedWords.length > 0) {
      words = extractedWords;
    }
  }
  
  // Extract sentences to use for examples
  let examples = [];
  if (resource.contentText) {
    examples = extractSentences(resource.contentText, words.length * 2);
  }
  
  // Add definitions and example sentences for each word
  const items = words.map((word, index) => {
    // Try to find a sentence that contains the word for the example
    let exampleSentence = "";
    if (examples.length > 0) {
      const matchingSentence = examples.find(s => 
        s.toLowerCase().includes(word.toLowerCase())
      );
      exampleSentence = matchingSentence || examples[index % examples.length];
    } else {
      exampleSentence = `This is an example sentence using the word "${word}".`;
    }
    
    // Create a definition using related terms and context
    let definition = "";
    if (resource.subject) {
      switch (resource.subject.toLowerCase()) {
        case 'math':
        case 'mathematics':
          definition = `A mathematical term related to ${resource.title || "this topic"}.`;
          break;
        case 'science':
          definition = `A scientific concept that relates to ${resource.title || "natural phenomena"}.`;
          break;
        case 'history':
        case 'social studies':
          definition = `A historical term referring to ${resource.title || "past events or conditions"}.`;
          break;
        case 'english':
        case 'language arts':
          definition = `A literary term or concept used in language studies.`;
          break;
        default:
          definition = `An important term related to ${resource.title || "this subject"}.`;
      }
    } else {
      definition = `An important term or concept related to this topic.`;
    }
    
    return {
      word,
      definition,
      exampleSentence
    };
  });
  
  return { 
    words,
    items,
    wordBank: words,
    solutions: items.map(item => ({
      word: item.word,
      definition: item.definition
    }))
  };
};

/**
 * Generate matching content
 * @param {Object} resource - The resource object
 * @returns {Object} - Matching content object
 */
const generateMatchingContent = (resource) => {
  // Default items
  let leftItems = ['Item A', 'Item B', 'Item C', 'Item D', 'Item E'];
  let rightItems = ['Description 1', 'Description 2', 'Description 3', 'Description 4', 'Description 5'];
  
  // Try to extract meaningful content
  if (resource.contentText) {
    const vocabulary = extractVocabulary(resource.contentText, 5);
    const sentences = extractSentences(resource.contentText, 5);
    
    if (vocabulary.length >= 5) {
      leftItems = vocabulary.slice(0, 5);
    }
    
    if (sentences.length >= 5) {
      // Extract short phrases from sentences
      rightItems = sentences.map(sentence => {
        const words = sentence.split(' ');
        return words.slice(0, Math.min(4, words.length)).join(' ') + '...';
      });
    }
  }
  
  // Create solution mappings
  const solutions = leftItems.map((item, index) => ({
    leftItem: item,
    rightItem: rightItems[index % rightItems.length]
  }));
  
  // Create pairs for display
  const pairs = leftItems.map((item, index) => ({
    left: item,
    right: rightItems[index % rightItems.length]
  }));
  
  return {
    leftItems,
    rightItems,
    pairs,
    solutions
  };
};

/**
 * Generate fill in the blank content
 * @param {Object} resource - The resource object
 * @returns {Object} - Fill in the blank content object
 */
const generateFillInBlankContent = (resource) => {
  // Default content
  let wordBank = ['word1', 'word2', 'word3', 'word4', 'word5'];
  let sentences = [
    'The ____________ is an important part of this lesson.',
    'We learned about ____________ in our class today.',
    'A ____________ is used to measure this property.',
    'The process of ____________ helps us understand the concept.',
    'Scientists use ____________ to explain this phenomenon.'
  ];
  
  // Original sentences without blanks (for solutions)
  let originalSentences = [
    'The word1 is an important part of this lesson.',
    'We learned about word2 in our class today.',
    'A word3 is used to measure this property.',
    'The process of word4 helps us understand the concept.',
    'Scientists use word5 to explain this phenomenon.'
  ];
  
  // Extract content from resource if available
  if (resource.contentText) {
    const vocabulary = extractVocabulary(resource.contentText, 5);
    const extractedSentences = extractSentences(resource.contentText, 5);
    
    if (vocabulary.length > 0) {
      wordBank = vocabulary;
    }
    
    if (extractedSentences.length > 0) {
      // Replace a key word in each sentence with a blank
      originalSentences = [...extractedSentences];
      sentences = extractedSentences.map((sentence, index) => {
        const word = wordBank[index % wordBank.length];
        if (sentence.toLowerCase().includes(word.toLowerCase())) {
          return sentence.replace(new RegExp(word, 'i'), '____________');
        } else {
          // If the sentence doesn't contain the word, just insert a blank at a reasonable position
          const words = sentence.split(' ');
          const blankIndex = Math.floor(words.length / 2);
          words[blankIndex] = '____________';
          return words.join(' ');
        }
      });
    }
  }
  
  // Create items with solutions
  const items = sentences.map((sentence, index) => ({
    sentence,
    answer: wordBank[index % wordBank.length],
    originalSentence: originalSentences[index]
  }));
  
  // Create solution mappings
  const solutions = items.map(item => ({
    sentence: item.sentence,
    answer: item.answer,
    completeSentence: item.originalSentence
  }));
  
  return {
    wordBank,
    sentences,
    items,
    solutions
  };
};

/**
 * Generate multiple choice content
 * @param {Object} resource - The resource object
 * @returns {Object} - Multiple choice content object
 */
const generateMultipleChoiceContent = (resource) => {
  // Default content
  let questions = [
    {
      question: 'Question 1?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      answer: 0
    },
    {
      question: 'Question 2?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      answer: 1
    },
    {
      question: 'Question 3?',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      answer: 2
    }
  ];
  
  // Extract content if available
  if (resource.contentText) {
    const sentences = extractSentences(resource.contentText, 5);
    const vocabulary = extractVocabulary(resource.contentText, 12);
    
    if (sentences.length >= 3 && vocabulary.length >= 12) {
      questions = sentences.slice(0, 3).map((sentence, idx) => {
        // Convert sentence to question
        let question = sentence;
        if (!question.endsWith('?')) {
          question = `What is true about the following: ${sentence}`;
        }
        
        // Create options, with one being the correct answer
        const correctAnswer = vocabulary[idx * 4];
        const options = [
          correctAnswer,
          vocabulary[idx * 4 + 1],
          vocabulary[idx * 4 + 2],
          vocabulary[idx * 4 + 3]
        ];
        
        return {
          question,
          options,
          answer: 0 // First option is the correct one
        };
      });
    }
  }
  
  // Create solutions structure for easier frontend rendering
  const items = questions.map(q => ({
    question: q.question,
    options: q.options.map((option, index) => ({
      text: option,
      letter: String.fromCharCode(65 + index), // Convert to A, B, C, D
      isCorrect: index === q.answer
    })),
    correctAnswerIndex: q.answer,
    correctAnswer: q.options[q.answer]
  }));
  
  const solutions = questions.map(q => ({
    question: q.question,
    correctOption: q.options[q.answer],
    correctLetter: String.fromCharCode(65 + q.answer), // A, B, C, D
    explanation: `The correct answer is ${String.fromCharCode(65 + q.answer)}: ${q.options[q.answer]}`
  }));
  
  return { 
    questions,
    items,
    solutions
  };
};

/**
 * Generate short answer content
 * @param {Object} resource - The resource object
 * @returns {Object} - Short answer content object
 */
const generateShortAnswerContent = (resource) => {
  // Default content
  let questions = [
    'Question 1?',
    'Question 2?',
    'Question 3?',
    'Question 4?'
  ];
  
  let sampleAnswers = [
    'Sample answer 1 for answer key.',
    'Sample answer 2 for answer key.',
    'Sample answer 3 for answer key.',
    'Sample answer 4 for answer key.'
  ];
  
  // Extract content if available
  if (resource.contentText) {
    const sentences = extractSentences(resource.contentText, 12);
    const vocabulary = extractVocabulary(resource.contentText, 8);
    
    if (sentences.length >= 8) {
      // Use first half as questions
      const potentialQuestions = sentences.slice(0, 6);
      
      // Convert statements to questions
      questions = potentialQuestions.slice(0, 4).map((sentence, index) => {
        // If already a question, use it
        if (sentence.endsWith('?')) {
          return sentence;
        }
        
        // Otherwise, transform sentence to question based on content
        const words = sentence.split(' ');
        const key = vocabulary[index % vocabulary.length] || '';
        
        if (sentence.toLowerCase().includes(key.toLowerCase()) && key.length > 3) {
          // Create a question about the key term
          return `What is the significance of ${key} in the context of ${resource.title || 'this topic'}?`;
        } else if (words.length > 8) {
          // Create questions based on the sentence structure
          if (sentence.toLowerCase().includes('because') || sentence.toLowerCase().includes('since')) {
            return `Why ${words[0].toLowerCase()} ${words.slice(1, 4).join(' ')}?`;
          } else if (sentence.toLowerCase().includes('is') || sentence.toLowerCase().includes('are')) {
            return `What ${words.slice(0, 3).join(' ')} and why is it important?`;
          } else {
            return `How would you explain the concept that ${words.slice(0, 6).join(' ')}...?`;
          }
        } else {
          // Generic question about the topic
          return `What is the main idea expressed in: "${sentence}"?`;
        }
      });
      
      // Use second half as sample answers
      sampleAnswers = sentences.slice(6, 10).map((sentence, index) => {
        // Format the answer to match the question
        const questionType = questions[index % questions.length];
        if (questionType.startsWith('Why')) {
          return `This happens because ${sentence.toLowerCase()}`;
        } else if (questionType.startsWith('How')) {
          return `You can explain this by understanding that ${sentence.toLowerCase()}`;
        } else if (questionType.startsWith('What is the main idea')) {
          return `The main idea is that ${sentence.toLowerCase()}`;
        } else {
          return sentence;
        }
      });
    }
  }
  
  // Create structured items and solutions for the frontend
  const items = questions.map((question, index) => ({
    question,
    questionNumber: index + 1,
    responseLines: 3
  }));
  
  // Extract key points from content for the answer key
  let keyPoints = [];
  if (resource.contentText) {
    const topics = extractTopicsList(resource.contentText, 8);
    keyPoints = topics.map(topic => `Consider how ${topic} relates to the question.`);
  }
  
  // If we couldn't extract key points, generate them based on the sample answers
  if (keyPoints.length === 0) {
    keyPoints = sampleAnswers.map(answer => {
      const words = answer.split(' ');
      if (words.length > 5) {
        return `Key point: ${words.slice(0, 5).join(' ')}...`;
      }
      return `Key point related to the answer.`;
    });
  }
  
  const solutions = questions.map((question, index) => ({
    question,
    modelAnswer: sampleAnswers[index % sampleAnswers.length],
    keyPoints: [
      keyPoints[index * 2 % keyPoints.length], 
      keyPoints[(index * 2 + 1) % keyPoints.length]
    ]
  }));
  
  return {
    questions,
    sampleAnswers,
    items,
    solutions
  };
};

/**
 * Generate drawing content
 * @param {Object} resource - The resource object
 * @returns {Object} - Drawing content object
 */
const generateDrawingContent = (resource) => {
  // Extract topic and context from the resource
  let mainTopic = "what you learned from this lesson";
  let contextDetails = "";
  let subTopics = [];
  
  if (resource.title) {
    mainTopic = resource.title;
  }
  
  if (resource.contentText) {
    // Extract main sentences to establish context
    const sentences = extractSentences(resource.contentText, 3);
    if (sentences.length > 0) {
      const firstSentence = sentences[0];
      contextDetails = firstSentence.length > 60 
        ? firstSentence.substring(0, 60) + "..." 
        : firstSentence;
      
      // Extract additional topics for sub-prompts
      const topics = extractTopicsList(resource.contentText, 4);
      if (topics.length > 0) {
        subTopics = topics;
      } else {
        const vocabulary = extractVocabulary(resource.contentText, 4);
        if (vocabulary.length > 0) {
          subTopics = vocabulary.map(word => `the ${word}`);
        }
      }
    }
  }
  
  // Customize drawing prompt based on subject
  let drawingPrompt = `Draw a picture of ${mainTopic}`;
  let secondaryPrompt = "Label the key parts of your drawing";
  
  if (resource.subject) {
    const subject = resource.subject.toLowerCase();
    
    if (subject.includes('science') || subject.includes('biology')) {
      drawingPrompt = `Draw a labeled diagram of ${mainTopic}`;
      secondaryPrompt = "Include the important parts and label them";
    } else if (subject.includes('history') || subject.includes('social studies')) {
      drawingPrompt = `Illustrate an important event from ${mainTopic}`;
      secondaryPrompt = "Include key people, dates, or symbols";
    } else if (subject.includes('math')) {
      drawingPrompt = `Create a visual representation of ${mainTopic}`;
      secondaryPrompt = "Show your understanding through shapes and symbols";
    } else if (subject.includes('language') || subject.includes('english')) {
      drawingPrompt = `Create a scene that relates to ${mainTopic}`;
      secondaryPrompt = "Illustrate the main concepts or characters";
    }
  }
  
  // Add context details if available
  if (contextDetails) {
    drawingPrompt += `: "${contextDetails}"`;
  }
  
  // Create specific subtasks for the drawing
  const items = [
    {
      prompt: drawingPrompt,
      drawingAreaHeight: 300,
      drawingAreaWidth: 400
    }
  ];
  
  // Add secondary prompts using subtopics if available
  if (subTopics.length > 0) {
    items.push({
      prompt: `Add ${subTopics[0]} to your drawing`,
      drawingAreaHeight: 150,
      drawingAreaWidth: 400
    });
    
    if (subTopics.length > 1) {
      items.push({
        prompt: secondaryPrompt,
        drawingAreaHeight: 150,
        drawingAreaWidth: 400
      });
    }
  } else {
    items.push({
      prompt: secondaryPrompt,
      drawingAreaHeight: 200,
      drawingAreaWidth: 400
    });
  }
  
  // Create tailored suggestions based on content
  let suggestions = [
    'Include at least 3 key elements from the lesson',
    'Label the important parts of your drawing',
    'Use colors to show different aspects'
  ];
  
  if (subTopics.length > 1) {
    suggestions = [
      `Include ${subTopics[0]} and ${subTopics[1]} in your drawing`,
      `Show the relationship between different elements`,
      `Use color to highlight important parts`
    ];
  }
  
  // Create specific evaluation criteria
  const evaluationCriteria = [
    `Accurate representation of ${mainTopic}`,
    'Clear labels on important parts',
    'Creative use of space and color',
    'Inclusion of key details from the lesson'
  ];
  
  return {
    prompt: drawingPrompt,
    suggestions,
    items,
    evaluationCriteria
  };
};

/**
 * Generate labeling content
 * @param {Object} resource - The resource object
 * @returns {Object} - Labeling content object
 */
const generateLabelingContent = (resource) => {
  // Default content
  let labels = ['label1', 'label2', 'label3', 'label4', 'label5'];
  let diagramTitle = 'Lesson Diagram';
  let diagramDescription = 'A diagram related to the lesson topic';
  
  // Extract content if available
  if (resource.contentText) {
    // Try to extract proper nouns or technical terms
    const topics = extractTopicsList(resource.contentText, 5);
    if (topics.length > 0) {
      labels = topics.map(topic => {
        // Use first 2-3 words of the topic for more concise labels
        const words = topic.split(' ');
        return words.length > 3 ? words.slice(0, 2).join(' ') : topic;
      });
    } else {
      // Fall back to vocabulary if no topics found
      const vocabulary = extractVocabulary(resource.contentText, 5);
      if (vocabulary.length > 0) {
        labels = vocabulary;
      }
    }
    
    // Extract sentences for descriptions
    const sentences = extractSentences(resource.contentText, 5);
    if (sentences.length > 0) {
      diagramDescription = sentences[0];
    }
  }
  
  // Set a more specific diagram title based on the resource
  if (resource.title) {
    diagramTitle = `${resource.title} Diagram`;
  } else if (resource.subject) {
    diagramTitle = `${resource.subject} Diagram`;
  }
  
  // Create appropriate diagram layout based on subject
  let diagramType = 'generic';
  let diagramPoints = [];
  
  if (resource.subject) {
    const subject = resource.subject.toLowerCase();
    
    // Determine diagram type based on subject
    if (subject.includes('science') || subject.includes('biology')) {
      diagramType = 'organism';
    } else if (subject.includes('geography') || subject.includes('map')) {
      diagramType = 'map';
    } else if (subject.includes('math') || subject.includes('geometry')) {
      diagramType = 'shape';
    } else if (subject.includes('anatomy') || subject.includes('body')) {
      diagramType = 'body';
    }
  }
  
  // Create diagram points based on diagram type
  switch (diagramType) {
    case 'organism':
      // Create a layout like parts of an organism
      diagramPoints = labels.map((label, index) => {
        // Position in a vaguely oval pattern
        const angle = (index / labels.length) * 2 * Math.PI;
        const distance = 80;
        const x = 150 + Math.cos(angle) * distance;
        const y = 150 + Math.sin(angle) * distance * 0.7;
        
        return {
          id: `point-${index + 1}`,
          x,
          y,
          label
        };
      });
      break;
      
    case 'map':
      // Create a layout like a map
      diagramPoints = labels.map((label, index) => {
        // Spread across the diagram area in a grid-like pattern
        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = 70 + col * 100;
        const y = 70 + row * 100;
        
        return {
          id: `point-${index + 1}`,
          x,
          y,
          label
        };
      });
      break;
      
    case 'shape':
      // Create a layout like a geometric shape
      diagramPoints = labels.map((label, index) => {
        // Position in a pentagon or other shape
        const angle = (index / labels.length) * 2 * Math.PI - Math.PI/2;
        const x = 150 + Math.cos(angle) * 100;
        const y = 150 + Math.sin(angle) * 100;
        
        return {
          id: `point-${index + 1}`,
          x,
          y,
          label
        };
      });
      break;
      
    case 'body':
      // Create a layout like parts of the body
      diagramPoints = labels.map((label, index) => {
        let x, y;
        
        // Position based on common body parts locations
        if (index === 0) {
          x = 150; y = 50; // head
        } else if (index === 1) {
          x = 150; y = 100; // chest
        } else if (index === 2) {
          x = 150; y = 150; // abdomen
        } else if (index === 3) {
          x = 100; y = 130; // left arm/side
        } else if (index === 4) {
          x = 200; y = 130; // right arm/side
        } else {
          x = 150; y = 200 + (index - 5) * 30; // lower parts
        }
        
        return {
          id: `point-${index + 1}`,
          x,
          y,
          label
        };
      });
      break;
      
    default:
      // Generic spread layout
      diagramPoints = labels.map((label, index) => {
        // Distribute in a pseudo-random but fixed pattern
        const x = 80 + (index % 3) * 70 + (index * 13) % 30;
        const y = 80 + Math.floor(index / 3) * 70 + (index * 7) % 20;
        
        return {
          id: `point-${index + 1}`,
          x,
          y,
          label
        };
      });
  }
  
  // Create meaningful descriptions for the solution
  const descriptions = [];
  if (resource.contentText) {
    const sentences = extractSentences(resource.contentText, labels.length * 2);
    
    // Match sentences with labels
    labels.forEach((label, index) => {
      // Find a sentence that contains this label
      const matchingSentence = sentences.find(s => 
        s.toLowerCase().includes(label.toLowerCase())
      );
      
      if (matchingSentence) {
        descriptions.push(matchingSentence);
      } else if (sentences[index]) {
        descriptions.push(sentences[index]);
      } else {
        descriptions.push(`This identifies the ${label} in the diagram.`);
      }
    });
  } else {
    // Default descriptions
    labels.forEach(label => {
      descriptions.push(`This identifies the ${label} in the diagram.`);
    });
  }
  
  // Create solutions
  const solutions = labels.map((label, index) => ({
    pointId: `point-${index + 1}`,
    correctLabel: label,
    description: descriptions[index % descriptions.length]
  }));
  
  return {
    labels,
    diagramTitle,
    diagramDescription,
    diagramPoints,
    solutions,
    items: diagramPoints
  };
};

/**
 * Generate sequencing content
 * @param {Object} resource - The resource object
 * @returns {Object} - Sequencing content object
 */
const generateSequencingContent = (resource) => {
  // Default content
  let events = [
    'Event description 1',
    'Event description 2',
    'Event description 3',
    'Event description 4',
    'Event description 5'
  ];
  
  // Extract content if available
  if (resource.contentText) {
    // Look for sequences in the content
    const processIndicators = [
      'first', 'second', 'third', 'fourth', 'fifth', 'then', 'next', 'finally', 'lastly', 
      'step 1', 'step 2', 'step 3', 'step 4', 'step 5',
      'begin', 'start', 'initially', 'after', 'before', 'following', 'subsequently'
    ];
    
    // Find sentences with sequence indicators
    const allSentences = extractSentences(resource.contentText, 20);
    const sequenceSentences = allSentences.filter(sentence => 
      processIndicators.some(indicator => 
        sentence.toLowerCase().includes(indicator)
      )
    );
    
    if (sequenceSentences.length >= 5) {
      // We found sequence-related sentences
      events = sequenceSentences.slice(0, 5);
    } else {
      // Fall back to regular sentences
      const sentences = extractSentences(resource.contentText, 5);
      if (sentences.length > 0) {
        events = sentences;
      } else {
        // Try topics as a last resort
        const topics = extractTopicsList(resource.contentText, 5);
        if (topics.length > 0) {
          events = topics;
        }
      }
    }
  }
  
  // Create a logical sequence based on event content
  // Rather than random ordering, try to detect natural sequence if possible
  let correctOrder = [1, 2, 3, 4, 5]; // Default sequential order
  
  // Check if events already have sequence indicators
  const hasSequenceIndicators = events.some((event, index) => {
    const lowerEvent = event.toLowerCase();
    return (
      lowerEvent.includes(`step ${index + 1}`) ||
      lowerEvent.includes(`first`) && index === 0 ||
      lowerEvent.includes(`second`) && index === 1 ||
      lowerEvent.includes(`third`) && index === 2 ||
      lowerEvent.includes(`fourth`) && index === 3 ||
      lowerEvent.includes(`fifth`) && index === 4 ||
      lowerEvent.includes(`finally`) && index === events.length - 1 ||
      lowerEvent.includes(`lastly`) && index === events.length - 1
    );
  });
  
  // If the events don't have natural sequence indicators,
  // generate a meaningful sequence order
  if (!hasSequenceIndicators) {
    // Check for temporal words that suggest an order
    const beforeAfterCount = events.map(event => {
      const lowerEvent = event.toLowerCase();
      let score = 0;
      
      // Words suggesting earlier in sequence
      if (lowerEvent.includes('begin') || lowerEvent.includes('start') || 
          lowerEvent.includes('initial') || lowerEvent.includes('prepare')) {
        score -= 3;
      }
      
      // Words suggesting middle of sequence
      if (lowerEvent.includes('then') || lowerEvent.includes('next') ||
          lowerEvent.includes('after') || lowerEvent.includes('continue')) {
        score += 0;
      }
      
      // Words suggesting end of sequence
      if (lowerEvent.includes('finally') || lowerEvent.includes('last') ||
          lowerEvent.includes('complete') || lowerEvent.includes('finish')) {
        score += 3;
      }
      
      return score;
    });
    
    // Sort by score to get a logical order
    const orderedIndices = [...Array(events.length).keys()]
      .sort((a, b) => beforeAfterCount[a] - beforeAfterCount[b]);
    
    // If we detected a meaningful order, use it
    if (orderedIndices.some(idx => beforeAfterCount[idx] !== 0)) {
      correctOrder = orderedIndices.map(idx => idx + 1);
    } else {
      // Otherwise, create a somewhat scrambled but fixed order
      correctOrder = [2, 4, 1, 5, 3];
    }
  }
  
  return {
    events,
    correctOrder
  };
};

const generateMathContent = (resource) => {
  // Extract and create real math problems based on content
  let problems = [];
  let solutions = [];
  
  if (resource.contentText) {
    const sentences = extractSentences(resource.contentText, 6);
    const topics = extractTopicsList(resource.contentText, 4);
    
    // Generate math problems based on sentences
    if (sentences.length > 0) {
      // Extract numbers from the content if available
      const numberMatches = resource.contentText.match(/\b\d+\b/g) || [];
      const numbers = [...new Set(numberMatches)].slice(0, 8);
      
      // Create problems based on the content
      problems = sentences.slice(0, 4).map((sentence, index) => {
        const num1 = numbers[index * 2] ? parseInt(numbers[index * 2]) : (index + 2) * 5;
        const num2 = numbers[index * 2 + 1] ? parseInt(numbers[index * 2 + 1]) : (index + 1) * 3;
        
        // Create different types of problems
        switch (index % 4) {
          case 0:
            return `${num1} + ${num2} = ?`;
          case 1:
            return `${num1 + num2} - ${num2} = ?`;
          case 2:
            return `${num1} × ${num2} = ?`;
          case 3:
            return `${num1 * num2} ÷ ${num2} = ?`;
        }
      });
      
      // Generate solutions
      solutions = problems.map(problem => {
        if (problem.includes('+')) {
          const [a, b] = problem.split('+').map(p => parseInt(p.trim()));
          return `${a} + ${b} = ${a + b}`;
        } else if (problem.includes('-')) {
          const [a, b] = problem.split('-').map(p => parseInt(p.trim()));
          return `${a} - ${b} = ${a - b}`;
        } else if (problem.includes('×')) {
          const [a, b] = problem.split('×').map(p => parseInt(p.trim()));
          return `${a} × ${b} = ${a * b}`;
        } else if (problem.includes('÷')) {
          const [a, b] = problem.split('÷').map(p => parseInt(p.trim()));
          return `${a} ÷ ${b} = ${a / b}`;
        }
        return "Solution will vary";
      });
    }
    
    // If we couldn't extract numbers, create word problems based on topics
    if (problems.length === 0 && topics.length > 0) {
      problems = topics.slice(0, 4).map((topic, index) => {
        const num1 = (index + 2) * 5;
        const num2 = (index + 1) * 3;
        
        return `If there are ${num1} ${topic.split(' ')[0]} and ${num2} more are added, how many are there in total?`;
      });
      
      solutions = problems.map(problem => {
        const matches = problem.match(/(\d+).*?(\d+)/);
        if (matches && matches.length >= 3) {
          const num1 = parseInt(matches[1]);
          const num2 = parseInt(matches[2]);
          return `${num1} + ${num2} = ${num1 + num2}`;
        }
        return "Solution will vary";
      });
    }
  }
  
  // If we still don't have problems, create some based on the resource title
  if (problems.length === 0) {
    const topic = resource.title ? resource.title.split(' ')[0] : "items";
    
    problems = [
      `If you have 12 ${topic} and use 5, how many do you have left?`,
      `There are 8 groups of ${topic} with 4 in each group. How many are there in total?`,
      `You need 24 ${topic} and already have 15. How many more do you need?`,
      `If 20 ${topic} are shared among 5 people equally, how many does each person get?`
    ];
    
    solutions = [
      "12 - 5 = 7",
      "8 × 4 = 32",
      "24 - 15 = 9",
      "20 ÷ 5 = 4"
    ];
  }
  
  return {
    problems,
    solutions
  };
};

export default {
  generateWorksheetContent,
  getWorksheetTypesBySubject,
  WORKSHEET_TYPES,
  // Export the extraction functions for potential use elsewhere
  extractVocabulary,
  extractSentences,
  extractTopicsList
};
