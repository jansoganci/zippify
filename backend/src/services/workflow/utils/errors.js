/**
 * Custom error class for workflow-related errors
 */
export class WorkflowError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'WorkflowError';
    this.step = options.step || null;
    this.code = options.code || 'WORKFLOW_ERROR';
    this.recoverable = options.recoverable || false;
    this.metadata = options.metadata || {};
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error codes for specific scenarios
 */
export const ErrorCodes = {
  // API Related
  API_ERROR: 'API_ERROR',
  API_TIMEOUT: 'API_TIMEOUT',
  API_RATE_LIMIT: 'API_RATE_LIMIT',
  INVALID_API_RESPONSE: 'INVALID_API_RESPONSE',
  
  // Input Related
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Workflow Related
  STEP_FAILED: 'STEP_FAILED',
  WORKFLOW_FAILED: 'WORKFLOW_FAILED',
  
  // System Related
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  FILE_SYSTEM_ERROR: 'FILE_SYSTEM_ERROR'
};

/**
 * Helper function to create API errors
 */
export const createApiError = (message, metadata = {}) => {
  return new WorkflowError(message, {
    code: ErrorCodes.API_ERROR,
    recoverable: true,
    metadata
  });
};

/**
 * Helper function to create validation errors
 */
export const createValidationError = (message, field) => {
  return new WorkflowError(message, {
    code: ErrorCodes.INVALID_INPUT,
    recoverable: false,
    metadata: { field }
  });
};

/**
 * Helper function to create workflow step errors
 */
export const createStepError = (step, message, recoverable = true) => {
  return new WorkflowError(message, {
    code: ErrorCodes.STEP_FAILED,
    step,
    recoverable,
    metadata: { step }
  });
};

/**
 * Helper function to determine if an error is recoverable
 */
export const isRecoverableError = (error) => {
  if (error instanceof WorkflowError) {
    return error.recoverable;
  }
  
  // Default error handling for non-workflow errors
  if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }
  
  return false;
};
