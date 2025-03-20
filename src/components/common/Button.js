import React from 'react';
import '../../styles/animations.css';

export const Button = ({ 
  children, 
  onClick, 
  isLoading = false, 
  disabled = false,
  type = 'button',
  className = '',
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`button ${className}`}
      onClick={onClick}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <span className="spinner" />}
      {children}
    </button>
  );
};
