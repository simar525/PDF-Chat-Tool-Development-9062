import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe - Replace with your publishable key
const stripePromise = loadStripe('pk_test_51234567890abcdef...');

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: [
      '3 PDF uploads per month',
      'Basic chat responses',
      '10 questions per PDF',
      'Standard support'
    ],
    limits: {
      monthlyUploads: 3,
      questionsPerPDF: 10,
      aiResponses: false,
      prioritySupport: false
    }
  },
  PREMIUM: {
    id: 'price_premium_monthly', // Replace with your Stripe price ID
    name: 'Premium',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited PDF uploads',
      'AI-powered responses (OpenAI)',
      'Unlimited questions',
      'Priority support',
      'Advanced analytics',
      'Export conversations'
    ],
    limits: {
      monthlyUploads: -1, // unlimited
      questionsPerPDF: -1, // unlimited
      aiResponses: true,
      prioritySupport: true
    }
  },
  PRO: {
    id: 'price_pro_monthly', // Replace with your Stripe price ID
    name: 'Pro',
    price: 19.99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Everything in Premium',
      'API access',
      'Custom AI models',
      'Team collaboration',
      'Advanced integrations',
      'White-label options'
    ],
    limits: {
      monthlyUploads: -1,
      questionsPerPDF: -1,
      aiResponses: true,
      prioritySupport: true,
      apiAccess: true,
      teamFeatures: true
    }
  }
};

// Create Stripe checkout session
export const createCheckoutSession = async (priceId, successUrl, cancelUrl) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        successUrl,
        cancelUrl,
      }),
    });

    const session = await response.json();
    
    if (session.error) {
      throw new Error(session.error);
    }

    const stripe = await stripePromise;
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};

// Create billing portal session
export const createBillingPortalSession = async (customerId) => {
  try {
    const response = await fetch('/api/create-billing-portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
      }),
    });

    const session = await response.json();
    
    if (session.error) {
      throw new Error(session.error);
    }

    window.location.href = session.url;
  } catch (error) {
    console.error('Billing portal error:', error);
    throw error;
  }
};

// Get user subscription status
export const getUserSubscription = async (userId) => {
  try {
    const response = await fetch(`/api/subscription/${userId}`);
    const subscription = await response.json();
    return subscription;
  } catch (error) {
    console.error('Get subscription error:', error);
    return null;
  }
};

// Check if user has access to feature
export const hasFeatureAccess = (subscription, feature) => {
  if (!subscription || subscription.status !== 'active') {
    return SUBSCRIPTION_PLANS.FREE.limits[feature] !== undefined 
      ? SUBSCRIPTION_PLANS.FREE.limits[feature] 
      : false;
  }

  const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === subscription.priceId);
  if (!plan) return false;

  return plan.limits[feature] !== undefined ? plan.limits[feature] : false;
};

// Check usage limits
export const checkUsageLimit = (subscription, usage, limitType) => {
  let limit;
  
  if (!subscription || subscription.status !== 'active') {
    limit = SUBSCRIPTION_PLANS.FREE.limits[limitType];
  } else {
    const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === subscription.priceId);
    limit = plan ? plan.limits[limitType] : SUBSCRIPTION_PLANS.FREE.limits[limitType];
  }

  if (limit === -1) return { allowed: true, remaining: -1 }; // unlimited
  
  const remaining = Math.max(0, limit - usage);
  return { 
    allowed: remaining > 0, 
    remaining,
    limit 
  };
};

export default stripePromise;