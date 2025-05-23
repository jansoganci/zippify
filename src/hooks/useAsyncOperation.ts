import { useState, useCallback } from 'react';
import { toast } from './use-toast';

interface AsyncOperationOptions {
  successMessage?: string;
  errorPrefix?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

export function useAsyncOperation(options: AsyncOperationOptions = {}) {
  const {
    successMessage = 'Operation completed successfully',
    errorPrefix = 'Operation failed',
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const execute = useCallback(async (
    operation: () => Promise<any>
  ): Promise<any> => {
    setState({
      isLoading: true,
      error: null,
      isSuccess: false,
    });

    try {
      const result = await operation();
      
      setState({
        isLoading: false,
        error: null,
        isSuccess: true,
      });

      if (showSuccessToast) {
        toast({
          title: "Success!",
          description: successMessage,
        });
      }

      return result;
    } catch (err: any) {
      let errorMessage = `${errorPrefix}. Please try again.`;
      
      // Standardized error extraction
      if (typeof err === 'object' && err !== null && err.response?.data) {
        errorMessage = err.response.data.userMessage || 
                      err.response.data.message || 
                      err.message || 
                      errorMessage;
      } else if (typeof err === 'object' && err !== null && err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setState({
        isLoading: false,
        error: errorMessage,
        isSuccess: false,
      });

      if (showErrorToast) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }

      return null;
    }
  }, [successMessage, errorPrefix, showSuccessToast, showErrorToast]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  return {
    ...state,
    execute,
    clearError,
    reset,
  };
} 