import pool from './config/db.js';
import fs from 'fs';
import path from 'path';

async function runAvatarUploadTests() {
  const baseURL = 'http://localhost:5001/api';
  const serverURL = 'http://localhost:5001';

  console.log('=== 1. Clean up test user ===');
  await pool.query("DELETE FROM users WHERE email = 'avatar_test_user@example.com'");

  console.log('=== 2. Register Test User ===');
  const regRes = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Avatar User', email: 'avatar_test_user@example.com', password: 'password123' }),
  });
  const regData = await regRes.json();
  const token = regData.token;

  console.log('\n=== 3. Test Valid PNG Avatar Upload (Expect 200 OK) ===');
  // Minimal valid 1x1 PNG binary buffer
  const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  const pngBlob = new Blob([pngBuffer], { type: 'image/png' });
  const formPng = new FormData();
  formPng.append('file', pngBlob, 'avatar.png');

  const uploadRes1 = await fetch(`${baseURL}/auth/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formPng,
  });
  const uploadData1 = await uploadRes1.json();
  console.log(`Status: ${uploadRes1.status}`, uploadData1);

  if (uploadRes1.status !== 200 || !uploadData1.profile_image_url) {
    throw new Error('Avatar upload failed for valid PNG');
  }

  const firstImageUrl = uploadData1.profile_image_url;
  const firstFilename = path.basename(firstImageUrl);
  const firstFilePath = path.join(process.cwd(), 'uploads/avatars', firstFilename);

  if (!fs.existsSync(firstFilePath)) {
    throw new Error(`Uploaded avatar file not found on disk at ${firstFilePath}`);
  }
  console.log('✅ First avatar uploaded and verified on disk:', firstImageUrl);

  console.log('\n=== 4. Test Static Asset Serving of Uploaded Avatar ===');
  const staticRes = await fetch(`${serverURL}${firstImageUrl}`);
  console.log(`Static Asset Fetch Status: ${staticRes.status}`);
  if (staticRes.status !== 200) {
    throw new Error('Static asset serving failed for uploaded avatar URL');
  }
  console.log('✅ Static asset serving verified via /uploads/avatars/...');

  console.log('\n=== 5. Test Avatar Replacement (Re-upload JPEG and verify old file deleted) ===');
  const jpgBlob = new Blob([pngBuffer], { type: 'image/jpeg' });
  const formJpg = new FormData();
  formJpg.append('file', jpgBlob, 'new_avatar.jpg');

  const uploadRes2 = await fetch(`${baseURL}/auth/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formJpg,
  });
  const uploadData2 = await uploadRes2.json();
  console.log(`Status: ${uploadRes2.status}`, uploadData2);

  if (uploadRes2.status !== 200 || !uploadData2.profile_image_url) {
    throw new Error('Second avatar upload failed');
  }

  // Verify old file was deleted from disk
  if (fs.existsSync(firstFilePath)) {
    throw new Error('Old avatar file was NOT deleted from disk after re-uploading replacement!');
  }
  console.log('✅ Old avatar file deleted from disk and replaced with new avatar:', uploadData2.profile_image_url);

  console.log('\n=== 6. Test Validation: Unsupported File Type (PDF) (Expect 400 Bad Request) ===');
  const pdfBlob = new Blob([Buffer.from('%PDF-1.4 test')], { type: 'application/pdf' });
  const formPdf = new FormData();
  formPdf.append('file', pdfBlob, 'resume.pdf');

  const pdfRes = await fetch(`${baseURL}/auth/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formPdf,
  });
  const pdfData = await pdfRes.json();
  console.log(`Status: ${pdfRes.status}`, pdfData);

  if (pdfRes.status !== 400) {
    throw new Error('Unsupported file type upload was not rejected with 400 Bad Request');
  }
  console.log('✅ PDF upload correctly rejected with 400 Bad Request');

  console.log('\n=== 7. Test Validation: File Size Exceeding 2MB (Expect 400 Bad Request) ===');
  const largeBuffer = Buffer.alloc(2.5 * 1024 * 1024); // 2.5MB
  const largeBlob = new Blob([largeBuffer], { type: 'image/png' });
  const formLarge = new FormData();
  formLarge.append('file', largeBlob, 'large_image.png');

  const largeRes = await fetch(`${baseURL}/auth/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formLarge,
  });
  const largeData = await largeRes.json();
  console.log(`Status: ${largeRes.status}`, largeData);

  if (largeRes.status !== 400) {
    throw new Error('Over 2MB file upload was not rejected with 400 Bad Request');
  }
  console.log('✅ 2.5MB file upload correctly rejected with 400 Bad Request');

  console.log('\n=== 8. Test Validation: No File Provided (Expect 400 Bad Request) ===');
  const emptyForm = new FormData();
  const emptyRes = await fetch(`${baseURL}/auth/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: emptyForm,
  });
  const emptyData = await emptyRes.json();
  console.log(`Status: ${emptyRes.status}`, emptyData);

  if (emptyRes.status !== 400) {
    throw new Error('Empty file upload was not rejected with 400 Bad Request');
  }
  console.log('✅ Empty file upload correctly rejected with 400 Bad Request');

  console.log('\n=== ALL AVATAR UPLOAD TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runAvatarUploadTests().catch((err) => {
  console.error('Avatar upload test error:', err);
  process.exit(1);
});
