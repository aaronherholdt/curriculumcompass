import express from 'express';
import { createOrder, captureOrder } from '../controllers/paypal.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/paypal/create-order
 * @desc    Create a PayPal order for subscription payment
 * @access  Private
 */
router.post('/create-order', isAuthenticated, createOrder);

/**
 * @route   POST /api/paypal/capture-order
 * @desc    Capture a PayPal order after user approves payment
 * @access  Private
 */
router.post('/capture-order', isAuthenticated, captureOrder);

export default router; 