import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.ANTHROPIC_API_KEY;
const IS_CONFIGURED = API_KEY && API_KEY !== 'your_anthropic_api_key_here';

const anthropic = IS_CONFIGURED ? new Anthropic({ apiKey: API_KEY }) : null;
const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Utility helper for exponential backoff delay
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Single reusable function to invoke Claude API with retry logic and error handling.
 *
 * @param {string} prompt - User prompt string
 * @param {Object} options - Configuration options
 * @param {string} [options.systemPrompt] - System prompt string
 * @param {string} [options.model] - Claude model ID (defaults to claude-3-5-sonnet-20241022)
 * @param {number} [options.maxTokens] - Max tokens to generate (default 1024)
 * @param {number} [options.temperature] - Sampling temperature (default 0.7)
 * @param {number} [options.maxRetries] - Max retry attempts for transient errors (default 3)
 * @returns {Promise<string>} Text response from Claude
 */
export async function generateCompletion(prompt, options = {}) {
  const {
    systemPrompt = '',
    model = DEFAULT_MODEL,
    maxTokens = 1024,
    temperature = 0.7,
    maxRetries = 3,
  } = options;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error('Prompt string is required for AI completion');
  }

  // If Anthropic API key is not configured, throw explicit actionable error
  if (!IS_CONFIGURED) {
    const error = new Error('Anthropic API key is not configured. Please set a valid ANTHROPIC_API_KEY in .env');
    error.code = 'API_KEY_MISSING';
    throw error;
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      attempt++;

      const messageParams = {
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      };

      if (systemPrompt) {
        messageParams.system = systemPrompt;
      }

      const response = await anthropic.messages.create(messageParams);

      if (!response || !response.content || response.content.length === 0) {
        throw new Error('Invalid response structure received from Claude API');
      }

      const text = response.content
        .filter((item) => item.type === 'text')
        .map((item) => item.text)
        .join('\n');

      return text;
    } catch (err) {
      const isRateLimit = err.status === 429 || err.code === 'rate_limit_exceeded';
      const isServerError = err.status >= 500 && err.status <= 599;
      const isTransient = isRateLimit || isServerError;

      console.error(`Claude API Error (Attempt ${attempt}/${maxRetries}):`, err.message || err);

      if (isTransient && attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`Retrying Claude API call in ${Math.round(backoffMs)}ms...`);
        await sleep(backoffMs);
      } else {
        // Re-throw with formatted message
        const finalError = new Error(
          isRateLimit
            ? 'Rate limit exceeded for Claude API. Please try again later.'
            : isServerError
            ? 'Claude API service is temporarily unavailable. Please try again.'
            : err.message || 'AI completion request failed'
        );
        finalError.code = err.code || err.status || 'AI_COMPLETION_ERROR';
        throw finalError;
      }
    }
  }
}

/**
 * Instructs Claude to return structured JSON output, safely sanitizes, and parses the response.
 *
 * @param {string} prompt - Prompt describing the JSON object to produce
 * @param {Object} options - Completion options
 * @returns {Promise<Object>} Parsed JSON object
 */
export async function generateJsonCompletion(prompt, options = {}) {
  const jsonSystemPrompt =
    (options.systemPrompt ? `${options.systemPrompt}\n\n` : '') +
    'CRITICAL INSTRUCTION: You must respond in valid raw JSON format ONLY. ' +
    'Do not include markdown code block formatting (e.g. do NOT wrap with ```json or ```), no preamble, and no postscript text. ' +
    'Output must be a valid parseable JSON string.';

  const rawResponse = await generateCompletion(prompt, {
    ...options,
    systemPrompt: jsonSystemPrompt,
  });

  return safeParseJson(rawResponse);
}

/**
 * Safely cleans and parses JSON from string, with regex extraction fallback.
 *
 * @param {string} text - Response string from AI model
 * @returns {Object} Parsed JSON object
 */
export function safeParseJson(text) {
  if (!text || typeof text !== 'string') {
    return { error: 'EMPTY_RESPONSE', rawText: text };
  }

  // Step 1: Strip markdown backtick codeblocks if present
  let cleanText = text.trim();
  cleanText = cleanText.replace(/^```json\s*/i, '');
  cleanText = cleanText.replace(/^```\s*/i, '');
  cleanText = cleanText.replace(/\s*```$/i, '');
  cleanText = cleanText.trim();

  // Step 2: Try direct JSON parse
  try {
    return JSON.parse(cleanText);
  } catch (directErr) {
    console.warn('Direct JSON parse failed, attempting regex extraction fallback...');

    // Step 3: Regex fallback to extract JSON object {...} or array [...]
    const jsonMatch = cleanText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (fallbackErr) {
        console.error('Regex JSON parse fallback failed:', fallbackErr.message);
      }
    }

    // Step 4: Final fallback object
    return {
      error: 'JSON_PARSE_FAILED',
      message: 'Failed to parse structured JSON response from AI model',
      rawText: text,
    };
  }
}
