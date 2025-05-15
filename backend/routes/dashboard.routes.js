import express from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get all dashboard data for the authenticated user
router.get('/', isAuthenticated, getDashboardData);

export default router; 