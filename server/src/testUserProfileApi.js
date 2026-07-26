import pool from './config/db.js';

async function runUserProfileTests() {
  const baseURL = 'http://localhost:5001/api';

  console.log('=== 1. Clean up test user ===');
  await pool.query("DELETE FROM users WHERE email = 'profile_test_user@example.com'");

  console.log('=== 2. Register Test User ===');
  const regRes = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Original Name', email: 'profile_test_user@example.com', password: 'password123' }),
  });
  const regData = await regRes.json();
  const token = regData.token;

  console.log('=== 3. GET /api/auth/me (Initial state check) ===');
  const meRes1 = await fetch(`${baseURL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData1 = await meRes1.json();
  console.log(`GET /me Status: ${meRes1.status}`, meData1.user);

  if (meRes1.status !== 200) {
    throw new Error('GET /api/auth/me failed');
  }

  const u1 = meData1.user;
  if (!('profile_image_url' in u1) || !('linkedin_url' in u1) || !('github_url' in u1) || !('portfolio_url' in u1) || !('bio' in u1)) {
    throw new Error('GET /api/auth/me response is missing one or more required profile fields');
  }
  console.log('✅ GET /api/auth/me returns all extended profile fields correctly (null by default)');

  console.log('\n=== 4. PUT /api/auth/me (Valid profile update) ===');
  const updatePayload = {
    name: 'Alex Rivera',
    linkedin_url: 'https://linkedin.com/in/alexrivera',
    github_url: 'https://github.com/alexrivera',
    portfolio_url: 'https://alexrivera.dev',
    bio: 'Senior Full Stack Engineer passionate about high performance systems and modern web apps.',
  };

  const putRes1 = await fetch(`${baseURL}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatePayload),
  });
  const putData1 = await putRes1.json();
  console.log(`PUT /me Status: ${putRes1.status}`, putData1);

  if (putRes1.status !== 200 || putData1.user.name !== updatePayload.name) {
    throw new Error('PUT /api/auth/me failed to update profile');
  }
  if (
    putData1.user.linkedin_url !== updatePayload.linkedin_url ||
    putData1.user.github_url !== updatePayload.github_url ||
    putData1.user.portfolio_url !== updatePayload.portfolio_url ||
    putData1.user.bio !== updatePayload.bio
  ) {
    throw new Error('PUT /api/auth/me updated user values do not match submitted payload');
  }
  console.log('✅ PUT /api/auth/me updated profile successfully');

  console.log('\n=== 5. Verify GET /api/auth/me returns updated fields ===');
  const meRes2 = await fetch(`${baseURL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData2 = await meRes2.json();
  if (meData2.user.name !== 'Alex Rivera' || meData2.user.bio !== updatePayload.bio) {
    throw new Error('GET /api/auth/me did not persist updated profile fields');
  }
  console.log('✅ GET /api/auth/me persisted profile update verified');

  console.log('\n=== 6. Test Validation: Invalid URL format (Expect 400) ===');
  const badUrlRes = await fetch(`${baseURL}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ linkedin_url: 'not-a-valid-url' }),
  });
  const badUrlData = await badUrlRes.json();
  console.log(`Invalid URL Status: ${badUrlRes.status}`, badUrlData);
  if (badUrlRes.status !== 400) {
    throw new Error('Invalid URL validation failed (expected 400 Bad Request)');
  }
  console.log('✅ Invalid URL correctly rejected with 400 Bad Request');

  console.log('\n=== 7. Test Validation: Bio exceeding 200 characters (Expect 400) ===');
  const longBio = 'A'.repeat(201);
  const badBioRes = await fetch(`${baseURL}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bio: longBio }),
  });
  const badBioData = await badBioRes.json();
  console.log(`Overlong Bio Status: ${badBioRes.status}`, badBioData);
  if (badBioRes.status !== 400) {
    throw new Error('Overlong bio validation failed (expected 400 Bad Request)');
  }
  console.log('✅ Overlong bio correctly rejected with 400 Bad Request');

  console.log('\n=== 8. Test Security: profile_image_url cannot be updated via PUT /me ===');
  const hackImageRes = await fetch(`${baseURL}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ profile_image_url: 'https://malicious.com/avatar.png' }),
  });
  const hackImageData = await hackImageRes.json();
  console.log(`Hack Image Status: ${hackImageRes.status}`, hackImageData.user.profile_image_url);
  if (hackImageData.user.profile_image_url !== null) {
    throw new Error('Security check failed: profile_image_url was modified via PUT /api/auth/me!');
  }
  console.log('✅ Security check passed: profile_image_url ignored in PUT /api/auth/me');

  console.log('\n=== ALL USER PROFILE EXTENSION TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runUserProfileTests().catch((err) => {
  console.error('User profile test error:', err);
  process.exit(1);
});
