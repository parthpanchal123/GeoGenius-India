const isProduction = process.env.NODE_ENV === 'production';
const isServer = typeof window === 'undefined';

type ConsoleMethod = keyof Pick<Console, 'log' | 'info' | 'warn' | 'error' | 'debug' | 'trace'>;

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  trace: console.trace
};

export const enableConsoleInDev = () => {
  if (!isProduction && !isServer) {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
    console.trace = originalConsole.trace;
  }
};

export const disableConsole = () => {
  if (isProduction && !isServer) {
    try {
      const noop = () => {};
      
      // Override all console methods
      console.log = noop;
      console.info = noop;
      console.warn = noop;
      console.error = noop;
      console.debug = noop;
      console.trace = noop;
      
      // Also override their properties
      Object.defineProperties(console, {
        log: { value: noop, writable: false, configurable: false },
        info: { value: noop, writable: false, configurable: false },
        warn: { value: noop, writable: false, configurable: false },
        error: { value: noop, writable: false, configurable: false },
        debug: { value: noop, writable: false, configurable: false },
        trace: { value: noop, writable: false, configurable: false }
      });

      // Prevent console method hijacking
      const noopReturn = () => noop;
      const methods: ConsoleMethod[] = ['log', 'info', 'warn', 'error', 'debug', 'trace'];
      methods.forEach(method => {
        const consoleMethod = console[method];
        if (typeof consoleMethod === 'function') {
          Object.defineProperties(consoleMethod, {
            apply: { value: noopReturn, writable: false, configurable: false },
            bind: { value: noopReturn, writable: false, configurable: false },
            call: { value: noopReturn, writable: false, configurable: false }
          });
        }
      });
    } catch (e) {
      // Silent catch in case of any errors during console modification
    }
  }
}; 