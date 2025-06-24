import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { SUBSCRIPTION_PLANS, createCheckoutSession } from '../utils/stripe';

const { FiX, FiCrown, FiCheck, FiZap, FiStar, FiCreditCard, FiLoader } = FiIcons;

const SubscriptionModal = ({ isOpen, onClose, currentPlan = 'free', onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('PREMIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async (planId) => {
    setLoading(true);
    setError('');

    try {
      const plan = SUBSCRIPTION_PLANS[planId];
      const successUrl = `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/cancel`;

      await createCheckoutSession(plan.id, successUrl, cancelUrl);
    } catch (err) {
      setError('Failed to start checkout. Please try again.');
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planKey) => {
    switch (planKey) {
      case 'FREE': return FiStar;
      case 'PREMIUM': return FiCrown;
      case 'PRO': return FiZap;
      default: return FiStar;
    }
  };

  const getPlanColor = (planKey) => {
    switch (planKey) {
      case 'FREE': return 'slate';
      case 'PREMIUM': return 'blue';
      case 'PRO': return 'purple';
      default: return 'slate';
    }
  };

  const isCurrentPlan = (planKey) => {
    return currentPlan.toLowerCase() === planKey.toLowerCase();
  };

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
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <SafeIcon icon={FiCrown} className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Choose Your Plan</h2>
                <p className="text-slate-600">Unlock the full potential of Chat with PDF</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <SafeIcon icon={FiX} className="text-slate-500 text-xl" />
            </motion.button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Plans Grid */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
                const Icon = getPlanIcon(key);
                const color = getPlanColor(key);
                const isCurrent = isCurrentPlan(key);
                const isPopular = key === 'PREMIUM';

                return (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-6 border-2 rounded-xl transition-all ${
                      selectedPlan === key
                        ? `border-${color}-500 bg-${color}-50`
                        : `border-slate-200 hover:border-${color}-300 bg-white`
                    } ${isPopular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                    onClick={() => setSelectedPlan(key)}
                  >
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Current Plan Badge */}
                    {isCurrent && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Current Plan
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`inline-flex p-3 bg-${color}-100 rounded-full mb-4`}>
                        <SafeIcon icon={Icon} className={`text-${color}-600 text-2xl`} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-slate-800">
                          ${plan.price}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-slate-500">/{plan.interval}</span>
                        )}
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <SafeIcon icon={FiCheck} className={`text-${color}-600 flex-shrink-0`} />
                          <span className="text-sm text-slate-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => !isCurrent && handleUpgrade(key)}
                      disabled={loading || isCurrent || key === 'FREE'}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:cursor-not-allowed ${
                        isCurrent
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : key === 'FREE'
                          ? 'bg-slate-100 text-slate-500 cursor-default'
                          : selectedPlan === key
                          ? `bg-${color}-600 hover:bg-${color}-700 text-white`
                          : `bg-${color}-100 hover:bg-${color}-200 text-${color}-700`
                      }`}
                    >
                      {loading && selectedPlan === key ? (
                        <div className="flex items-center justify-center gap-2">
                          <SafeIcon icon={FiLoader} className="animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : key === 'FREE' ? (
                        'Always Free'
                      ) : (
                        <>
                          <SafeIcon icon={FiCreditCard} className="inline mr-2" />
                          Subscribe Now
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Features Comparison */}
          <div className="px-6 pb-6">
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Why Upgrade?</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <SafeIcon icon={FiZap} className="text-blue-600" />
                  <span className="text-slate-700">AI-powered responses with OpenAI integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <SafeIcon icon={FiCrown} className="text-purple-600" />
                  <span className="text-slate-700">Unlimited PDF uploads and questions</span>
                </div>
                <div className="flex items-center gap-3">
                  <SafeIcon icon={FiStar} className="text-yellow-600" />
                  <span className="text-slate-700">Priority customer support</span>
                </div>
                <div className="flex items-center gap-3">
                  <SafeIcon icon={FiCheck} className="text-green-600" />
                  <span className="text-slate-700">Advanced analytics and insights</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 rounded-b-xl text-center text-xs text-slate-500">
            <p>Secure payments powered by Stripe • Cancel anytime • 30-day money-back guarantee</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionModal;