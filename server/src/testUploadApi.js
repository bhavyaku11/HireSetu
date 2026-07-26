import pool from './config/db.js';

async function runUploadTests() {
  const baseURL = 'http://localhost:5001/api';

  console.log('=== 1. Clean up test users ===');
  await pool.query("DELETE FROM users WHERE email IN ('upload_user1@example.com', 'upload_user2@example.com')");

  console.log('=== 2. Register User 1 & Create Resume ===');
  const reg1Res = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Upload User 1', email: 'upload_user1@example.com', password: 'password123' }),
  });
  const u1Data = await reg1Res.json();
  const token1 = u1Data.token;

  const createRes = await fetch(`${baseURL}/resumes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`,
    },
    body: JSON.stringify({ title: 'Test Import Resume' }),
  });
  const createData = await createRes.json();
  const resumeId = createData.resumeId;
  console.log(`Resume Created with ID: ${resumeId}`);

  console.log('=== 3. Register User 2 ===');
  const reg2Res = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Upload User 2', email: 'upload_user2@example.com', password: 'password123' }),
  });
  const u2Data = await reg2Res.json();
  const token2 = u2Data.token;

  console.log('\n=== Test Case A: Valid PDF Upload (Expect 200) ===');
  const pdfBlob = new Blob(['%PDF-1.4 Mock PDF Content'], { type: 'application/pdf' });
  const formPdf = new FormData();
  formPdf.append('file', pdfBlob, 'sample_resume.pdf');

  const pdfRes = await fetch(`${baseURL}/resumes/${resumeId}/import`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}` },
    body: formPdf,
  });
  const pdfData = await pdfRes.json();
  console.log(`Status: ${pdfRes.status}`, pdfData);
  if (pdfRes.status !== 200 || !pdfData.filename) throw new Error('Test Case A failed!');

  console.log('\n=== Test Case B: Valid DOCX Upload (Expect 200) ===');
  const docxBlob = new Blob(['Mock DOCX Content'], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const formDocx = new FormData();
  formDocx.append('file', docxBlob, 'my_resume.docx');

  const docxRes = await fetch(`${baseURL}/resumes/${resumeId}/import`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}` },
    body: formDocx,
  });
  const docxData = await docxRes.json();
  console.log(`Status: ${docxRes.status}`, docxData);
  if (docxRes.status !== 200 || !docxData.filename) throw new Error('Test Case B failed!');

  console.log('\n=== Test Case C: Wrong File Type (Expect 400) ===');
  const txtBlob = new Blob(['Plain Text Content'], { type: 'text/plain' });
  const formTxt = new FormData();
  formTxt.append('file', txtBlob, 'resume.txt');

  const txtRes = await fetch(`${baseURL}/resumes/${resumeId}/import`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}` },
    body: formTxt,
  });
  const txtData = await txtRes.json();
  console.log(`Status: ${txtRes.status}`, txtData);
  if (txtRes.status !== 400) throw new Error('Test Case C failed!');

  console.log('\n=== Test Case D: File Exceeding 5MB Limit (Expect 400) ===');
  const largeBuffer = new Uint8Array(5.5 * 1024 * 1024); // 5.5MB
  const largeBlob = new Blob([largeBuffer], { type: 'application/pdf' });
  const formLarge = new FormData();
  formLarge.append('file', largeBlob, 'oversized.pdf');

  const largeRes = await fetch(`${baseURL}/resumes/${resumeId}/import`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}` },
    body: formLarge,
  });
  const largeData = await largeRes.json();
  console.log(`Status: ${largeRes.status}`, largeData);
  if (largeRes.status !== 400) throw new Error('Test Case D failed!');

  console.log('\n=== Test Case E: No File Provided (Expect 400) ===');
  const formEmpty = new FormData();

  const emptyRes = await fetch(`${baseURL}/resumes/${resumeId}/import`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}` },
    body: formEmpty,
  });
  const emptyData = await emptyRes.json();
  console.log(`Status: ${emptyRes.status}`, emptyData);
  if (emptyRes.status !== 400) throw new Error('Test Case E failed!');

  console.log('\n=== Test Case F: Ownership Check Violation (User 2 on User 1 Resume - Expect 404) ===');
  const pdfBlob2 = new Blob(['%PDF-1.4 Content'], { type: 'application/pdf' });
  const formPdf2 = new FormData();
  formPdf2.append('file', pdfBlob2, 'hack.pdf');

  const u2Res = await fetch(`${baseURL}/resumes/${resumeId}/import`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token2}` },
    body: formPdf2,
  });
  const u2Data2 = await u2Res.json();
  console.log(`Status: ${u2Res.status}`, u2Data2);
  if (u2Res.status !== 404) throw new Error('Test Case F failed!');

  console.log('\n=== ALL UPLOAD ENDPOINT TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runUploadTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
