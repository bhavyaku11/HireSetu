import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generateCompletion, generateJsonCompletion, safeParseJson } from '../services/aiService.js';

const router = express.Router();

// All AI routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/ai/test
 * @desc    Test endpoint confirming Claude API integration end-to-end
 * @access  Private
 */
router.post('/test', async (req, res) => {
  try {
    const prompt = 'Respond with a valid JSON object containing status: "ok" and message: "Claude API Integration Successful".';

    try {
      const responseData = await generateJsonCompletion(prompt, {
        maxTokens: 300,
        temperature: 0.2,
      });

      return res.status(200).json({
        success: true,
        message: 'Claude API test successful',
        data: responseData,
      });
    } catch (aiErr) {
      if (aiErr.code === 'API_KEY_MISSING') {
        const mockFallback = safeParseJson('{"status": "mock_ok", "message": "Claude API Infrastructure is functional. Add real ANTHROPIC_API_KEY to .env to execute live requests."}');
        return res.status(200).json({
          success: true,
          status: 'warning',
          message: aiErr.message,
          data: mockFallback,
        });
      }
      throw aiErr;
    }
  } catch (error) {
    console.error('AI Test Endpoint Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'AI test request failed',
    });
  }
});

/**
 * @route   POST /api/ai/improve-text
 * @desc    Generate improved version of a bullet point or professional summary
 * @access  Private
 */
router.post('/improve-text', async (req, res) => {
  try {
    const { text, type = 'bullet', context = {} } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return res.status(400).json({
        message: 'Text is too short to improve. Please enter at least 5 characters.',
      });
    }

    const cleanText = text.trim();
    const isSummary = type === 'summary';

    const systemPrompt = 'You are an executive resume writer and ATS specialist dedicated to improving phrasing, action verbs, and readability while maintaining strict truthfulness.';

    const prompt = `Improve the following resume ${isSummary ? 'professional summary' : 'bullet point'}.

Original Text:
"${cleanText}"

${context.jobTitle ? `Role Title: ${context.jobTitle}` : ''}
${context.company ? `Company: ${context.company}` : ''}

CRITICAL RULES & INSTRUCTIONS:
1. Action Verbs: Begin with a strong, high-impact action verb.
2. Quantifiable Metrics: Never invent specific numbers, percentages, company names, or achievements that were not in the original text. If a metric would strengthen this bullet, use a placeholder like "[quantify this, e.g. X%]" or "[add metric]" instead of making one up.
3. Truthfulness: Stay strictly truthful to the original content — improve phrasing, vocabulary, and impact without fabricating claims.
4. Output Format: Return a valid raw JSON object with the exact keys:
{
  "originalText": "${cleanText.replace(/"/g, '\\"')}",
  "suggestedText": "Improved text string here",
  "explanation": "Brief 1-sentence note explaining what was improved (e.g. Lead with strong action verb 'Engineered' and added a metric placeholder)."
}`;

    try {
      const responseData = await generateJsonCompletion(prompt, {
        systemPrompt,
        maxTokens: 500,
        temperature: 0.3,
      });

      if (responseData && responseData.suggestedText) {
        return res.status(200).json({
          success: true,
          originalText: cleanText,
          suggestedText: responseData.suggestedText,
          explanation: responseData.explanation || 'Enhanced action verbs and structural clarity.',
        });
      }
    } catch (aiErr) {
      if (aiErr.code === 'API_KEY_MISSING') {
        let fallbackSuggested = cleanText;
        if (isSummary) {
          fallbackSuggested = `Results-driven professional with expertise in ${cleanText}. Proven track record of delivering high-impact solutions [quantify key achievements, e.g., improved efficiency by X%].`;
        } else {
          fallbackSuggested = `Spearheaded ${cleanText} [quantify impact, e.g., serving X+ users / reducing load by Y%]`;
        }

        return res.status(200).json({
          success: true,
          status: 'warning',
          message: aiErr.message,
          originalText: cleanText,
          suggestedText: fallbackSuggested,
          explanation: 'Enhanced action verb phrasing and added metric placeholder. (Add ANTHROPIC_API_KEY in .env for live Claude rewrites)',
        });
      }
      throw aiErr;
    }

    return res.status(400).json({ message: 'Failed to generate AI rewrite' });
  } catch (error) {
    console.error('Error improving text:', error);
    return res.status(500).json({ message: error.message || 'Internal server error improving text' });
  }
});

export default router;
