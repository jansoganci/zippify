import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { ContentOptimization } from './steps/ContentOptimization';
import { PDFGeneration } from './steps/PDFGeneration';
import { EtsyListing } from './steps/EtsyListing';
import { ProgressBar } from '../layout/ProgressBar';

export const CreateListing = () => {
  const [step, setStep] = useState('optimize');
  const [workflowData, setWorkflowData] = useState({
    optimize: null,
    pdf: null,
    etsy: null
  });

  const handleOptimizationComplete = (result) => {
    setWorkflowData(prev => ({
      ...prev,
      optimize: result
    }));
    setStep('pdf');
  };

  const handlePDFComplete = (result) => {
    setWorkflowData(prev => ({
      ...prev,
      pdf: result
    }));
    setStep('etsy');
  };

  const handleEtsyComplete = (result) => {
    setWorkflowData(prev => ({
      ...prev,
      etsy: result
    }));
  };

  const completedSteps = [];
  if (step === 'pdf') completedSteps.push('optimize');
  if (step === 'etsy') completedSteps.push('optimize', 'pdf');

  // Render the current step
  const renderStep = () => {
    switch (step) {
      case 'optimize':
        return (
          <ContentOptimization
            onComplete={handleOptimizationComplete}
          />
        );
      case 'pdf':
        return (
          <PDFGeneration
            optimizedContent={workflowData.optimize?.optimizedPattern}
            onComplete={handlePDFComplete}
          />
        );
      case 'etsy':
        return (
          <EtsyListing
            optimizedContent={workflowData.optimize?.optimizedPattern}
            pdfUrl={workflowData.pdf?.pdfUrl}
            onComplete={handleEtsyComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box position="relative">
      <ProgressBar currentStep={step} completedSteps={completedSteps} />
      {renderStep()}
    </Box>
  );
};
export default CreateListing;