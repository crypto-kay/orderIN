/**
 * Logger utility that respects NODE_ENV
 * In production, debug logs are suppressed
 */
export const logger = {
  debug: (...args: any[]) => {
    if (import.meta.env.MODE !== 'production') {
      console.debug(...args);
    }
  },
  info: (...args: any[]) => {
    console.info(...args);
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
};