import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { extractTextFromPDF } from '../utils/pdfUtils';

const { FiUpload, FiFile, FiLoader } = FiIcons;

const PDFUpload = ({ onFileUpload, onLimitReached, checkUploadLimit }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      await processFile(pdfFile);
    } else {
      setError('Please upload a PDF file');
    }
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      await processFile(file);
    } else {
      setError('Please select a PDF file');
    }
  };

  const processFile = async (file) => {
    // Check upload limit before processing
    if (checkUploadLimit) {
      const limitCheck = checkUploadLimit();
      if (!limitCheck.allowed) {
        onLimitReached('monthlyUploads', limitCheck.limit - limitCheck.remaining, limitCheck.limit);
        return;
      }
    }

    setIsProcessing(true);
    setError('');

    try {
      const text = await extractTextFromPDF(file);
      if (text.trim()) {
        onFileUpload(file, text, file.name);
      } else {
        setError('Unable to extract text from this PDF. Please try another file.');
      }
    } catch (err) {
      setError('Error processing PDF. Please try again.');
      console.error('PDF processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6"
        >
          <SafeIcon icon={FiFile} className="text-blue-600 text-3xl" />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Upload Your PDF</h2>
        <p className="text-slate-600">Drag and drop your PDF file or click to browse</p>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="text-center">
            <SafeIcon icon={FiLoader} className="text-blue-600 text-4xl mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Processing your PDF...</p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <SafeIcon icon={FiUpload} className="text-slate-400 text-4xl mx-auto mb-4" />
              <p className="text-lg text-slate-700 mb-2">
                {isDragging ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
              </p>
              <p className="text-slate-500 mb-6">or</p>
              <motion.label
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
              >
                <SafeIcon icon={FiFile} />
                <span>Browse Files</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </motion.label>
            </div>
          </>
        )}
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-600 text-center">{error}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center text-sm text-slate-500"
      >
        <p>Supported format: PDF • Max file size: 10MB</p>
      </motion.div>
    </motion.div>
  );
};

export default PDFUpload;