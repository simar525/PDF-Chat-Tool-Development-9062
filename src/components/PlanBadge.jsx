import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiStar, FiCrown, FiZap } = FiIcons;

const PlanBadge = ({ plan, onClick, className = '' }) => {
  const getPlanConfig = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'premium':
        return {
          icon: FiCrown,
          color: 'blue',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'pro':
        return {
          icon: FiZap,
          color: 'purple',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          icon: FiStar,
          color: 'slate',
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-700',
          borderColor: 'border-slate-200'
        };
    }
  };

  const config = getPlanConfig(plan);
  const displayPlan = plan || 'Free';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
        config.bgColor
      } ${config.textColor} ${config.borderColor} hover:shadow-sm ${className}`}
    >
      <SafeIcon icon={config.icon} className="text-sm" />
      <span className="text-sm font-medium">{displayPlan}</span>
      {displayPlan.toLowerCase() !== 'free' && (
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
      )}
    </motion.button>
  );
};

export default PlanBadge;