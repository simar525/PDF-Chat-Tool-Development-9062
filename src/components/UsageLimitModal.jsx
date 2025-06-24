import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiAlertTriangle, FiCrown, FiArrowRight } = FiIcons;

const UsageLimitModal = ({ 
  isOpen, 
  onClose, 
  limitType, 
  currentUsage, 
  limit, 
  onUpgrade 
}) => {
  const getLimitMessage = () => {
    switch (limitType) {
      case 'monthlyUploads':
        return {
          title: 'Monthly Upload Limit Reached',
          message: `You've uploaded ${currentUsage} of ${limit} PDFs this month.`,
          suggestion: 'Upgrade to Premium for unlimited PDF uploads!'
        };
      case 'questionsPerPDF':
        return {
          title: 'Questions Limit Reached',
          message: `You've asked ${currentUsage} of ${limit} questions for this PDF.`,
          suggestion: 'Upgrade to Premium for unlimited questions!'
        };
      case 'aiResponses':
        return {
          title: 'AI Responses Not Available',
          message: 'AI-powered responses require a Premium subscription.',
          suggestion: 'Upgrade to unlock OpenAI integration and intelligent responses!'
        };
      default:
        return {
          title: 'Feature Limit Reached',
          message: 'This feature is not available in your current plan.',
          suggestion: 'Upgrade to Premium to unlock all features!'
        };
    }
  };

  const { title, message, suggestion } = getLimitMessage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <SafeIcon icon={FiAlertTriangle} className="text-amber-600 text-xl" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="text-slate-500" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-slate-600 mb-4">{message}</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <SafeIcon icon={FiCrown} className="text-blue-600" />
                <span className="font-semibold text-slate-800">Premium Benefits</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Unlimited PDF uploads</li>
                <li>• Unlimited questions per PDF</li>
                <li>• AI-powered responses with OpenAI</li>
                <li>• Priority support</li>
                <li>• Advanced analytics</li>
              </ul>
            </div>

            <p className="text-blue-600 font-medium text-center mb-6">
              {suggestion}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Maybe Later
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onUpgrade();
                  onClose();
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiCrown} />
                <span>Upgrade Now</span>
                <SafeIcon icon={FiArrowRight} />
              </motion.button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 rounded-b-xl text-center text-xs text-slate-500">
            30-day money-back guarantee • Cancel anytime
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UsageLimitModal;