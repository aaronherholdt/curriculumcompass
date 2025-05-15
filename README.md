<h1 align="center">Advanced Auth Tutorial 🔒 </h1>

![Demo App](/frontend/public/screenshot-for-readme.png)

[Video Tutorial on Youtube](https://youtu.be/pmvEgZC55Cg)

About This Course:

-   🔧 Backend Setup
-   🗄️ Database Setup (PostgreSQL with Prisma ORM)
-   🔐 Signup Endpoint
-   📧 Sending Verify Account Email (SendGrid)
-   🔍 Verify Email Endpoint
-   📄 Building a Welcome Email Template
-   🚪 Logout Endpoint
-   🔑 Login Endpoint
-   🔄 Forgot Password Endpoint
-   🔁 Reset Password Endpoint
-   ✔️ Check Auth Endpoint
-   🌐 Frontend Setup
-   📋 Signup Page UI
-   🔓 Login Page UI
-   ✅ Email Verification Page UI
-   📤 Implementing Signup
-   📧 Implementing Email Verification
-   🔒 Protecting Our Routes
-   🔑 Implementing Login
-   🏠 Dashboard Page
-   🔄 Implementing Forgot Password
-   🚀 Super Detailed Deployment
-   ✅ This is a lot of work. Support my work by subscribing to the [Channel](https://www.youtube.com/@asaprogrammer_)

# Curriculum Compass - PayPal Integration

This project implements PayPal payment processing for subscriptions.

## Implementation Details

### Frontend (PricingPage.jsx)

- Updates the displayed price to $20.
- Loads PayPal's JavaScript SDK on component mount.
- When "Subscribe Now" is clicked, the app creates a PayPal order via the backend.
- Renders PayPal's payment buttons using the returned orderID.
- After successful payment, user is shown a success message and can proceed to the dashboard.
- Authentication checks to ensure only logged-in users can subscribe.

### Backend

#### PayPal Controller

- `createOrder`: Creates a PayPal order for $20 with appropriate description
- `captureOrder`: Captures the payment and updates user subscription status:
  - Updates subscription record in database
  - Creates billing history entry
  - Returns success status

#### Database

- `subscription` table tracks the user's active subscription
- `billingHistory` table maintains payment records

## Testing

1. For testing, the PayPal SDK is loaded in sandbox mode.
2. Use PayPal's sandbox accounts for testing:
   - Buyer: sb-buyer@example.com / sandbox-password
   - You can create more sandbox accounts in the PayPal Developer Dashboard

## Production Deployment

For production:

1. Update the PayPal client ID to your production client ID
2. Set `NODE_ENV=production` to use PayPal's live environment
3. Set proper webhook and notification settings in your PayPal account

## Security Considerations

- All API endpoints are protected by authentication middleware
- Payment processing is handled server-side to prevent tampering
- Sensitive payment information is never stored in the application

## PayPal Integration

This project includes integration with PayPal for handling subscription payments.

### Setup

1. Install the PayPal SDK:
   ```
   npm install @paypal/checkout-server-sdk
   ```

2. Add the following environment variables to your `.env` file:
   ```
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   ```

3. The PayPal integration includes:
   - Creating orders: `POST /api/paypal/create-order`
   - Capturing payments: `POST /api/paypal/capture-order`

4. Database Schema:
   - Updated Subscription model with PayPal fields
   - Added BillingHistory model to track payments

### Testing PayPal Integration

1. In development, PayPal Sandbox is used automatically
2. Test buyer credentials can be created in the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)

### Setup .env file

```bash
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=development

# PostgreSQL Database URL (NeonDB or Vercel Postgres)
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender@example.com
SENDGRID_FROM_NAME=Your App Name

CLIENT_URL= http://localhost:5173
```

### Setting up the database

```shell
# Generate Prisma client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# Push schema to database without migrations (alternative)
npx prisma db push
```

### Run this app locally

```shell
npm run build
```

### Start the app

```shell
npm run start
```

### I'll see you in the next one! 🚀
