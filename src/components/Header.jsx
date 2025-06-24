import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import PlanBadge from './PlanBadge';
import * as FiIcons from 'react-icons/fi';

const { FiFileText, FiRefreshCw, FiSettings } = FiIcons;

const Header = ({ 
  fileName, 
  onReset, 
  onOpenSettings, 
  subscription, 
  onOpenSubscription 
}) => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <SafeIcon icon={FiFileText} className="text-blue-600 text-xl" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">Chat with PDF</h1>
            <PlanBadge 
              plan={subscription?.planName} 
              onClick={onOpenSubscription}
            />
          </div>
          {fileName && (
            <p className="text-sm text-slate-600 truncate max-w-96">{fileName}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <SafeIcon icon={FiSettings} className="text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Settings</span>
        </motion.button>

        {fileName && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiRefreshCw} className="text-slate-600" />
            <span className="text-sm font-medium text-slate-700">New PDF</span>
          </motion.button>
        )}
      </div>
    </motion.header>
  );
};

export default Header;