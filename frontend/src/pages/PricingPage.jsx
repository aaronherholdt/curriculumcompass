import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Check, ArrowRight, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const PricingPage = () => {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Load PayPal SDK when component mounts
  useEffect(() => {
    const loadPayPalScript = () => {
      // Load the PayPal SDK script
      const script = document.createElement('script');
      // Replace "test" with your actual PayPal sandbox client ID 
      // In production, this should be configured in your environment
      script.src = "https://www.paypal.com/sdk/js?client-id=AXn3XQb2OVZ5krH8HoyCG0X15U8RII_EVWqC4gBhokrYrX_QrMFKxlK2iXRr0XAgOunkvHyX73JdUyf4&merchant-id=GDZYAVB7S9QUW&currency=USD";
      script.async = true;
      script.onload = () => console.log("PayPal SDK loaded");
      document.body.appendChild(script);
    };
    loadPayPalScript();
  }, []);

  // Render PayPal buttons when container exists and orderId is available
  useEffect(() => {
    if (showPaymentOptions && orderId) {
      renderPayPalButtons(orderId);
    }
  }, [showPaymentOptions, orderId]);

  // Auto-redirect to dashboard after payment success
  useEffect(() => {
    let redirectTimer;
    if (paymentSuccess) {
      // Redirect to dashboard after 2 seconds
      redirectTimer = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [paymentSuccess, navigate]);

  const handleSubscribeClick = async () => {
    // Verify the user is authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      // Call backend to create a PayPal order
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: 'premium',
          price: 20.00
        }),
        credentials: 'include', // Important to include cookies for authentication
      });

      const responseText = await response.text(); // Read body as text first

      if (!response.ok) {
        // Server returned an error status code. Log the text content.
        console.error(`Server error (status ${response.status}): ${responseText}`);
        // Re-throw to be caught by the main catch block for consistent error handling.
        throw new Error(`Server responded with status ${response.status}. Body: ${responseText.substring(0, 200)}...`);
      }

      let orderData;
      try {
        orderData = JSON.parse(responseText); // Parse the text as JSON
      } catch (parseError) {
        // JSON parsing failed. responseText contains the problematic content.
        console.error('Failed to parse JSON response. Raw text:', responseText);
        // Re-throw to be caught by the main catch block.
        // The original error was at line 50 (await response.json())
        throw new Error(`Failed to parse server response as JSON (original error at line 50). Raw text: ${responseText.substring(0, 200)}...`);
      }
      
      if (orderData.orderId) {
        // Store the orderId in state and show payment options
        setOrderId(orderData.orderId);
        setShowPaymentOptions(true);
      } else {
        console.error('Failed to create PayPal order');
      }
    } catch (error) {
      console.error('Error creating PayPal order:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPayPalButtons = (orderId) => {
    // Make sure PayPal SDK is loaded
    if (window.paypal) {
      // Clear existing buttons container if any
      const container = document.getElementById('paypal-button-container');
      if (container) container.innerHTML = '';
      
      // Render the PayPal buttons
      window.paypal.Buttons({
        // Set up the transaction
        createOrder: () => {
          return orderId;
        },
        
        // Finalize the transaction
        onApprove: async (data, actions) => {
          try {
            setLoading(true);
            
            // Call your server to capture the order
            const response = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: data.orderID
              }),
              credentials: 'include', // Include cookies for authentication
            });
            
            // Check if the response is ok before trying to parse JSON
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Server responded with status ${response.status}: ${errorText}`);
            }
            
            // Check for empty response
            const responseText = await response.text();
            if (!responseText.trim()) {
              throw new Error('Server returned an empty response');
            }
            
            // Parse the JSON
            let captureData;
            try {
              captureData = JSON.parse(responseText);
            } catch (parseError) {
              throw new Error(`Invalid JSON response: ${responseText}`);
            }
            
            // If successful, show success message
            if (captureData.success) {
              setPaymentSuccess(true);
              setShowPaymentOptions(false);
              // Auto-redirect handled by the useEffect
            } else {
              console.error('Payment capture failed:', captureData);
            }
          } catch (error) {
            console.error('Error capturing payment:', error);
          } finally {
            setLoading(false);
          }
        }
      }).render('#paypal-button-container');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
    >
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Premium Plan
        </h2>
        
        {paymentSuccess ? (
          <div className="bg-gray-700 bg-opacity-50 rounded-xl p-6 mb-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-white" size={30} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
            <p className="text-gray-300 mb-6">Your subscription has been activated successfully.</p>
            <p className="text-gray-300 mb-6">Redirecting to dashboard...</p>
            
            <motion.button
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
              font-bold rounded-lg shadow-lg hover:from-green-600
              hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              focus:ring-offset-gray-900 transition duration-200 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
              <ArrowRight className="ml-2" size={20} />
            </motion.button>
          </div>
        ) : (
          <div className="bg-gray-700 bg-opacity-50 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Monthly</h3>
              <div className="text-2xl font-bold text-green-400">$20</div>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="text-green-400 mr-2 flex-shrink-0 mt-1" size={18} />
                <span className="text-gray-300">Full access to all features</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-400 mr-2 flex-shrink-0 mt-1" size={18} />
                <span className="text-gray-300">Priority customer support</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-400 mr-2 flex-shrink-0 mt-1" size={18} />
                <span className="text-gray-300">Advanced analytics</span>
              </li>
              <li className="flex items-start">
                <Check className="text-green-400 mr-2 flex-shrink-0 mt-1" size={18} />
                <span className="text-gray-300">Unlimited storage</span>
              </li>
            </ul>
            
            {!isAuthenticated ? (
              <div className="text-center">
                <p className="text-gray-300 mb-4">Please login to subscribe to our premium plan.</p>
                <motion.button
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                  font-bold rounded-lg shadow-lg hover:from-green-600
                  hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                  focus:ring-offset-gray-900 transition duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={redirectToLogin}
                >
                  <LogIn className="mr-2" size={20} />
                  Log In
                </motion.button>
              </div>
            ) : !showPaymentOptions ? (
              <motion.button
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                font-bold rounded-lg shadow-lg hover:from-green-600
                hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                focus:ring-offset-gray-900 transition duration-200 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubscribeClick}
                disabled={loading}
              >
                <CreditCard className="mr-2" size={20} />
                {loading ? "Processing..." : "Subscribe Now"}
              </motion.button>
            ) : (
              <div className="space-y-3">
                <h4 className="text-white font-semibold mb-2">Complete Payment</h4>
                <div id="paypal-button-container"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
        <p className="text-sm text-gray-400">
          Already verified?{" "}
          <Link to="/verify-email" className="text-green-400 hover:underline">
            Verify Email
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default PricingPage; 