import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import ChatMessage from './ChatMessage';
import { generateResponse, generateOpenAIResponse } from '../utils/chatUtils';
import { hasFeatureAccess } from '../utils/stripe';

const { FiSend, FiMessageCircle, FiKey, FiZap, FiCrown } = FiIcons;

const ChatInterface = ({ 
  pdfText, 
  fileName, 
  openAISettings, 
  onOpenSettings,
  subscription,
  onLimitReached,
  checkQuestionLimit,
  onQuestionAsked
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      type: 'bot',
      content: `Hello! I've analyzed your PDF "${fileName}". Feel free to ask me any questions about its content, and I'll help you find the information you need.${
        openAISettings?.hasValidKey 
          ? ' I\'m powered by OpenAI for more accurate responses!' 
          : ' Add your OpenAI API key in settings for enhanced AI responses.'
      }`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [fileName, openAISettings?.hasValidKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Check question limit for current PDF
    if (checkQuestionLimit) {
      const limitCheck = checkQuestionLimit();
      if (!limitCheck.allowed) {
        onLimitReached('questionsPerPDF', limitCheck.limit - limitCheck.remaining, limitCheck.limit);
        return;
      }
    }

    // Check if user has access to AI responses
    const hasAIAccess = hasFeatureAccess(subscription, 'aiResponses');
    const useAI = openAISettings?.hasValidKey && hasAIAccess;

    if (openAISettings?.hasValidKey && !hasAIAccess) {
      onLimitReached('aiResponses', 0, 0);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Track question usage
    if (onQuestionAsked) {
      onQuestionAsked();
    }

    try {
      let response;
      
      if (useAI && openAISettings?.apiKey) {
        // Use OpenAI API for real AI responses
        response = await generateOpenAIResponse(
          inputValue, 
          pdfText, 
          openAISettings.apiKey, 
          openAISettings.model || 'gpt-4o'
        );
      } else {
        // Fallback to mock responses
        response = await generateResponse(inputValue, pdfText);
      }
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response,
        timestamp: new Date(),
        isAI: useAI
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: useAI
          ? 'Sorry, I encountered an error with the OpenAI API. Please check your API key and try again.'
          : 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "What is the main topic of this document?",
    "Can you summarize the key points?",
    "What are the conclusions?",
    "Are there any important dates or numbers mentioned?",
    "Explain the methodology used in this document",
    "What are the key findings or results?"
  ];

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  const hasAIAccess = hasFeatureAccess(subscription, 'aiResponses');
  const canUseAI = openAISettings?.hasValidKey && hasAIAccess;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <SafeIcon icon={FiMessageCircle} className="text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">AI Assistant</h3>
                {canUseAI ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                    <SafeIcon icon={FiZap} className="text-green-600 text-xs" />
                    <span className="text-xs font-medium text-green-700">
                      {openAISettings.model || 'GPT-4o'}
                    </span>
                  </div>
                ) : !hasAIAccess ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
                    <SafeIcon icon={FiCrown} className="text-purple-600 text-xs" />
                    <span className="text-xs font-medium text-purple-700">Premium Feature</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full">
                    <SafeIcon icon={FiKey} className="text-amber-600 text-xs" />
                    <span className="text-xs font-medium text-amber-700">Basic Mode</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-600">
                {canUseAI
                  ? 'Powered by OpenAI for enhanced responses'
                  : !hasAIAccess
                  ? 'Upgrade to Premium for AI-powered responses'
                  : 'Ask me anything about your PDF'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!hasAIAccess && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onLimitReached('aiResponses', 0, 0)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <SafeIcon icon={FiCrown} className="text-sm" />
                <span>Upgrade</span>
              </motion.button>
            )}
            
            {!openAISettings?.hasValidKey && hasAIAccess && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <SafeIcon icon={FiKey} className="text-sm" />
                <span>Add API Key</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-slate-500"
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span className="text-sm">
              {canUseAI ? 'AI is thinking...' : 'Processing your question...'}
            </span>
          </motion.div>
        )}

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-slate-600">Suggested questions:</p>
            <div className="grid gap-2">
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm text-slate-700"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                canUseAI
                  ? "Ask anything about your PDF... (powered by AI)"
                  : "Ask a question about your PDF..."
              }
              rows={1}
              className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:cursor-not-allowed ${
              canUseAI
                ? 'bg-green-600 hover:bg-green-700 disabled:bg-slate-300'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300'
            }`}
          >
            <SafeIcon icon={FiSend} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;