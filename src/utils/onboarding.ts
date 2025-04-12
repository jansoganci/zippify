/**
 * Onboarding utility functions for tracking user progress
 * Uses localStorage to persist completion status
 */

// Keys for localStorage
const ONBOARDING_KEY_PREFIX = 'zippify_onboarding_';
const PROFILE_COMPLETE_KEY = `${ONBOARDING_KEY_PREFIX}profile_complete`;
const KEYWORD_ANALYSIS_KEY = `${ONBOARDING_KEY_PREFIX}ran_keyword_analysis`;
const LISTING_CREATED_KEY = `${ONBOARDING_KEY_PREFIX}created_listing`;
const IMAGE_EDITED_KEY = `${ONBOARDING_KEY_PREFIX}edited_image`;

// Step definitions
export const ONBOARDING_STEPS = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Fill in your profile from the top-right menu',
    storageKey: PROFILE_COMPLETE_KEY,
  },
  {
    id: 'keyword',
    title: 'Run your first keyword analysis',
    description: 'Find the best keywords for your Etsy listings',
    storageKey: KEYWORD_ANALYSIS_KEY,
  },
  {
    id: 'listing',
    title: 'Create your first listing',
    description: 'Generate an AI-powered Etsy listing',
    storageKey: LISTING_CREATED_KEY,
  },
  {
    id: 'image',
    title: 'Edit your first product image',
    description: 'Enhance your product photos with AI',
    storageKey: IMAGE_EDITED_KEY,
  },
];

/**
 * Get the completion status of a specific onboarding step
 */
export const isStepComplete = (stepId: string): boolean => {
  const step = ONBOARDING_STEPS.find(s => s.id === stepId);
  if (!step) return false;
  
  return localStorage.getItem(step.storageKey) === 'true';
};

/**
 * Mark a specific onboarding step as complete
 */
export const completeStep = (stepId: string): void => {
  const step = ONBOARDING_STEPS.find(s => s.id === stepId);
  if (!step) return;
  
  localStorage.setItem(step.storageKey, 'true');
};

/**
 * Reset a specific onboarding step (mark as incomplete)
 */
export const resetStep = (stepId: string): void => {
  const step = ONBOARDING_STEPS.find(s => s.id === stepId);
  if (!step) return;
  
  localStorage.removeItem(step.storageKey);
};

/**
 * Get all onboarding steps with their completion status
 */
export const getOnboardingProgress = (): Array<{ 
  id: string; 
  title: string; 
  description: string; 
  completed: boolean; 
}> => {
  return ONBOARDING_STEPS.map(step => ({
    ...step,
    completed: isStepComplete(step.id),
  }));
};

/**
 * Calculate the overall onboarding progress percentage
 */
export const getProgressPercentage = (): number => {
  const completedSteps = ONBOARDING_STEPS.filter(step => 
    localStorage.getItem(step.storageKey) === 'true'
  ).length;
  
  return Math.round((completedSteps / ONBOARDING_STEPS.length) * 100);
};

/**
 * Check if all onboarding steps are complete
 */
export const isOnboardingComplete = (): boolean => {
  return ONBOARDING_STEPS.every(step => 
    localStorage.getItem(step.storageKey) === 'true'
  );
};
