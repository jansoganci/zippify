import { optimizePattern } from './optimizePattern.js';
import { generatePDF } from './generatePDF.js';
import { generateEtsyListing } from './generateEtsyListing.js';
import logger from './utils/browserLogger.js';
import { WorkflowError, createStepError, isRecoverableError } from './utils/errors.js';

/**
 * Controls the workflow for processing knitting patterns
 */
class WorkflowController {
  constructor() {
    this.steps = {
      pattern_optimization: optimizePattern,
      pdf_generation: generatePDF,
      etsy_listing: generateEtsyListing
    };
    
    this.results = {
      pattern_optimization: null,
      pdf_generation: null,
      etsy_listing: null
    };

    // Create a unique workflow ID for this instance
    this.workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    logger.info(`Created new workflow instance`, { workflowId: this.workflowId });
  }

  /**
   * Validates input data for a step
   */
  validateStepInput(step, input) {
    switch (step) {
      case 'pattern_optimization':
        if (!input || typeof input !== 'string') {
          throw createStepError(step, 'Pattern must be a non-empty string', false);
        }
        break;

      case 'pdf_generation':
        if (!input?.optimizedPattern) {
          throw createStepError(step, 'Missing optimized pattern from previous step', false);
        }
        break;

      case 'etsy_listing':
        if (!input?.pdfContent) {
          throw createStepError(step, 'Missing PDF content from previous step', false);
        }
        break;

      default:
        throw createStepError(step, `Invalid step: ${step}`, false);
    }
  }

  /**
   * Runs a single step of the workflow
   */
  async runStep(step, input, options = {}) {
    try {
      logger.info(`Starting step: ${step}`, {
        workflowId: this.workflowId,
        step,
        options
      });

      // Validate step input
      this.validateStepInput(step, input);

      // Execute step
      const result = await this.steps[step](input, options);
      this.results[step] = result;

      logger.info(`Completed step: ${step}`, {
        workflowId: this.workflowId,
        step,
        success: result.success
      });

      return result;

    } catch (error) {
      const stepError = error instanceof WorkflowError ? error : createStepError(
        step,
        error.message,
        isRecoverableError(error)
      );

      logger.error(`Step failed: ${step}`, {
        workflowId: this.workflowId,
        step,
        error: stepError
      });

      this.results[step] = {
        success: false,
        error: stepError.message,
        recoverable: stepError.recoverable
      };

      throw stepError;
    }
  }

  /**
   * Runs the complete workflow from start to finish
   */
  async runFullWorkflow(data, options = {}) {
    logger.info('Starting workflow', {
      workflowId: this.workflowId,
      options
    });

    try {
      // Step 1: Pattern Optimization
      const optimizationResult = await this.runStep('pattern_optimization', data.pattern);
      if (!optimizationResult.success) {
        throw createStepError('pattern_optimization', optimizationResult.error, false);
      }

      // Step 2: PDF Generation
      const pdfResult = await this.runStep('pdf_generation', optimizationResult);
      
      // If PDF generation fails, try Etsy listing with optimized pattern
      let listingInput = pdfResult.success ? pdfResult : {
        pdfContent: optimizationResult.optimizedPattern
      };

      // Step 3: Etsy Listing Generation
      const listingResult = await this.runStep('etsy_listing', listingInput, options);
      
      // Etsy listing failure is considered a warning
      if (!listingResult.success) {
        logger.warn('Etsy listing generation failed but continuing', {
          workflowId: this.workflowId,
          error: listingResult.error
        });
      }

      const result = {
        success: true,
        results: this.results,
        completedAt: new Date().toISOString(),
        warnings: !listingResult.success ? [listingResult.error] : []
      };

      logger.info('Workflow completed successfully', {
        workflowId: this.workflowId,
        result
      });

      return result;

    } catch (error) {
      const workflowError = error instanceof WorkflowError ? error : new WorkflowError(
        'Workflow failed',
        {
          code: 'WORKFLOW_FAILED',
          recoverable: false,
          metadata: { originalError: error.message }
        }
      );

      logger.error('Workflow failed', {
        workflowId: this.workflowId,
        error: workflowError
      });

      return {
        success: false,
        error: workflowError.message,
        results: this.results,
        completedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Gets the current state of all steps
   */
  getState() {
    return {
      workflowId: this.workflowId,
      results: this.results,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Resets the workflow state
   */
  reset() {
    logger.info('Resetting workflow state', { workflowId: this.workflowId });
    
    this.results = {
      pattern_optimization: null,
      pdf_generation: null,
      etsy_listing: null
    };
  }
}

export default WorkflowController;
