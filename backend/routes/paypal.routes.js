import express from 'express';
import { createSubscription, handleWebhook } from '../controllers/paypal.controller.js';
import { protectRoute } from '../middleware/protect.route.js';

const router = express.Router();

// Create a subscription (requires authentication)
router.post('/create-subscription', protectRoute, createSubscription);

// Webhook endpoint (does not require authentication)
router.post('/webhook', handleWebhook);

export default router; 