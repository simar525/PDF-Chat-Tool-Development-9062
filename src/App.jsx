import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PDFUpload from './components/PDFUpload';
import PDFViewer from './components/PDFViewer';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import SubscriptionModal from './components/SubscriptionModal';
import UsageLimitModal from './components/UsageLimitModal';
import { useSubscription } from './hooks/useSubscription';
import './App.css';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfText, setPdfText] = useState('');
  const [fileName, setFileName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showUsageLimit, setShowUsageLimit] = useState(false);
  const [usageLimitInfo, setUsageLimitInfo] = useState({});
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [openAISettings, setOpenAISettings] = useState({
    apiKey: '',
    model: 'gpt-4o',
    hasValidKey: false
  });

  // Demo user ID - in real app, this would come from authentication
  const userId = 'demo-user-123';
  const {
    subscription,
    loading,
    usage,
    updateUsage,
    checkLimit,
    isSubscribed,
    planName
  } = useSubscription(userId);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('openai-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setOpenAISettings(parsed);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleFileUpload = (file, text, name) => {
    setPdfFile(file);
    setPdfText(text);
    setFileName(name);
    setQuestionsAsked(0); // Reset questions count for new PDF
    updateUsage('monthlyUploads', 1);
  };

  const handleReset = () => {
    setPdfFile(null);
    setPdfText('');
    setFileName('');
    setQuestionsAsked(0);
  };

  const handleSaveSettings = (newSettings) => {
    setOpenAISettings(newSettings);
    localStorage.setItem('openai-settings', JSON.stringify(newSettings));
  };

  const handleQuestionAsked = () => {
    setQuestionsAsked(prev => prev + 1);
  };

  const handleLimitReached = (limitType, currentUsage, limit) => {
    setUsageLimitInfo({
      limitType,
      currentUsage,
      limit
    });
    setShowUsageLimit(true);
  };

  const checkUploadLimit = () => {
    return checkLimit('monthlyUploads');
  };

  const checkQuestionLimit = () => {
    // For questions per PDF, we use the local counter
    const limit = isSubscribed ? -1 : 10; // 10 questions for free users, unlimited for subscribers
    if (limit === -1) return { allowed: true, remaining: -1 };
    
    const remaining = Math.max(0, limit - questionsAsked);
    return { 
      allowed: remaining > 0, 
      remaining,
      limit 
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header 
        fileName={fileName} 
        onReset={handleReset} 
        onOpenSettings={() => setShowSettings(true)}
        subscription={{ planName }}
        onOpenSubscription={() => setShowSubscription(true)}
      />
      
      <main className="h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          {!pdfFile ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex items-center justify-center p-8"
            >
              <PDFUpload 
                onFileUpload={handleFileUpload}
                onLimitReached={handleLimitReached}
                checkUploadLimit={checkUploadLimit}
              />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex"
            >
              <div className="w-1/2 border-r border-slate-200">
                <PDFViewer file={pdfFile} />
              </div>
              <div className="w-1/2">
                <ChatInterface 
                  pdfText={pdfText} 
                  fileName={fileName}
                  openAISettings={openAISettings}
                  onOpenSettings={() => setShowSettings(true)}
                  subscription={subscription}
                  onLimitReached={handleLimitReached}
                  checkQuestionLimit={checkQuestionLimit}
                  onQuestionAsked={handleQuestionAsked}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={openAISettings}
        onSaveSettings={handleSaveSettings}
      />

      <SubscriptionModal
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        currentPlan={planName}
        onUpgrade={() => {
          // Handle successful upgrade
          setShowSubscription(false);
        }}
      />

      <UsageLimitModal
        isOpen={showUsageLimit}
        onClose={() => setShowUsageLimit(false)}
        limitType={usageLimitInfo.limitType}
        currentUsage={usageLimitInfo.currentUsage}
        limit={usageLimitInfo.limit}
        onUpgrade={() => setShowSubscription(true)}
      />
    </div>
  );
}

export default App;