import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

const { FiUser, FiCpu, FiZap } = FiIcons;

const ChatMessage = ({ message }) => {
  const isUser = message.type === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-100' : message.isAI ? 'bg-green-100' : 'bg-slate-100'
      }`}>
        <SafeIcon 
          icon={isUser ? FiUser : message.isAI ? FiZap : FiCpu} 
          className={`text-sm ${
            isUser ? 'text-blue-600' : message.isAI ? 'text-green-600' : 'text-slate-600'
          }`} 
        />
      </div>

      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-3 rounded-lg ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : message.isAI
            ? 'bg-green-50 text-slate-800 border border-green-200'
            : 'bg-slate-100 text-slate-800'
        }`}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
        
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <p className="text-xs text-slate-500">
            {format(message.timestamp, 'HH:mm')}
          </p>
          {!isUser && message.isAI && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-100 rounded-full">
              <SafeIcon icon={FiZap} className="text-green-600 text-xs" />
              <span className="text-xs font-medium text-green-700">AI</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;