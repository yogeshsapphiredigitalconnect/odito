/**
 * STRIPE GATEKEEPING - CENTRALIZED PAYMENT UTILS
 * 
 * This file contains the ONLY place where Stripe checkout can be called.
 * No other files should directly call Stripe APIs.
 */

import API_BASE_URL from "@/lib/apiConfig";

const INTENT_KEY = 'odito_payment_intent';
const RESUME_ALLOWED_KEY = 'odito_payment_resume_allowed';

/**
 * Create a premium checkout session with Stripe
 * This is the ONLY function that can call Stripe checkout
 * 
 * @param {string} planType - 'premium_monthly' | 'premium_yearly'
 * @returns {Promise<void>}
 */
export async function createPremiumCheckout(planType) {
  try {
    const token = localStorage.getItem('token');
    const apiUrl = API_BASE_URL;
    
    if (!token) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(`${apiUrl}/payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        planType: planType,
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
        cancelUrl: `${window.location.origin}/payment/canceled`
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }
    
    const data = await response.json();
    
    if (!data.url) {
      throw new Error('Stripe checkout URL missing from response');
    }
    
    // Redirect to Stripe Checkout
    window.location.href = data.url;
  } catch (error) {
    console.error('Premium checkout failed:', error);
    throw error;
  }
}

/**
 * Payment Intent Management
 */

/**
 * Create and save a payment intent to localStorage
 * 
 * @param {Object} intentData - Intent configuration
 * @param {string} intentData.planType - 'premium_monthly' | 'premium_yearly'
 * @param {string} intentData.billingCycle - 'monthly' | 'yearly'
 * @param {string} intentData.planName - 'Premium'
 * @param {string} intentData.price - '$29/month' | '$290/year'
 */
export function savePaymentIntent(intentData) {
  const intent = {
    type: 'subscription',
    planType: intentData.planType,
    billingCycle: intentData.billingCycle,
    planName: intentData.planName,
    price: intentData.price,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
  };
  
  localStorage.setItem(INTENT_KEY, JSON.stringify(intent));
  // By default, payment resume is NOT allowed until explicit login
  localStorage.setItem(RESUME_ALLOWED_KEY, 'false');
  return intent;
}

/**
 * Get and validate payment intent from localStorage
 * 
 * @returns {Object|null} Valid intent object or null if invalid/expired
 */
export function getPaymentIntent() {
  try {
    const stored = localStorage.getItem(INTENT_KEY);
    if (!stored) return null;
    
    const intent = JSON.parse(stored);
    
    // Check expiration
    if (Date.now() > intent.expiresAt) {
      clearPaymentIntent();
      return null;
    }
    
    return intent;
  } catch (error) {
    console.error('Failed to parse payment intent:', error);
    clearPaymentIntent();
    return null;
  }
}

/**
 * Remove payment intent from localStorage
 */
export function clearPaymentIntent() {
  localStorage.removeItem(INTENT_KEY);
  localStorage.removeItem(RESUME_ALLOWED_KEY);
}

/**
 * Allow payment resume (call after successful login)
 */
export function allowPaymentResume() {
  localStorage.setItem(RESUME_ALLOWED_KEY, 'true');
}

/**
 * Disallow payment resume (call after signup, logout, etc.)
 */
export function disallowPaymentResume() {
  localStorage.setItem(RESUME_ALLOWED_KEY, 'false');
}

/**
 * Check if payment resume is allowed
 * 
 * @returns {boolean} True if payment resume is allowed
 */
export function isPaymentResumeAllowed() {
  return localStorage.getItem(RESUME_ALLOWED_KEY) === 'true';
}

/**
 * Check if a valid payment intent exists AND resume is allowed
 * 
 * @returns {boolean} True if valid intent exists and resume is allowed
 */
export function hasValidPaymentIntentWithResume() {
  return getPaymentIntent() !== null && isPaymentResumeAllowed();
}
