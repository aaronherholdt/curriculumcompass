import express from 'express';
import { 
  getChildProfiles, 
  getChildProfile, 
  createChildProfile, 
  updateChildProfile, 
  deleteChildProfile 
} from '../controllers/childProfile.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all child profiles
router.get('/', isAuthenticated, getChildProfiles);

// Get a specific child profile
router.get('/:id', isAuthenticated, getChildProfile);

// Create a new child profile
router.post('/', isAuthenticated, createChildProfile);

// Update a child profile
router.put('/:id', isAuthenticated, updateChildProfile);

// Delete a child profile
router.delete('/:id', isAuthenticated, deleteChildProfile);

export default router; 