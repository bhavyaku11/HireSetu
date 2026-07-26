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

export default router;
