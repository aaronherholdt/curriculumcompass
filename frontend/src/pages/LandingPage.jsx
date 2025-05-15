import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Book, CheckCheck } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="w-full">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 bg-opacity-70 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">Curriculum Compass</h1>
        </div>
        <div className="flex items-center space-x-6">
          <a href="#how-it-works" className="text-white hover:text-gray-200">How It Works</a>
          <a href="#about" className="text-white hover:text-gray-200">About</a>
          <Link 
            to="/login" 
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
            font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center py-20 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Personalized Homeschool Curriculum In Minutes
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-gray-300 mb-8"
        >
          Create customized lesson plans tailored to your child's interests, learning style, and educational needs.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-4 justify-center"
        >
          <Link 
            to="/signup" 
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
            font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900
            inline-flex items-center text-lg"
          >
            Sign Up
          </Link>
          <Link 
            to="/create-profile" 
            className="px-6 py-3 bg-gray-700 text-white 
            font-medium rounded-lg shadow-md hover:bg-gray-600
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900
            inline-flex items-center text-lg"
          >
            Try it for free
          </Link>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gray-900 bg-opacity-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 bg-opacity-50 p-6 rounded-xl border border-gray-700"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-center text-white mb-3">Create Child Profile</h3>
              <p className="text-gray-300 text-center">
                Enter your child's grade level and interests to generate customized keywords for curriculum search.
              </p>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 bg-opacity-50 p-6 rounded-xl border border-gray-700"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-center text-white mb-3">Search Curriculum</h3>
              <p className="text-gray-300 text-center">
                Our system searches the web for relevant educational resources based on your child's profile.
              </p>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-800 bg-opacity-50 p-6 rounded-xl border border-gray-700"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-center text-white mb-3">Generate Lesson Plan</h3>
              <p className="text-gray-300 text-center">
                Receive a personalized daily lesson plan that you can download, print, or save for later use.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-12">Features</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex p-4"
            >
              <div className="mr-4 mt-1">
                <CheckCheck className="text-green-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">Personalized Learning</h3>
                <p className="text-gray-300">
                  Curriculum tailored to your child's unique learning style, interests, and educational needs.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex p-4"
            >
              <div className="mr-4 mt-1">
                <CheckCheck className="text-green-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">Multiple Children</h3>
                <p className="text-gray-300">
                  Create and manage profiles for all your children, each with their own custom curriculum.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex p-4"
            >
              <div className="mr-4 mt-1">
                <CheckCheck className="text-green-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">Downloadable Lesson Plans</h3>
                <p className="text-gray-300">
                  Save, print, or share detailed lesson plans complete with resources and activities.
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex p-4"
            >
              <div className="mr-4 mt-1">
                <CheckCheck className="text-green-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">Time-Saving</h3>
                <p className="text-gray-300">
                  Create comprehensive curriculum in minutes instead of hours of research and planning.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-900 bg-opacity-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-8">About Us</h2>
          
          <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl border border-gray-700">
            <p className="text-gray-300 mb-4">
              Curriculum Compass was created by parents, for parents. We understand the challenges of homeschooling and the desire to provide the best educational experience for your children.
            </p>
            <p className="text-gray-300 mb-4">
              Our platform uses advanced technology to match your child's learning style, interests, and educational needs with appropriate teaching materials and resources from across the web.
            </p>
            <p className="text-gray-300">
              We believe that education should be personalized, engaging, and effective. Our mission is to empower homeschooling parents with the tools they need to create exceptional learning experiences.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 bg-opacity-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Ready to transform your homeschooling experience?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-300 mb-8"
          >
            Join thousands of parents who are creating engaging, personalized learning experiences.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              to="/create-profile" 
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
              font-medium rounded-lg shadow-md hover:from-green-600 hover:to-emerald-700
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Get Started For Free
            </Link>
            
            <Link 
              to="/pricing" 
              className="px-6 py-3 bg-gray-700 text-white 
              font-medium rounded-lg shadow-md hover:bg-gray-600
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              View Pricing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-2">Curriculum Compass</h3>
              <p className="text-gray-400">Your guide to personalized homeschool education.</p>
            </div>
            
            <div className="flex gap-4">
              <Link to="/login" className="text-gray-400 hover:text-white">Login</Link>
              <Link to="/signup" className="text-gray-400 hover:text-white">Sign Up</Link>
              <Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500">© {new Date().getFullYear()} Curriculum Compass. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 