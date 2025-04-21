// Centralized logger utility for Zippify frontend
// Forwards logs to console in non-production; no-ops in production

export function log(...args: any[]) {
  if (import.meta.env.MODE !== 'production') {
    console.log(...args);
  }
}

export function info(...args: any[]) {
  if (import.meta.env.MODE !== 'production') {
    console.info(...args);
  }
}

export function warn(...args: any[]) {
  if (import.meta.env.MODE !== 'production') {
    console.warn(...args);
  }
}

export function error(...args: any[]) {
  if (import.meta.env.MODE !== 'production') {
    console.error(...args);
  }
}
