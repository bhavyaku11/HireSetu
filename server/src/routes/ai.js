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

/**
 * @route   POST /api/ai/suggest-achievements
 * @desc    Generate 2-3 reflective questions prompting users to recall real quantifiable achievements
 * @access  Private
 */
router.post('/suggest-achievements', async (req, res) => {
  try {
    const { title = '', bullets = [], context = '' } = req.body || {};

    const cleanTitle = (title || context || 'Role/Project').trim();
    const bulletsText = Array.isArray(bullets) ? bullets.filter(Boolean).join('; ') : (bullets || '');

    const systemPrompt = 'You are an executive career coach and ATS interview consultant. Your task is to prompt candidate reflection via targeted questions without ever generating or fabricating false achievements.';

    const prompt = `Based on the candidate's entry for "${cleanTitle}", generate 2 to 3 reflective QUESTIONS (NOT statements) that prompt the candidate to think of real, quantifiable achievements or metrics they might have forgotten to include.

Current Entry Context:
"${bulletsText || 'No existing bullets detailed yet'}"

CRITICAL CONSTRAINTS:
- Output 2 to 3 reflective QUESTIONS ONLY. Never invent specific numbers, percentages, company names, or accomplishments.
- Example question: "Did this project reduce processing time, cut operational costs, or improve any measurable metric? If so, what was the approximate percentage or figure?"
- Your job is to prompt candidate reflection, NOT to generate content or fake achievements.

Output MUST be a valid JSON object matching this exact structure:
{
  "questions": [
    "Reflective question 1 prompting metrics or quantifiable impact?",
    "Reflective question 2 prompting scale, user base, or system throughput?",
    "Reflective question 3 prompting team leadership or cost savings?"
  ]
}`;

    try {
      const responseData = await generateJsonCompletion(prompt, {
        systemPrompt,
        maxTokens: 500,
        temperature: 0.3,
      });

      if (responseData && Array.isArray(responseData.questions) && responseData.questions.length > 0) {
        return res.status(200).json({
          success: true,
          questions: responseData.questions.slice(0, 3),
        });
      }
    } catch (aiErr) {
      if (aiErr.code === 'API_KEY_MISSING') {
        const fallbackQuestions = [
          `Did your work on "${cleanTitle}" improve system performance, decrease load time, or cut operational costs? If so, what was the estimated metric?`,
          `How many users, clients, team members, or daily transactions were directly impacted by your work in "${cleanTitle}"?`,
          `Did you lead, mentor, or collaborate on key architecture or project milestones? If so, what specific deliverable did you own?`,
        ];

        return res.status(200).json({
          success: true,
          status: 'warning',
          message: aiErr.message,
          questions: fallbackQuestions,
        });
      }
      throw aiErr;
    }

    return res.status(400).json({ message: 'Failed to generate achievement prompts' });
  } catch (error) {
    console.error('Error generating achievement suggestions:', error);
    return res.status(500).json({ message: error.message || 'Internal server error suggesting achievements' });
  }
});

export default router;
