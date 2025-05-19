# PayPal Subscription Integration Guide

This guide outlines how to set up and configure the PayPal subscription integration in your application.

## Backend Implementation

We've implemented two key files for handling PayPal subscriptions:

1. `backend/controllers/paypal.controller.js` - Handles subscription creation and webhook events
2. `backend/routes/paypal.routes.js` - Defines API routes for PayPal integration

### Database Schema Changes

The Prisma schema has been updated with:
- New `isPremium` field on the User model
- Enhanced Subscription model with PayPal-specific fields
- New Payment model to track transaction history

## Required Environment Variables

Add these variables to your `.env` file:

```
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
```

## Setting Up PayPal Sandbox

1. **Create a PayPal Developer Account**:
   - Go to https://developer.paypal.com/ and sign up or log in

2. **Create a Sandbox Application**:
   - Navigate to "My Apps & Credentials"
   - Create a new REST API app
   - Note your Client ID and Secret

3. **Create a Subscription Plan**:
   - In the PayPal Developer Dashboard, navigate to "Billing Plans"
   - Create a new plan with the following settings:
     - Product: Create a new product or use an existing one
     - Billing cycle: Monthly
     - Price: $20.00 USD
     - Note the Plan ID for use in your frontend

4. **Set Up Webhooks**:
   - In the PayPal Developer Dashboard, navigate to "Webhooks"
   - Create a new webhook with your application URL: `https://your-domain.com/api/paypal/webhook`
   - Subscribe to these events:
     - BILLING.SUBSCRIPTION.CREATED
     - BILLING.SUBSCRIPTION.ACTIVATED
     - BILLING.SUBSCRIPTION.UPDATED
     - BILLING.SUBSCRIPTION.CANCELLED
     - BILLING.SUBSCRIPTION.SUSPENDED
     - PAYMENT.SALE.COMPLETED
     - PAYMENT.SALE.DENIED
     - PAYMENT.SALE.REFUNDED
     - PAYMENT.SALE.REVERSED
   - Note the Webhook ID for your environment variables

## Frontend Implementation

The `PricingPage.jsx` component is already set up to work with PayPal subscriptions:

1. It loads the PayPal SDK
2. Renders the subscription button when needed
3. Handles the subscription approval flow
4. Sends the subscription ID to the backend

## Testing the Integration

1. **In Development**:
   - Use the PayPal Sandbox for testing
   - Create sandbox buyer accounts in the PayPal Developer Dashboard
   - Use these accounts to test the subscription flow

2. **Test Scenarios**:
   - Successful subscription creation
   - Failed payment
   - Subscription cancellation
   - Webhook events processing

## Debugging

The controller includes extensive debug logging. Look for `[PayPal Controller]` in your server logs to track:
- API requests to PayPal
- Webhook event processing
- Subscription status changes

## Production Deployment

When moving to production:

1. Create a production PayPal app in the PayPal Developer Dashboard
2. Create a production webhook
3. Update environment variables with production credentials
4. Change PayPal SDK URL in `PricingPage.jsx` from sandbox to production

## API Endpoints

- `POST /api/paypal/create-subscription` - Record a new subscription in the database (authenticated)
- `POST /api/paypal/webhook` - Receive and process PayPal webhook events (not authenticated)

## Summary of Key IDs & Endpoints

| Step | PayPal SDK Call | Returned ID | Your Endpoint |
|------|-----------------|-------------|---------------|
| Render subscription button | actions.subscription.create({ plan_id }) | subscriptionID | N/A |
| Buyer approves in popup | onApprove(data) | data.subscriptionID | N/A |
| Record subscription backend | — | — | POST /api/paypal/create-subscription |
| Ongoing billing notifications | — | — | Webhook: /api/paypal/webhook | 