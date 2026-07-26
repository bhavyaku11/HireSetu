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

  console.log('\n=== Test Case A: Valid Text PDF Upload (Expect 200 + rawText) ===');
  const validPdfBuffer = Buffer.from(
    '%PDF-1.4\n' +
    '1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n' +
    '2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n' +
    '3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>> >> endobj\n' +
    '4 0 obj <</Length 55>> stream\n' +
    'BT /F1 12 Tf 100 700 Td (John Doe Software Engineer) Tj ET\n' +
    'endstream endobj\n' +
    '5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n' +
    'xref\n' +
    '0 6\n' +
    '0000000000 65535 f\n' +
    '0000000009 00000 n\n' +
    '0000000056 00000 n\n' +
    '0000000111 00000 n\n' +
    '0000000238 00000 n\n' +
    '0000000343 00000 n\n' +
    'trailer <</Size 6 /Root 1 0 R>>\n' +
    'startxref\n' +
    '419\n' +
    '%%EOF'
  );
  const pdfBlob = new Blob([validPdfBuffer], { type: 'application/pdf' });
  const formPdf = new FormData();
  formPdf.append('file', pdfBlob, 'sample_resume.pdf');

  const pdfRes = await fetch(`${baseURL}/resumes/${resumeId}/import`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}` },
    body: formPdf,
  });
  const pdfData = await pdfRes.json();
  console.log(`Status: ${pdfRes.status}`, pdfData);
  if (pdfRes.status !== 200 || !pdfData.rawText || !pdfData.rawText.includes('John Doe')) {
    throw new Error('Test Case A failed!');
  }

  console.log('\n=== Check DB Persistence for raw_extracted_text ===');
  const [dbRows] = await pool.query('SELECT raw_extracted_text FROM resumes WHERE id = ?', [resumeId]);
  console.log('Database raw_extracted_text:', dbRows[0]?.raw_extracted_text);
  if (!dbRows[0]?.raw_extracted_text?.includes('John Doe')) {
    throw new Error('Database persistence check failed!');
  }

  console.log('\n=== Test Case B: Scanned PDF / Unextractable Text (Expect 400 with clear message) ===');
  const unextractableBuffer = Buffer.from(
    '%PDF-1.4\n1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n2 0 obj <</Type /Pages /Kids [] /Count 0>> endobj\nxref\n0 3\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\ntrailer <</Size 3 /Root 1 0 R>>\nstartxref\n100\n%%EOF'
  );
  const scannedPdfBlob = new Blob([unextractableBuffer], { type: 'application/pdf' });
  const formScanned = new FormData();
  formScanned.append('file', scannedPdfBlob, 'scanned_resume.pdf');

  const scannedRes = await fetch(`${baseURL}/resumes/${resumeId}/import`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}` },
    body: formScanned,
  });
  const scannedData = await scannedRes.json();
  console.log(`Status: ${scannedRes.status}`, scannedData);
  if (scannedRes.status !== 400 || !scannedData.message.includes("couldn't read text")) {
    throw new Error('Test Case B failed!');
  }

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
  const pdfBlob2 = new Blob([validPdfBuffer], { type: 'application/pdf' });
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

  console.log('\n=== ALL UPLOAD & TEXT EXTRACTION TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runUploadTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
