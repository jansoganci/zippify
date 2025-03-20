// Temporary icons until we get access to @windsurf/icons
import React from 'react';

export const Icon = ({ name, ...props }) => (
  <span className={`windsurf-icon icon-${name}`} {...props} />
);
