import paypal from '@paypal/checkout-server-sdk';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error("CRITICAL: PayPal Client ID or Secret is not defined in .env file. PayPal functionality will be disabled.");
}

// Configure PayPal environment
// Only initialize if credentials are provided
let client;
if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET) {
    const environment = process.env.NODE_ENV === 'production'
        ? new paypal.core.LiveEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
        : new paypal.core.SandboxEnvironment(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET);
    client = new paypal.core.PayPalHttpClient(environment);
} else {
    // client remains undefined. Functions below must handle this.
    console.warn("PayPal client not initialized due to missing credentials. API calls will fail gracefully.");
}

// Create a PayPal order
export const createOrder = async (req, res) => {
    if (!client) {
        console.error('PayPal client is not initialized. Missing credentials?');
        return res.status(500).json({
            success: false,
            message: 'Payment service is not configured correctly. Please contact support.',
        });
    }
    try {
        const request = new paypal.orders.OrdersCreateRequest();
        
        // Set request headers
        request.prefer("return=representation");
        
        // Configure the order
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: '20.00'  // $20 for the subscription
                    },
                    description: 'Curriculum Compass Premium Subscription'
                }
            ],
            application_context: {
                brand_name: 'Curriculum Compass',
                landing_page: 'NO_PREFERENCE',
                user_action: 'PAY_NOW',
                return_url: `${process.env.CLIENT_URL}/dashboard`,
                cancel_url: `${process.env.CLIENT_URL}/pricing`
            }
        });

        // Execute the request
        const order = await client.execute(request);
        
        res.status(200).json({
            success: true,
            orderId: order.result.id
        });
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create PayPal order',
            error: error.message
        });
    }
};

// Capture a PayPal order (finalize the payment)
export const captureOrder = async (req, res) => {
    if (!client) {
        console.error('PayPal client is not initialized. Missing credentials?');
        return res.status(500).json({
            success: false,
            message: 'Payment service is not configured correctly. Please contact support.',
        });
    }
    const { orderId } = req.body;
    const userId = req.user.id; // User ID from the JWT auth middleware
    
    if (!orderId) {
        return res.status(400).json({
            success: false,
            message: 'Order ID is required'
        });
    }

    try {
        // Create capture request
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.prefer("return=representation");
        
        // Execute the capture request
        const capture = await client.execute(request);
        
        // Verify the payment was successful
        if (capture.result.status === 'COMPLETED') {
            // Update user subscription in the database
            const today = new Date();
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);
            
            // Check if user already has a subscription
            const existingSubscription = await prisma.subscription.findUnique({
                where: { userId }
            });
            
            if (existingSubscription) {
                // Update existing subscription
                await prisma.subscription.update({
                    where: { userId },
                    data: {
                        plan: 'Premium',
                        isActive: true,
                        startDate: today,
                        endDate: nextMonth,
                        paymentMethod: 'PayPal',
                        lastPaymentDate: today,
                        lastPaymentAmount: 20.00,
                        paypalOrderId: orderId
                    }
                });
            } else {
                // Create new subscription
                await prisma.subscription.create({
                    data: {
                        userId,
                        plan: 'Premium',
                        isActive: true,
                        startDate: today,
                        endDate: nextMonth,
                        paymentMethod: 'PayPal',
                        lastPaymentDate: today,
                        lastPaymentAmount: 20.00,
                        paypalOrderId: orderId
                    }
                });
            }
            
            // Add billing history record
            await prisma.billingHistory.create({
                data: {
                    userId,
                    amount: 20.00,
                    description: 'Premium Monthly Subscription',
                    paymentMethod: 'PayPal',
                    paymentDate: today,
                    status: 'Completed',
                    paypalOrderId: orderId
                }
            });
            
            res.status(200).json({
                success: true,
                message: 'Payment successful and subscription activated',
                captureId: capture.result.id
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment was not completed successfully'
            });
        }
    } catch (error) {
        console.error('Error capturing PayPal order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to capture PayPal order',
            error: error.message
        });
    }
}; 