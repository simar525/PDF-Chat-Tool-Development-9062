import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiKey, FiCpu, FiCheck, FiAlertCircle } = FiIcons;

const OPENAI_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Most advanced model with vision capabilities' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Faster and more affordable' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'High performance with large context' },
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model for complex tasks' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' }
];

const SettingsModal = ({ isOpen, onClose, settings, onSaveSettings }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    if (settings) {
      setApiKey(settings.apiKey || '');
      setSelectedModel(settings.model || 'gpt-4o');
    }
  }, [settings]);

  const handleSave = () => {
    const newSettings = {
      apiKey: apiKey.trim(),
      model: selectedModel,
      hasValidKey: !!apiKey.trim()
    };
    
    onSaveSettings(newSettings);
    setConnectionStatus(null);
    onClose();
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionStatus({ success: false, message: 'Please enter an API key first' });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setConnectionStatus({ success: true, message: 'Connection successful!' });
      } else {
        setConnectionStatus({ success: false, message: 'Invalid API key or connection failed' });
      }
    } catch (error) {
      setConnectionStatus({ success: false, message: 'Failed to connect to OpenAI' });
    } finally {
      setTestingConnection(false);
    }
  };

  const maskApiKey = (key) => {
    if (!key || key.length < 8) return key;
    return key.substring(0, 7) + '...' + key.substring(key.length - 4);
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SafeIcon icon={FiKey} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">OpenAI Settings</h2>
                <p className="text-sm text-slate-600">Configure your API key and preferred model</p>
              </div>
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

          <div className="p-6 space-y-6">
            {/* API Key Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-3 pr-24 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={testConnection}
                      disabled={testingConnection || !apiKey.trim()}
                      className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded transition-colors disabled:cursor-not-allowed"
                    >
                      {testingConnection ? 'Testing...' : 'Test'}
                    </motion.button>
                  </div>
                </div>
                
                {/* Connection Status */}
                {connectionStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 mt-2 p-2 rounded-lg text-sm ${
                      connectionStatus.success 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    <SafeIcon 
                      icon={connectionStatus.success ? FiCheck : FiAlertCircle} 
                      className="flex-shrink-0" 
                    />
                    <span>{connectionStatus.message}</span>
                  </motion.div>
                )}

                <p className="text-xs text-slate-500 mt-2">
                  Get your API key from{' '}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>

              {/* Current API Key Display */}
              {settings?.apiKey && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Current API Key</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {maskApiKey(settings.apiKey)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <SafeIcon icon={FiCheck} className="text-sm" />
                      <span className="text-xs">Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Model
                </label>
                <div className="space-y-2">
                  {OPENAI_MODELS.map((model) => (
                    <motion.div
                      key={model.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedModel === model.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      onClick={() => setSelectedModel(model.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedModel === model.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-slate-300'
                          }`}>
                            {selectedModel === model.id && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800">{model.name}</h4>
                            <p className="text-sm text-slate-600">{model.description}</p>
                          </div>
                        </div>
                        <SafeIcon icon={FiCpu} className="text-slate-400" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <SafeIcon icon={FiAlertCircle} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">Important Notes:</p>
                  <ul className="text-blue-700 space-y-1 text-xs">
                    <li>• Your API key is stored locally in your browser</li>
                    <li>• Different models have different capabilities and pricing</li>
                    <li>• GPT-4o is recommended for best results</li>
                    <li>• Test your connection before saving</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Settings
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;