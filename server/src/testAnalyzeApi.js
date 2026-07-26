import pool from './config/db.js';

async function runAnalyzeTests() {
  const baseURL = 'http://localhost:5001/api';

  console.log('=== 1. Clean up test users ===');
  await pool.query("DELETE FROM users WHERE email IN ('analyze_user1@example.com', 'analyze_user2@example.com')");

  console.log('=== 2. Register User 1 & Create Resume ===');
  const reg1Res = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Analyze User 1', email: 'analyze_user1@example.com', password: 'password123' }),
  });
  const u1Data = await reg1Res.json();
  const token1 = u1Data.token;

  const createRes = await fetch(`${baseURL}/resumes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`,
    },
    body: JSON.stringify({ title: 'ATS Analyze Resume' }),
  });
  const createData = await createRes.json();
  const resumeId = createData.resumeId;

  console.log('=== 3. Upload Sample Resume File ===');
  const validPdfBuffer = Buffer.from(
    '%PDF-1.4\n' +
    '1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n' +
    '2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n' +
    '3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>> >> endobj\n' +
    '4 0 obj <</Length 95>> stream\n' +
    'BT /F1 12 Tf 100 700 Td (John Doe Software Engineer Email: john@example.com Phone: 123-456-7890) Tj ET\n' +
    'endstream endobj\n' +
    '5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n' +
    'xref\n' +
    '0 6\n' +
    '0000000000 65535 f\n' +
    '0000000009 00000 n\n' +
    '0000000056 00000 n\n' +
    '0000000111 00000 n\n' +
    '0000000238 00000 n\n' +
    '0000000383 00000 n\n' +
    'trailer <</Size 6 /Root 1 0 R>>\n' +
    'startxref\n' +
    '459\n' +
    '%%EOF'
  );
  const pdfBlob = new Blob([validPdfBuffer], { type: 'application/pdf' });
  const formPdf = new FormData();
  formPdf.append('file', pdfBlob, 'resume.pdf');

  await fetch(`${baseURL}/resumes/${resumeId}/import`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}` },
    body: formPdf,
  });

  console.log('\n=== 4. Test POST /api/resumes/:id/analyze Endpoint ===');
  const analyzeRes = await fetch(`${baseURL}/resumes/${resumeId}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`,
    },
  });
  const analyzeData = await analyzeRes.json();
  console.log(`Status: ${analyzeRes.status}`, JSON.stringify(analyzeData, null, 2));

  if (analyzeRes.status !== 200 || !analyzeData.analysis || typeof analyzeData.analysis.score !== 'number') {
    throw new Error('Analyze endpoint failed');
  }

  const sampleIssue = analyzeData.analysis.issues?.[0];
  if (!sampleIssue || !sampleIssue.whyItMatters || (!sampleIssue.howToFix && !sampleIssue.recommendation)) {
    throw new Error('Analysis issue missing whyItMatters or howToFix reasoning details');
  }
  console.log('Sample Issue Reasoning Verified:', {
    whyItMatters: sampleIssue.whyItMatters,
    howToFix: sampleIssue.howToFix || sampleIssue.recommendation,
  });

  console.log('\n=== 5. Check Database Persistence for ats_analysis ===');
  const [dbRows] = await pool.query('SELECT ats_analysis FROM resumes WHERE id = ?', [resumeId]);
  const storedAnalysis = typeof dbRows[0]?.ats_analysis === 'string' ? JSON.parse(dbRows[0].ats_analysis) : dbRows[0]?.ats_analysis;
  console.log('Stored DB ats_analysis:', storedAnalysis);
  if (!storedAnalysis || typeof storedAnalysis.score !== 'number') {
    throw new Error('Database persistence check failed for ats_analysis');
  }

  console.log('\n=== ALL ATS ANALYZE ENDPOINT TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runAnalyzeTests().catch((err) => {
  console.error('Analyze test error:', err);
  process.exit(1);
});
