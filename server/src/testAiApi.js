import pool from './config/db.js';
import { safeParseJson } from './services/aiService.js';

async function runAiTests() {
  const baseURL = 'http://localhost:5001/api';

  console.log('=== 1. Test safeParseJson Helper Unit Logic ===');
  const directJson = safeParseJson('{"status": "ok", "value": 100}');
  if (directJson.status !== 'ok') throw new Error('Direct JSON parse failed');
  console.log('Direct JSON Parse:', directJson);

  const markdownJson = safeParseJson('```json\n{"status": "markdown_ok", "parsed": true}\n```');
  if (markdownJson.status !== 'markdown_ok') throw new Error('Markdown JSON parse failed');
  console.log('Markdown JSON Parse:', markdownJson);

  const wrappedJson = safeParseJson('Here is your response object: {"status": "wrapped_ok"} hope this helps!');
  if (wrappedJson.status !== 'wrapped_ok') throw new Error('Regex wrapped JSON parse failed');
  console.log('Regex Fallback JSON Parse:', wrappedJson);

  console.log('\n=== 2. Clean up test users ===');
  await pool.query("DELETE FROM users WHERE email = 'ai_user@example.com'");

  console.log('=== 3. Register Test User ===');
  const regRes = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'AI Test User', email: 'ai_user@example.com', password: 'password123' }),
  });
  const regData = await regRes.json();
  const token = regData.token;

  console.log('\n=== 4. Test POST /api/ai/test Endpoint ===');
  const aiTestRes = await fetch(`${baseURL}/ai/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const aiTestData = await aiTestRes.json();
  console.log(`Status: ${aiTestRes.status}`, JSON.stringify(aiTestData, null, 2));

  if (aiTestRes.status !== 200 || !aiTestData.success) {
    throw new Error('POST /api/ai/test endpoint failed');
  }

  console.log('\n=== ALL CLAUDE AI INTEGRATION TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runAiTests().catch((err) => {
  console.error('AI Test execution error:', err);
  process.exit(1);
});
