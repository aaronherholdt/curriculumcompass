// components/ScrapeLimit.tsx
import React from 'react';
import Link from 'next/link';

interface ScrapeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScrapeLimitModal: React.FC<ScrapeLimitModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search Limit Reached</h3>
          <p className="text-sm text-gray-500 mb-6">
            You've used all 2 of your free curriculum searches. Sign up to enjoy unlimited searches and additional features.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/signup" className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Sign Up Now
            </Link>
            <button
              onClick={onClose}
              className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              By signing up, you'll get:
            </p>
            <ul className="mt-2 text-sm text-gray-600 text-left pl-4 space-y-1">
              <li>• Unlimited curriculum searches</li>
              <li>• Save and organize lesson plans</li>
              <li>• Advanced customization options</li>
              <li>• Regular content updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrapeLimitModal;