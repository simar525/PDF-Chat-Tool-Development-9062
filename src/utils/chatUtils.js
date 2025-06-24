import { searchInText } from './pdfUtils';
import OpenAI from 'openai';

// OpenAI API integration
export const generateOpenAIResponse = async (question, pdfText, apiKey, model = 'gpt-4o') => {
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
    });

    // Truncate PDF text if it's too long (to stay within token limits)
    const maxContentLength = 8000; // Adjust based on model limits
    const truncatedText = pdfText.length > maxContentLength 
      ? pdfText.substring(0, maxContentLength) + "...[content truncated]"
      : pdfText;

    const systemPrompt = `You are an AI assistant that helps users understand PDF documents. You have access to the content of a PDF document and should answer questions based on that content.

Guidelines:
- Provide accurate, helpful responses based on the PDF content
- If information isn't in the document, clearly state that
- Use specific quotes or references when possible
- Be concise but thorough
- If asked to summarize, focus on key points
- For factual questions, provide specific details from the document`;

    const userPrompt = `Based on the following PDF content, please answer this question: "${question}"

PDF Content:
${truncatedText}

Please provide a helpful and accurate response based on the document content.`;

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.3, // Lower temperature for more focused responses
    });

    return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI API key in settings.');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.status === 500) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
    } else {
      throw new Error('Failed to get AI response. Please try again.');
    }
  }
};

// Fallback mock response generator (existing function)
export const generateResponse = async (question, pdfText) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  const questionLower = question.toLowerCase();
  
  // Search for relevant content in the PDF
  const relevantSentences = searchInText(pdfText, question);
  
  // Generate contextual responses based on question type
  if (questionLower.includes('summary') || questionLower.includes('summarize')) {
    return generateSummary(pdfText);
  }
  
  if (questionLower.includes('main topic') || questionLower.includes('about')) {
    return generateTopicResponse(pdfText);
  }
  
  if (questionLower.includes('conclusion') || questionLower.includes('conclude')) {
    return generateConclusionResponse(pdfText);
  }
  
  if (questionLower.includes('date') || questionLower.includes('when') || questionLower.includes('number')) {
    return generateFactualResponse(pdfText, questionLower);
  }

  if (questionLower.includes('methodology') || questionLower.includes('method')) {
    return generateMethodologyResponse(pdfText);
  }

  if (questionLower.includes('finding') || questionLower.includes('result')) {
    return generateFindingsResponse(pdfText);
  }
  
  // Default response with relevant content
  if (relevantSentences.length > 0) {
    return `Based on the document, here's what I found related to your question:\n\n${relevantSentences.slice(0, 3).join('\n\n')}\n\nWould you like me to elaborate on any specific aspect? For more detailed and accurate responses, consider adding your OpenAI API key in settings.`;
  }
  
  return `I searched through the document but couldn't find specific information directly related to "${question}". Could you try rephrasing your question or asking about a different aspect of the document?\n\nNote: For more intelligent responses, you can add your OpenAI API key in the settings.`;
};

const generateSummary = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keySentences = sentences.slice(0, 5).join('. ');
  
  return `Here's a summary of the main points from the document:\n\n${keySentences}.\n\nThis summary covers the key themes and important information from the text. Would you like me to focus on any particular section?`;
};

const generateTopicResponse = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = {};
  
  // Count word frequency (excluding common words)
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
  
  words.forEach(word => {
    if (word.length > 3 && !commonWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const topWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
  
  return `Based on my analysis, this document appears to focus on topics related to: ${topWords.join(', ')}.\n\nThe content discusses these themes throughout the text. Would you like me to elaborate on any of these topics?`;
};

const generateConclusionResponse = (text) => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const lastSentences = sentences.slice(-5).join('. ');
  
  return `Looking at the concluding sections of the document:\n\n${lastSentences}.\n\nThese appear to be the main conclusions or final points made in the document. Is there a specific conclusion you'd like me to explain further?`;
};

const generateFactualResponse = (text, question) => {
  // Look for numbers, dates, and specific facts
  const numbers = text.match(/\d+/g) || [];
  const dates = text.match(/\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/g) || [];
  
  let response = "Here are some key facts and figures I found in the document:\n\n";
  
  if (dates.length > 0) {
    response += `Important dates mentioned: ${dates.slice(0, 5).join(', ')}\n\n`;
  }
  
  if (numbers.length > 0) {
    response += `Notable numbers: ${numbers.slice(0, 10).join(', ')}\n\n`;
  }
  
  response += "Would you like me to provide more context about any of these specific details?";
  
  return response;
};

const generateMethodologyResponse = (text) => {
  const methodKeywords = ['method', 'approach', 'technique', 'procedure', 'process', 'analysis', 'study', 'research'];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  const methodSentences = sentences.filter(sentence => 
    methodKeywords.some(keyword => 
      sentence.toLowerCase().includes(keyword)
    )
  ).slice(0, 3);
  
  if (methodSentences.length > 0) {
    return `Based on the document, here are the methodological approaches mentioned:\n\n${methodSentences.join('\n\n')}\n\nThese sections describe the methods and approaches used in the document.`;
  }
  
  return `I couldn't find explicit methodology sections in this document. The document may not contain detailed methodological information, or it might be structured differently. Would you like me to search for specific research approaches or techniques?`;
};

const generateFindingsResponse = (text) => {
  const findingKeywords = ['result', 'finding', 'conclusion', 'outcome', 'discovered', 'showed', 'demonstrated', 'revealed'];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  const findingSentences = sentences.filter(sentence => 
    findingKeywords.some(keyword => 
      sentence.toLowerCase().includes(keyword)
    )
  ).slice(0, 3);
  
  if (findingSentences.length > 0) {
    return `Here are the key findings and results from the document:\n\n${findingSentences.join('\n\n')}\n\nThese represent the main discoveries or outcomes presented in the document.`;
  }
  
  return `I couldn't identify specific findings or results sections in this document. The document may present information differently, or the findings might be integrated throughout the text. Would you like me to look for specific outcomes or conclusions?`;
};