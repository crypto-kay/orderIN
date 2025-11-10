/**
 * Logger utility that respects NODE_ENV
 * In production, debug logs are suppressed
 */
export const logger = {
  debug: (...args: unknown[]) => {
    if (import.meta.env.MODE !== 'production') {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]) => {
    console.info(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};