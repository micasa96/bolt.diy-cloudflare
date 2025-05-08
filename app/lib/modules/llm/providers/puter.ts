import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { LanguageModelV1 } from 'ai';
import type { IProviderSetting } from '~/types/model';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('PuterProvider');

/**
 * Puter.com provider for Claude models
 * This provider uses Puter.js to access Claude models without API keys
 * See: https://developer.puter.com/tutorials/free-unlimited-claude-35-sonnet-api/
 */
export default class PuterProvider extends BaseProvider {
  name = 'Puter';
  getApiKeyLink = 'https://developer.puter.com/tutorials/free-unlimited-claude-35-sonnet-api/';
  labelForGetApiKey = 'Learn more about Puter.js';
  icon = 'puter-icon'; // This will be defined in the UI components

  config = {
    // No API key required for Puter.js
  };

  staticModels: ModelInfo[] = [
    {
      name: 'claude-3-5-sonnet',
      label: 'Claude 3.5 Sonnet',
      provider: 'Puter',
      maxTokenAllowed: 8000,
    },
    {
      name: 'claude-3-7-sonnet',
      label: 'Claude 3.7 Sonnet',
      provider: 'Puter',
      maxTokenAllowed: 8000,
    },
  ];

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model } = options;

    // Create a custom language model that uses Puter.js
    const puterModel: LanguageModelV1 = {
      type: 'language-model',
      async invoke(params) {
        try {
          // This code runs in the browser
          if (typeof window === 'undefined' || !window.puter) {
            throw new Error('Puter.js is not available. Make sure to include the Puter.js script in your HTML.');
          }

          // Extract the messages from the params
          const messages = params.messages || [];
          const systemMessage = params.system || '';
          
          // Format the prompt for Puter.js
          const prompt = messages.length > 0 ? messages[messages.length - 1].content : '';
          
          // Call Puter.js API
          const response = await window.puter.ai.chat(prompt, {
            model: model,
            system: systemMessage,
          });

          // Return the response in the expected format
          return response.message.content[0].text;
        } catch (error) {
          logger.error('Error calling Puter.js API:', error);
          throw error;
        }
      },
      async *invokeStream(params) {
        try {
          // This code runs in the browser
          if (typeof window === 'undefined' || !window.puter) {
            throw new Error('Puter.js is not available. Make sure to include the Puter.js script in your HTML.');
          }

          // Extract the messages from the params
          const messages = params.messages || [];
          const systemMessage = params.system || '';
          
          // Format the prompt for Puter.js
          const prompt = messages.length > 0 ? messages[messages.length - 1].content : '';
          
          // Call Puter.js API with streaming
          const response = await window.puter.ai.chat(prompt, {
            model: model,
            system: systemMessage,
            stream: true,
          });

          // Stream the response
          for await (const part of response) {
            yield part?.text || '';
          }
        } catch (error) {
          logger.error('Error streaming from Puter.js API:', error);
          throw error;
        }
      }
    };

    return puterModel;
  }
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
