import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Check, ArrowRight, LogIn, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

const SubscriptionModal = ({ isOpen, onClose, email, subscriptionId, onGoToDashboard }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-xl p-6 max-w-md w-full relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-white" size={30} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Subscription Successful!</h3>
          <p className="text-gray-300 mb-2">Your premium plan has been activated.</p>
          <p className="text-gray-300 mb-6">
            Subscription ID: <span className="text-green-400 font-mono text-sm">{subscriptionId}</span>
          </p>
          <p className="text-gray-300 mb-6">
            This subscription is tied to your email: <span className="text-green-400">{email}</span>
          </p>
          
          <motion.button
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
            font-bold rounded-lg shadow-lg hover:from-green-600
            hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            focus:ring-offset-gray-900 transition duration-200 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGoToDashboard}
          >
            Go to Dashboard
            <ArrowRight className="ml-2" size={20} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const PricingPage = () => {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [planId, setPlanId] = useState("P-0D113314S2492772WNAMHUZI");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Load PayPal SDK when component mounts
  useEffect(() => {
    const loadPayPalScript = () => {
      // Load the PayPal SDK script
      const script = document.createElement('script');
      // Replace "test" with your actual PayPal sandbox client ID 
      // In production, this should be configured in your environment
      script.src = "https://www.paypal.com/sdk/js?client-id=AY25jqOVC-OKmDTcJzZfoOMbxV93fzjU4PKUtiaWr-GdOVJdll6CgD_JEDW6EqMrq14xRgTnYztybY09&currency=USD&vault=true&intent=subscription";
      script.async = true;
      script.onload = () => console.log("PayPal SDK loaded");
      document.body.appendChild(script);
    };
    loadPayPalScript();
  }, []);

  // Render PayPal buttons when container exists
  useEffect(() => {
    if (showPaymentOptions) {
      renderPayPalButtons();
    }
  }, [showPaymentOptions]);

  const handleSubscribeClick = () => {
    // Verify the user is authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Show payment options immediately - we'll create the subscription with PayPal directly
    setShowPaymentOptions(true);
  };

  const renderPayPalButtons = () => {
    // Make sure PayPal SDK is loaded
    if (window.paypal) {
      // Clear existing buttons container if any
      const container = document.getElementById('paypal-button-container');
      if (container) container.innerHTML = '';
      
              // Render the PayPal buttons
      window.paypal.Buttons({
        // Set up the subscription
        createSubscription: (data, actions) => {
          return actions.subscription.create({
            plan_id: planId
          });
        },
        
        // Handle subscription approval
        onApprove: async (data) => {
          try {
            setLoading(true);
            console.log("Subscription approved, ID:", data.subscriptionID);
            
            // Store subscription ID for display in modal
            setSubscriptionId(data.subscriptionID);

            const response = await fetch('http://localhost:5000/api/paypal/create-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                subscriptionId: data.subscriptionID
              }),
              credentials: 'include',
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Server responded with status ${response.status}: ${errorText}`);
            }

            const subscriptionData = await response.json();

            if (subscriptionData.success) {
              setPaymentSuccess(true);
              setShowPaymentOptions(false);
              setShowModal(true); // Show success modal
            } else {
              console.error('Subscription creation failed:', subscriptionData);
            }
          } catch (error) {
            console.error('Error processing subscription:', error);
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

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
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
      
      {/* Subscription Success Modal */}
      <SubscriptionModal 
        isOpen={showModal}
        onClose={closeModal}
        email={user?.email || ""}
        subscriptionId={subscriptionId}
        onGoToDashboard={handleGoToDashboard}
      />
    </>
  );
};

export default PricingPage;