import express from 'express';
import { 
  generateWorksheet, 
  getWorksheetTypes,
  generateAnswerKey,
  fetchResourceContent
} from '../controllers/worksheet.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// Generate a worksheet
router.post('/generate', isAuthenticated, generateWorksheet);

// Get worksheet types for a subject and grade
router.get('/types', isAuthenticated, getWorksheetTypes);

// Generate an answer key
router.post('/answer-key', isAuthenticated, generateAnswerKey);

// Fetch content from a resource URL
router.post('/fetch-content', isAuthenticated, fetchResourceContent);

export default router;
