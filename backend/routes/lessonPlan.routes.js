import express from 'express';
import { 
  getLessonPlans, 
  getLessonPlan, 
  createLessonPlan, 
  updateLessonPlan, 
  deleteLessonPlan 
} from '../controllers/lessonPlan.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all lesson plans or filter by childProfileId
router.get('/', isAuthenticated, getLessonPlans);

// Get a specific lesson plan
router.get('/:id', isAuthenticated, getLessonPlan);

// Create a new lesson plan
router.post('/', isAuthenticated, createLessonPlan);

// Update a lesson plan
router.put('/:id', isAuthenticated, updateLessonPlan);

// Delete a lesson plan
router.delete('/:id', isAuthenticated, deleteLessonPlan);

export default router; 