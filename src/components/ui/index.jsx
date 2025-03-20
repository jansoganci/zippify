// Temporary UI components until we get access to @windsurf/ui
import React from 'react';

export const ThemeProvider = ({ children }) => {
  return <div className="theme-provider">{children}</div>;
};

export const CSSReset = () => null;

export const Button = ({ children, ...props }) => (
  <button className="windsurf-button" {...props}>
    {children}
  </button>
);

export const Input = ({ ...props }) => (
  <input className="windsurf-input" {...props} />
);

export const Form = ({ children, ...props }) => (
  <form className="windsurf-form" {...props}>
    {children}
  </form>
);

export const Card = ({ children, ...props }) => (
  <div className="windsurf-card" {...props}>
    {children}
  </div>
);

export const Container = ({ children, ...props }) => (
  <div className="windsurf-container" {...props}>
    {children}
  </div>
);
