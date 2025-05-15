/**
 * Worksheet Generator Utility
 * 
 * This utility provides functions to generate printable worksheets from lesson resources.
 * It creates age-appropriate activities based on the content of web resources.
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Constants for worksheet types
export const WORKSHEET_TYPES = {
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
 * Determine appropriate worksheet types based on subject and grade
 * @param {string} subject - The subject of the lesson
 * @param {string} grade - The grade level
 * @returns {Array} - Array of appropriate worksheet types
 */
export const getWorksheetTypesBySubject = (subject, grade) => {
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
export const parseGradeLevel = (grade) => {
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
 * Generate a worksheet PDF based on resource content and type
 * @param {Object} resource - The resource object
 * @param {string} childName - Child's name
 * @param {string} grade - Grade level
 * @param {string} worksheetType - Type of worksheet to generate
 * @returns {Blob} - PDF blob
 */
export const generateWorksheetPDF = (resource, childName, grade, worksheetType) => {
  const doc = new jsPDF();
  const title = `${resource.title} - Activity Worksheet`;
  const date = new Date().toLocaleDateString();
  
  // Add header
  doc.setFontSize(18);
  doc.text(title, 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Name: ${childName}`, 20, 35);
  doc.text(`Grade: ${grade}`, 20, 42);
  doc.text(`Date: ${date}`, 20, 49);
  
  // Add instructions
  doc.setFontSize(14);
  doc.text('Instructions:', 20, 60);
  
  const instructions = getWorksheetInstructions(resource, worksheetType);
  doc.setFontSize(12);
  doc.text(instructions, 20, 70);
  
  // Add content based on worksheet type
  const yPosition = 90;
  
  // If the resource has content from the API, use it
  if (resource.content) {
    addAPIWorksheetContent(doc, resource, worksheetType, yPosition);
  } else {
    // Otherwise, use the local worksheet content generation
    addWorksheetContent(doc, resource, worksheetType, yPosition);
  }
  
  // Add footer with source
  doc.setFontSize(10);
  doc.text(`Source: ${resource.source || 'Educational Resource'}`, 20, 280);
  doc.text('Generated by Curriculum Compass', 105, 287, { align: 'center' });
  
  return doc.output('blob');
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

/**
 * Add content to the worksheet based on type
 */
const addWorksheetContent = (doc, resource, worksheetType, startY) => {
  let y = startY;
  
  switch (worksheetType) {
    case WORKSHEET_TYPES.VOCABULARY:
      addVocabularyContent(doc, resource, y);
      break;
    case WORKSHEET_TYPES.MATCHING:
      addMatchingContent(doc, resource, y);
      break;
    case WORKSHEET_TYPES.FILL_IN_BLANK:
      addFillInBlankContent(doc, resource, y);
      break;
    case WORKSHEET_TYPES.MULTIPLE_CHOICE:
      addMultipleChoiceContent(doc, resource, y);
      break;
    case WORKSHEET_TYPES.SHORT_ANSWER:
      addShortAnswerContent(doc, resource, y);
      break;
    case WORKSHEET_TYPES.DRAWING:
      addDrawingContent(doc, resource, y);
      break;
    case WORKSHEET_TYPES.LABELING:
      addLabelingContent(doc, resource, y);
      break;
    case WORKSHEET_TYPES.SEQUENCING:
      addSequencingContent(doc, resource, y);
      break;
    case WORKSHEET_TYPES.MATH_PRACTICE:
      addMathContent(doc, resource, y);
      break;
    default:
      // Generic content
      doc.text('Complete the activities below:', 20, y);
      break;
  }
};

/**
 * Add content to the worksheet based on API response
 */
const addAPIWorksheetContent = (doc, resource, worksheetType, startY) => {
  let y = startY;
  
  // Use the content directly from the API response
  switch (worksheetType) {
    case WORKSHEET_TYPES.VOCABULARY:
      if (resource.content.words && resource.content.words.length > 0) {
        const words = resource.content.words;
        words.forEach((word, index) => {
          doc.setFontSize(12);
          doc.text(`${index + 1}. ${word}:`, 20, y + (index * 25));
          doc.line(50, y + 2 + (index * 25), 190, y + 2 + (index * 25));
          doc.line(20, y + 12 + (index * 25), 190, y + 12 + (index * 25));
        });
      } else {
        // Fall back to default if API data is missing or invalid
        addVocabularyContent(doc, resource, y);
      }
      break;
      
    case WORKSHEET_TYPES.MATCHING:
      if (resource.content.leftItems && resource.content.rightItems &&
          resource.content.leftItems.length > 0 && resource.content.rightItems.length > 0) {
        const leftItems = resource.content.leftItems;
        const rightItems = resource.content.rightItems;
        
        doc.setFontSize(12);
        
        leftItems.forEach((item, index) => {
          if (index < rightItems.length) {
            doc.text(item, 30, y + (index * 15));
          }
        });
        
        rightItems.forEach((item, index) => {
          if (index < leftItems.length) {
            doc.text(item, 120, y + (index * 15));
          }
        });
      } else {
        addMatchingContent(doc, resource, y);
      }
      break;
      
    case WORKSHEET_TYPES.FILL_IN_BLANK:
      if (resource.content.wordBank && resource.content.sentences &&
          resource.content.wordBank.length > 0 && resource.content.sentences.length > 0) {
        doc.setFontSize(12);
        doc.text('Word Bank:', 20, y);
        doc.text(resource.content.wordBank.join(', '), 20, y + 10);
        
        resource.content.sentences.forEach((sentence, index) => {
          // Split long sentences into multiple lines
          const maxWidth = 160;
          const splitText = doc.splitTextToSize(sentence, maxWidth);
          
          // Calculate height for the sentence
          const lineHeight = 7;
          const sentenceHeight = splitText.length * lineHeight;
          
          doc.text(`${index + 1}. `, 20, y + 30 + (index * (sentenceHeight + 10)));
          doc.text(splitText, 30, y + 30 + (index * (sentenceHeight + 10)));
        });
      } else {
        addFillInBlankContent(doc, resource, y);
      }
      break;
      
    // Similar cases for other worksheet types
    // ... add remaining cases ...
      
    default:
      // Fall back to the original content generation
      addWorksheetContent(doc, resource, worksheetType, y);
      break;
  }
};

// Helper functions for different worksheet types
// These would be expanded with more sophisticated content generation in a real implementation

const addVocabularyContent = (doc, resource, y) => {
  // In a real implementation, we would extract vocabulary from the resource
  // For now, we'll create a simple template
  const words = ['Term 1', 'Term 2', 'Term 3', 'Term 4', 'Term 5'];
  
  words.forEach((word, index) => {
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${word}:`, 20, y + (index * 25));
    doc.line(50, y + 2 + (index * 25), 190, y + 2 + (index * 25));
    doc.line(20, y + 12 + (index * 25), 190, y + 12 + (index * 25));
  });
};

const addMatchingContent = (doc, resource, y) => {
  // Simple matching template
  const leftItems = ['Item A', 'Item B', 'Item C', 'Item D', 'Item E'];
  const rightItems = ['Description 1', 'Description 2', 'Description 3', 'Description 4', 'Description 5'];
  
  doc.setFontSize(12);
  
  leftItems.forEach((item, index) => {
    doc.text(item, 30, y + (index * 15));
  });
  
  rightItems.forEach((item, index) => {
    doc.text(item, 120, y + (index * 15));
  });
};

const addFillInBlankContent = (doc, resource, y) => {
  // Simple fill in the blank template
  doc.setFontSize(12);
  doc.text('Word Bank:', 20, y);
  doc.text('word1, word2, word3, word4, word5', 20, y + 10);
  
  const sentences = [
    'The ____________ is an important part of this lesson.',
    'We learned about ____________ in our class today.',
    'A ____________ is used to measure this property.',
    'The process of ____________ helps us understand the concept.',
    'Scientists use ____________ to explain this phenomenon.'
  ];
  
  sentences.forEach((sentence, index) => {
    doc.text(`${index + 1}. ${sentence}`, 20, y + 30 + (index * 15));
  });
};

const addMultipleChoiceContent = (doc, resource, y) => {
  // Simple multiple choice template
  const questions = [
    {
      question: 'Question 1?',
      options: ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4']
    },
    {
      question: 'Question 2?',
      options: ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4']
    },
    {
      question: 'Question 3?',
      options: ['A. Option 1', 'B. Option 2', 'C. Option 3', 'D. Option 4']
    }
  ];
  
  let currentY = y;
  
  questions.forEach((q, index) => {
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${q.question}`, 20, currentY);
    currentY += 10;
    
    q.options.forEach(option => {
      doc.text(option, 30, currentY);
      currentY += 8;
    });
    
    currentY += 5;
  });
};

const addShortAnswerContent = (doc, resource, y) => {
  // Simple short answer template
  const questions = [
    'Question 1?',
    'Question 2?',
    'Question 3?',
    'Question 4?'
  ];
  
  let currentY = y;
  
  questions.forEach((question, index) => {
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${question}`, 20, currentY);
    currentY += 10;
    
    // Add lines for answers
    doc.line(20, currentY, 190, currentY);
    doc.line(20, currentY + 10, 190, currentY + 10);
    
    currentY += 25;
  });
};

const addDrawingContent = (doc, resource, y) => {
  // Simple drawing template
  doc.setFontSize(12);
  doc.text('Draw a picture of what you learned about:', 20, y);
  
  // Add a box for drawing
  doc.rect(20, y + 10, 170, 120);
};

const addLabelingContent = (doc, resource, y) => {
  // Simple labeling template
  doc.setFontSize(12);
  doc.text('Label the diagram using these words:', 20, y);
  doc.text('label1, label2, label3, label4, label5', 20, y + 10);
  
  // Add a placeholder for diagram
  doc.rect(50, y + 20, 110, 110);
  
  // Add lines for labels
  const centerX = 105;
  const centerY = y + 75;
  const radius = 40;
  
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * 2 * Math.PI;
    const endX = centerX + radius * Math.cos(angle);
    const endY = centerY + radius * Math.sin(angle);
    
    doc.line(centerX, centerY, endX, endY);
    doc.text(`${i + 1}.`, endX + 5, endY);
  }
};

const addSequencingContent = (doc, resource, y) => {
  // Simple sequencing template
  doc.setFontSize(12);
  doc.text('Number these events in the correct order:', 20, y);
  
  const events = [
    'Event description 1',
    'Event description 2',
    'Event description 3',
    'Event description 4',
    'Event description 5'
  ];
  
  events.forEach((event, index) => {
    doc.rect(20, y + 15 + (index * 15), 10, 10);
    doc.text(event, 35, y + 22 + (index * 15));
  });
};

const addMathContent = (doc, resource, y) => {
  // Simple math practice template
  doc.setFontSize(12);
  doc.text('Solve the following problems:', 20, y);
  
  const problems = [
    'Problem 1',
    'Problem 2',
    'Problem 3',
    'Problem 4'
  ];
  
  let currentY = y + 15;
  
  problems.forEach((problem, index) => {
    doc.text(`${index + 1}. ${problem}`, 20, currentY);
    
    // Add work space
    doc.rect(20, currentY + 5, 170, 30);
    
    currentY += 45;
  });
};

export default {
  generateWorksheetPDF,
  getWorksheetTypesBySubject,
  WORKSHEET_TYPES
};
