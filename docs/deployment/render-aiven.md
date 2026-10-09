# Deploying HireSetu Backend to Render with Aiven MySQL 8.4

This guide covers deploying the Node.js/Express backend (`server`) to a **Render Web Service** connected to an **Aiven MySQL 8.4** database (`defaultdb`), with the frontend hosted on **Vercel** (`https://hire-setu.vercel.app`).

---

## 1. Prerequisites

- Aiven MySQL 8.4 service created and running.
- Database `defaultdb` created.
- Schema verified (the four core tables: `users`, `resumes`, `resume_sections`, and `job_descriptions`).
- GitHub repository `bhavyaku11/HireSetu` accessible from your Render account.

---

## 2. Render Web Service Creation

1. Log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `bhavyaku11/HireSetu`.
4. Configure the service settings:
   - **Name**: `hiresetu-backend` (or your preferred name)
   - **Region**: Choose the region closest to your Aiven MySQL database
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or higher)

---

## 3. Environment Variables Configuration

In Render Dashboard under **Environment**, add the following variables:

| Variable Name | Value / Description | Required? |
|---|---|---|
| `NODE_ENV` | `production` | **Yes** |
| `PORT` | Auto-provided by Render (defaults to `8080`) | Render sets this |
| `DB_HOST` | Aiven MySQL Service URI host (e.g. `mysql-xxxxx.aivencloud.com`) | **Yes** |
| `DB_PORT` | Aiven MySQL Port (e.g. `12345` or standard) | **Yes** |
| `DB_USER` | Aiven MySQL User (usually `avnadmin`) | **Yes** |
| `DB_PASSWORD` | Aiven MySQL User Password | **Yes** |
| `DB_NAME` | `defaultdb` | **Yes** |
| `DB_SSL` | `true` | **Yes** |
| `DB_SSL_CA` | *(Optional but recommended)* Project CA PEM content from Aiven | Recommended |
| `DB_SSL_REJECT_UNAUTHORIZED` | Set to `true` (or `false` only during initial testing if CA cert pending) | Optional |
| `JWT_SECRET` | Strong 64-character random string (e.g., generated with `openssl rand -hex 32`) | **Yes** |
| `CLIENT_URL` | `https://hire-setu.vercel.app` | **Yes** |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Web Client ID (from Google Cloud Console) | If using Google auth |
| `ANTHROPIC_API_KEY` | Anthropic Claude API Key (features degrade gracefully if omitted) | Optional |

> ⚠️ **Security Warning**: Never commit real database passwords or JWT secrets to Git. Enter them directly into the Render Environment dashboard.

---

## 4. Aiven SSL and CA Certificate Setup

Aiven requires SSL/TLS for all connections.

### Option A: Provide CA Certificate (Recommended for Production)
1. In your Aiven Console, go to your MySQL service overview.
2. Download the **CA Certificate** (`ca.pem`).
3. Either:
   - Open `ca.pem` in a text editor, copy the entire block (including `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`), and paste it into the Render environment variable `DB_SSL_CA`.
   - OR commit `ca.pem` (CA public certificates are public, not private keys) and set `DB_SSL_CA_PATH=./ca.pem`.

### Option B: Basic SSL Handshake
If you wish to test connectivity immediately before copying the CA certificate:
- Set `DB_SSL=true`.
- Set `DB_SSL_REJECT_UNAUTHORIZED=false`.
- The connection will be TLS-encrypted over the wire. Once confirmed, configure `DB_SSL_CA` for full certificate validation.

---

## 5. Health Check Configuration

In Render service settings:
- **Health Check Path**: `/api/health`

When Render pings `/api/health`, the backend tests connectivity to MySQL via `SELECT 1`:
- Returns **`200 OK`** if the server and database are healthy:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-09T12:00:00.000Z",
    "database": "connected"
  }
  ```
- Returns **`503 Service Unavailable`** if the database is unreachable, alerting Render to avoid routing live traffic until restored.

---

## 6. Inspecting Deployment and Runtime Logs

- **Build Logs**: View under **Events** or **Logs** tab in Render during deployment. Ensure `npm install` completes and Puppeteer/Chromium dependencies resolve.
- **Runtime Logs**: Look for the startup log lines:
  ```
  [DB] MySQL pool configured: host=mysql-xxxx.aivencloud.com, port=..., database=defaultdb, user=avnadmin, ssl=enabled
  [DB] Database schema verified successfully.
  HireSetu server running on port ... [0.0.0.0]
  ```
- If you see `[DB] Schema verification notice:` or database connection errors, check host/port/password and SSL settings in Render.

---

## 7. Connecting the Vercel Frontend to Render

Once Render finishes deploying, it will generate a public URL in the format:
`https://<your-render-service-name>.onrender.com`

### Update Vercel Configuration
1. Open [`client/vercel.json`](file:///Users/bhavyakumar/Documents/Projects/Builder%20Problem/Resume%20Builder/client/vercel.json):
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://<your-render-service-name>.onrender.com/api/:path*"
       },
       {
         "source": "/uploads/:path*",
         "destination": "https://<your-render-service-name>.onrender.com/uploads/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
2. In the **Vercel Dashboard** under **Settings → Environment Variables**:
   - Update or remove `VITE_API_URL`. (If removed, client requests route through the `/api` proxy rewrite above, avoiding all cross-origin CORS limitations).
3. Commit and push the `client/vercel.json` change to GitHub to trigger a Vercel deployment.

---

## 8. Google OAuth Setup for Production

If you use **Continue with Google**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Edit your OAuth 2.0 Web Client ID.
3. Under **Authorized JavaScript origins**, ensure both are listed:
   - `http://localhost:5173`
   - `https://hire-setu.vercel.app`
4. Under **Authorized redirect URIs**, add `https://hire-setu.vercel.app` if required by your flow.
5. Save changes (changes take a few minutes to propagate on Google's servers).

---

## 9. Common Troubleshooting

| Issue | Likely Cause | Solution |
|---|---|---|
| `Access denied for user 'avnadmin'@'...'` | Incorrect `DB_PASSWORD` or `DB_USER` in Render | Double-check credentials in Aiven console |
| `SSL connection error / self-signed certificate` | Aiven requires CA cert or rejection flag | Add `DB_SSL_CA` PEM string or set `DB_SSL_REJECT_UNAUTHORIZED=false` |
| `ETIMEDOUT` or `ECONNREFUSED` connecting to DB | IP filter or wrong port on Aiven | Ensure Aiven allows all IPs (`0.0.0.0/0`) or Render egress IPs; verify port |
| `CORS origin blocked` | Request origin not in whitelist | Check that `CLIENT_URL=https://hire-setu.vercel.app` is set in Render |
| Avatars disappear after redeploy | Render free tier disk is ephemeral | Profile pictures uploaded locally will reset on redeploy. Use Google OAuth picture or external object storage (S3/Cloudinary) for persistent custom avatars |
