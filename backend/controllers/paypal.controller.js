import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { prisma } from '../prisma/prisma.js';

dotenv.config();

// Debug helper
const debug = (message, obj = null) => {
  console.log(`[PayPal Controller] ${message}`);
  if (obj) console.log(JSON.stringify(obj, null, 2));
};

// Get PayPal access token for API calls
const getPayPalAccessToken = async () => {
  debug('Getting PayPal access token');
  
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('PayPal client ID or secret not configured');
    }
    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      debug('Failed to get PayPal access token', data);
      throw new Error(`PayPal API error: ${data.error_description || 'Unknown error'}`);
    }
    
    debug('Successfully retrieved PayPal access token');
    return data.access_token;
  } catch (error) {
    debug(`Error getting PayPal access token: ${error.message}`);
    throw error;
  }
};

// Verify PayPal webhook signature
const verifyWebhookSignature = async (req) => {
  debug('Verifying webhook signature');
  
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    
    if (!webhookId) {
      throw new Error('PayPal webhook ID not configured');
    }
    
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch('https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        auth_algo: req.headers['paypal-auth-algo'],
        cert_url: req.headers['paypal-cert-url'],
        transmission_id: req.headers['paypal-transmission-id'],
        transmission_sig: req.headers['paypal-transmission-sig'],
        transmission_time: req.headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: req.body
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      debug('Failed to verify webhook signature', data);
      throw new Error(`PayPal API error: ${data.message || 'Unknown error'}`);
    }
    
    debug(`Webhook signature verification result: ${data.verification_status}`);
    return data.verification_status === 'SUCCESS';
  } catch (error) {
    debug(`Error verifying webhook signature: ${error.message}`);
    throw error;
  }
};

// Get subscription details from PayPal
const getSubscriptionDetails = async (subscriptionId) => {
  debug(`Getting subscription details for ID: ${subscriptionId}`);
  
  try {
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      debug('Failed to get subscription details', data);
      throw new Error(`PayPal API error: ${data.message || 'Unknown error'}`);
    }
    
    debug('Successfully retrieved subscription details', data);
    return data;
  } catch (error) {
    debug(`Error getting subscription details: ${error.message}`);
    throw error;
  }
};

// Create a new subscription in our database
export const createSubscription = async (req, res) => {
  debug('Creating subscription in database', { body: req.body });
  
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ success: false, message: 'Subscription ID is required' });
    }
    
    // Get the subscription details from PayPal
    const subscriptionDetails = await getSubscriptionDetails(subscriptionId);
    
    // Extract user ID from the authenticated request
    const userId = req.user.id || req.userId;
    debug(`Creating subscription for user ID: ${userId}`);
    
    // Save the subscription to the database
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        subscriptionId,
        status: subscriptionDetails.status,
        planId: subscriptionDetails.plan_id,
        startDate: new Date(subscriptionDetails.start_time),
        nextBillingDate: new Date(subscriptionDetails.billing_info.next_billing_time),
        paypalData: subscriptionDetails
      }
    });
    
    // Update user's premium status
    await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true }
    });
    
    debug('Subscription created successfully', { subscription });
    return res.status(201).json({ success: true, subscription });
  } catch (error) {
    debug(`Error creating subscription: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Handle PayPal webhook events
export const handleWebhook = async (req, res) => {
  debug('Received webhook event', { 
    event_type: req.body.event_type, 
    headers: {
      'paypal-transmission-id': req.headers['paypal-transmission-id'],
      'paypal-transmission-time': req.headers['paypal-transmission-time']
    }
  });
  
  try {
    // Verify the webhook signature
    const isVerified = await verifyWebhookSignature(req);
    
    if (!isVerified) {
      debug('Webhook signature verification failed');
      return res.status(400).json({ success: false, message: 'Webhook signature verification failed' });
    }
    
    const { event_type, resource } = req.body;
    
    // Handle different event types
    switch (event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        debug('Subscription created webhook received', resource);
        // Already handled in createSubscription endpoint
        break;
        
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        debug('Subscription activated webhook received', resource);
        await handleSubscriptionActivated(resource);
        break;
        
      case 'BILLING.SUBSCRIPTION.UPDATED':
        debug('Subscription updated webhook received', resource);
        await handleSubscriptionUpdated(resource);
        break;
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        debug('Subscription cancelled webhook received', resource);
        await handleSubscriptionCancelled(resource);
        break;
        
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        debug('Subscription suspended webhook received', resource);
        await handleSubscriptionSuspended(resource);
        break;
        
      case 'PAYMENT.SALE.COMPLETED':
        debug('Payment completed webhook received', resource);
        await handlePaymentCompleted(resource);
        break;
        
      case 'PAYMENT.SALE.DENIED':
      case 'PAYMENT.SALE.REFUNDED':
      case 'PAYMENT.SALE.REVERSED':
        debug(`Payment issue webhook received: ${event_type}`, resource);
        await handlePaymentIssue(resource, event_type);
        break;
        
      default:
        debug(`Unhandled webhook event type: ${event_type}`);
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    debug(`Error handling webhook: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Handle subscription activated event
const handleSubscriptionActivated = async (resource) => {
  try {
    const subscriptionId = resource.id;
    
    // Update subscription status in database
    await prisma.subscription.update({
      where: { subscriptionId },
      data: {
        status: 'ACTIVE',
        startDate: new Date(resource.start_time),
        nextBillingDate: resource.billing_info?.next_billing_time 
          ? new Date(resource.billing_info.next_billing_time) 
          : undefined,
        paypalData: resource
      }
    });
    
    // Ensure user has premium access
    const subscription = await prisma.subscription.findUnique({
      where: { subscriptionId },
      include: { user: true }
    });
    
    if (subscription) {
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { isPremium: true }
      });
    }
    
    debug(`Subscription ${subscriptionId} activated successfully`);
  } catch (error) {
    debug(`Error handling subscription activation: ${error.message}`);
    throw error;
  }
};

// Handle subscription updated event
const handleSubscriptionUpdated = async (resource) => {
  try {
    const subscriptionId = resource.id;
    
    // Update subscription in database
    await prisma.subscription.update({
      where: { subscriptionId },
      data: {
        status: resource.status,
        nextBillingDate: resource.billing_info?.next_billing_time 
          ? new Date(resource.billing_info.next_billing_time) 
          : undefined,
        paypalData: resource
      }
    });
    
    debug(`Subscription ${subscriptionId} updated successfully`);
  } catch (error) {
    debug(`Error handling subscription update: ${error.message}`);
    throw error;
  }
};

// Handle subscription cancelled event
const handleSubscriptionCancelled = async (resource) => {
  try {
    const subscriptionId = resource.id;
    
    // Update subscription in database
    await prisma.subscription.update({
      where: { subscriptionId },
      data: {
        status: 'CANCELLED',
        endDate: new Date(),
        paypalData: resource
      }
    });
    
    // Find the user associated with this subscription
    const subscription = await prisma.subscription.findUnique({
      where: { subscriptionId },
      include: { user: true }
    });
    
    if (subscription) {
      // Remove premium access
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { isPremium: false }
      });
    }
    
    debug(`Subscription ${subscriptionId} cancelled successfully`);
  } catch (error) {
    debug(`Error handling subscription cancellation: ${error.message}`);
    throw error;
  }
};

// Handle subscription suspended event
const handleSubscriptionSuspended = async (resource) => {
  try {
    const subscriptionId = resource.id;
    
    // Update subscription in database
    await prisma.subscription.update({
      where: { subscriptionId },
      data: {
        status: 'SUSPENDED',
        paypalData: resource
      }
    });
    
    // Find the user associated with this subscription
    const subscription = await prisma.subscription.findUnique({
      where: { subscriptionId },
      include: { user: true }
    });
    
    if (subscription) {
      // Remove premium access
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { isPremium: false }
      });
    }
    
    debug(`Subscription ${subscriptionId} suspended successfully`);
  } catch (error) {
    debug(`Error handling subscription suspension: ${error.message}`);
    throw error;
  }
};

// Handle payment completed event
const handlePaymentCompleted = async (resource) => {
  try {
    const saleId = resource.id;
    const subscriptionId = resource.billing_agreement_id;
    
    if (!subscriptionId) {
      debug('No subscription ID found in payment completed event', resource);
      return;
    }
    
    // Record the payment
    await prisma.payment.create({
      data: {
        saleId,
        subscriptionId,
        amount: parseFloat(resource.amount.total),
        currency: resource.amount.currency,
        status: resource.state,
        paymentDate: new Date(resource.create_time),
        paypalData: resource
      }
    });
    
    // Update subscription next billing date
    const subscription = await prisma.subscription.findUnique({
      where: { subscriptionId }
    });
    
    if (subscription) {
      // Get updated subscription details from PayPal
      const subscriptionDetails = await getSubscriptionDetails(subscriptionId);
      
      await prisma.subscription.update({
        where: { subscriptionId },
        data: {
          status: subscriptionDetails.status,
          nextBillingDate: subscriptionDetails.billing_info?.next_billing_time 
            ? new Date(subscriptionDetails.billing_info.next_billing_time) 
            : undefined,
          paypalData: subscriptionDetails
        }
      });
    }
    
    debug(`Payment ${saleId} for subscription ${subscriptionId} recorded successfully`);
  } catch (error) {
    debug(`Error handling payment completion: ${error.message}`);
    throw error;
  }
};

// Handle payment issues (denied, refunded, reversed)
const handlePaymentIssue = async (resource, eventType) => {
  try {
    const saleId = resource.id;
    const subscriptionId = resource.billing_agreement_id;
    
    if (!subscriptionId) {
      debug(`No subscription ID found in ${eventType} event`, resource);
      return;
    }
    
    // Record the payment issue
    await prisma.payment.create({
      data: {
        saleId,
        subscriptionId,
        amount: parseFloat(resource.amount.total),
        currency: resource.amount.currency,
        status: resource.state,
        paymentDate: new Date(resource.create_time),
        paypalData: resource
      }
    });
    
    // If payment was denied or reversed, update user's premium status
    if (eventType === 'PAYMENT.SALE.DENIED' || eventType === 'PAYMENT.SALE.REVERSED') {
      const subscription = await prisma.subscription.findUnique({
        where: { subscriptionId },
        include: { user: true }
      });
      
      if (subscription) {
        // Remove premium access
        await prisma.user.update({
          where: { id: subscription.userId },
          data: { isPremium: false }
        });
        
        // Update subscription status
        await prisma.subscription.update({
          where: { subscriptionId },
          data: {
            status: 'PAYMENT_FAILED',
            paypalData: { ...subscription.paypalData, payment_failed_event: resource }
          }
        });
      }
    }
    
    debug(`Payment issue ${saleId} for subscription ${subscriptionId} handled successfully`);
  } catch (error) {
    debug(`Error handling payment issue: ${error.message}`);
    throw error;
  }
}; 