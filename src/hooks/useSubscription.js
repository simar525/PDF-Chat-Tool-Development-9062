import { useState, useEffect } from 'react';
import { getUserSubscription, checkUsageLimit } from '../utils/stripe';

export const useSubscription = (userId) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({
    monthlyUploads: 0,
    questionsAsked: 0
  });

  useEffect(() => {
    const loadSubscription = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const sub = await getUserSubscription(userId);
        setSubscription(sub);
        
        // Load usage data from localStorage for demo
        const savedUsage = localStorage.getItem(`usage_${userId}`);
        if (savedUsage) {
          setUsage(JSON.parse(savedUsage));
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [userId]);

  const updateUsage = (type, increment = 1) => {
    setUsage(prev => {
      const newUsage = {
        ...prev,
        [type]: prev[type] + increment
      };
      
      // Save to localStorage for demo
      if (userId) {
        localStorage.setItem(`usage_${userId}`, JSON.stringify(newUsage));
      }
      
      return newUsage;
    });
  };

  const checkLimit = (limitType) => {
    const currentUsage = usage[limitType] || 0;
    return checkUsageLimit(subscription, currentUsage, limitType);
  };

  const resetUsage = () => {
    const resetUsage = {
      monthlyUploads: 0,
      questionsAsked: 0
    };
    setUsage(resetUsage);
    
    if (userId) {
      localStorage.setItem(`usage_${userId}`, JSON.stringify(resetUsage));
    }
  };

  return {
    subscription,
    loading,
    usage,
    updateUsage,
    checkLimit,
    resetUsage,
    isSubscribed: subscription?.status === 'active',
    planName: subscription?.planName || 'Free'
  };
};