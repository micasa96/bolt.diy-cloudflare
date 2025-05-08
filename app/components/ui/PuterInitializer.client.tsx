import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('PuterInitializer');

/**
 * Component to initialize Puter.js
 * This component should be rendered on the client side only
 */
export function PuterInitializer() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if Puter.js is available
    if (typeof window !== 'undefined' && window.puter) {
      logger.info('Puter.js is available');
      setInitialized(true);
    } else {
      logger.warn('Puter.js is not available');
      
      // Try to load Puter.js dynamically if it's not available
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => {
        logger.info('Puter.js loaded dynamically');
        setInitialized(true);
      };
      script.onerror = () => {
        logger.error('Failed to load Puter.js dynamically');
        toast.error('Failed to load Puter.js. Some features may not work properly.');
      };
      
      document.body.appendChild(script);
    }
  }, []);

  return null; // This component doesn't render anything
}

// Add type definition for the Puter.js global object
declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (
          prompt: string, 
          options: { 
            model: string; 
            system?: string;
            stream?: boolean;
          }
        ) => Promise<any>;
      };
    };
  }
}
