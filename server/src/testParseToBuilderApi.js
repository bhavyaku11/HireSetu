import pool from './config/db.js';

async function runParseToBuilderTests() {
  const baseURL = 'http://localhost:5001/api';

  console.log('=== 1. Clean up test users ===');
  await pool.query("DELETE FROM users WHERE email IN ('builder_mapper_u1@example.com', 'builder_mapper_u2@example.com')");

  console.log('=== 2. Register User 1 & Create Resume ===');
  const reg1Res = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Mapper User 1', email: 'builder_mapper_u1@example.com', password: 'password123' }),
  });
  const u1Data = await reg1Res.json();
  const token1 = u1Data.token;

  const createRes = await fetch(`${baseURL}/resumes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`,
    },
    body: JSON.stringify({ title: 'Imported Mapper Resume' }),
  });
  const createData = await createRes.json();
  const resumeId = createData.resumeId;

  console.log('=== 3. Populate Sample Resume Raw Text ===');
  const sampleRawText = `John Smith
Senior Software Engineer
john.smith@example.com | (555) 123-4567 | San Francisco, CA | linkedin.com/in/johnsmith

Professional Summary
Experienced Software Engineer with 6+ years of expertise building real-time microservices.

Work Experience
Senior Engineer — Google (2020 – Present)
• Led microservices migration reducing deployment latency by 60%
• Built data pipeline handling 1M events/sec

Education
Bachelor of Science in Computer Science — Stanford University (2018)

Skills
JavaScript, TypeScript, React, Node.js, Python, SQL, AWS, Docker`;

  await pool.query('UPDATE resumes SET raw_extracted_text = ? WHERE id = ?', [sampleRawText, resumeId]);

  console.log('\n=== 4. Test FIRST Call to POST /api/resumes/:id/parse-to-builder (Expect mapped: true) ===');
  const parseRes1 = await fetch(`${baseURL}/resumes/${resumeId}/parse-to-builder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`,
    },
  });
  const parseData1 = await parseRes1.json();
  console.log(`Status: ${parseRes1.status}`, parseData1);

  if (parseRes1.status !== 200 || parseData1.mapped !== true) {
    throw new Error('First call to parse-to-builder failed or returned mapped != true');
  }

  console.log('\n=== 5. Verify Database Sections Created ===');
  const [sectionsDB] = await pool.query('SELECT section_type, content FROM resume_sections WHERE resume_id = ? ORDER BY sort_order ASC', [resumeId]);
  console.log(`Found ${sectionsDB.length} database section rows:`);
  sectionsDB.forEach((sec) => {
    const parsed = typeof sec.content === 'string' ? JSON.parse(sec.content) : sec.content;
    console.log(`  [${sec.section_type}]`, JSON.stringify(parsed).substring(0, 100) + '...');
  });

  if (sectionsDB.length < 5) {
    throw new Error(`Expected 5 resume_sections rows, got ${sectionsDB.length}`);
  }

  const personalSec = sectionsDB.find((s) => s.section_type === 'personal_info');
  const personalContent = typeof personalSec.content === 'string' ? JSON.parse(personalSec.content) : personalSec.content;
  if (!personalContent.fullName || !personalContent.email) {
    throw new Error('personal_info section failed to extract fullName or email');
  }
  console.log('✅ personal_info verified:', { fullName: personalContent.fullName, email: personalContent.email });

  console.log('\n=== 6. Test SECOND Call to parse-to-builder (Expect mapped: false — Idempotency Check) ===');
  const parseRes2 = await fetch(`${baseURL}/resumes/${resumeId}/parse-to-builder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`,
    },
  });
  const parseData2 = await parseRes2.json();
  console.log(`Status: ${parseRes2.status}`, parseData2);

  if (parseRes2.status !== 200 || parseData2.mapped !== false) {
    throw new Error('Second call to parse-to-builder failed idempotency check (expected mapped: false)');
  }

  console.log('\n=== 7. Verify GET /api/resumes/:id Returns Mapped Sections ===');
  const getRes = await fetch(`${baseURL}/resumes/${resumeId}`, {
    headers: { 'Authorization': `Bearer ${token1}` },
  });
  const getData = await getRes.json();
  console.log('GET Resume Sections Count:', getData.resume.sections?.length);
  if (!getData.resume.sections || getData.resume.sections.length < 5) {
    throw new Error('GET resume endpoint failed to return populated sections');
  }

  console.log('\n=== 8. Test Ownership Access Control (User 2 on User 1 Resume - Expect 404) ===');
  const reg2Res = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Mapper User 2', email: 'builder_mapper_u2@example.com', password: 'password123' }),
  });
  const u2Data = await reg2Res.json();
  const token2 = u2Data.token;

  const deniedRes = await fetch(`${baseURL}/resumes/${resumeId}/parse-to-builder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token2}`,
    },
  });
  const deniedData = await deniedRes.json();
  console.log(`Status: ${deniedRes.status}`, deniedData);

  if (deniedRes.status !== 404) {
    throw new Error('Ownership access control check failed for parse-to-builder route');
  }

  console.log('\n=== ALL PARSE-TO-BUILDER MAPPER TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runParseToBuilderTests().catch((err) => {
  console.error('Parse-to-builder test error:', err);
  process.exit(1);
});
