export const disableConsole = () => {
  if (process.env.NODE_ENV === 'production') {
    // Save original console methods
    const originalConsole = { ...console };

    // Override console methods
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.warn = noop;
    console.error = noop;
    console.debug = noop;
    console.trace = noop;

    // Keep these methods for critical functionality
    console.clear = originalConsole.clear;
    console.assert = originalConsole.assert;

    // Disable console.log.apply calls
    const noopReturn = () => noop;
    console.log.apply = noopReturn;
    console.info.apply = noopReturn;
    console.warn.apply = noopReturn;
    console.error.apply = noopReturn;
    console.debug.apply = noopReturn;
    console.trace.apply = noopReturn;

    // Also prevent binding
    console.log.bind = noopReturn;
    console.info.bind = noopReturn;
    console.warn.bind = noopReturn;
    console.error.bind = noopReturn;
    console.debug.bind = noopReturn;
    console.trace.bind = noopReturn;
  }
}; 