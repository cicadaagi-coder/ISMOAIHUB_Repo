# Genflow Studio — Setup Guide

## What you're deploying
A node-based AI visual pipeline editor. Drag nodes onto a canvas, connect them, and generate images (Seedance 2.0) and videos (Kling 3.0) through Atlas Cloud — all in one place.

---

## Step 1 — Get your accounts ready

You need three accounts (all free to start):

| Service | URL | What it's for |
|---|---|---|
| Vercel | vercel.com | Hosts your app |
| MongoDB Atlas | mongodb.com | Stores users & pipelines |
| Atlas Cloud | atlascloud.ai | Calls Seedance & Kling APIs |

---

## Step 2 — MongoDB Atlas setup

1. Go to **mongodb.com** → Create account
2. Create a free **M0 cluster** (free forever)
3. Create a **database user** (username + password — save these)
4. Under **Network Access**, add `0.0.0.0/0` (allows Vercel to connect)
5. Click **Connect** → **Drivers** → copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
   - Replace `<password>` with your actual password
   - Add `genflow` as the database name at the end: `.../genflow?retryWrites=true&w=majority`

---

## Step 3 — Atlas Cloud API key

1. Log in to your Atlas Cloud account
2. Go to **API Keys** or **Settings**
3. Generate a new API key
4. Copy it — you'll only see it once

---

## Step 4 — Deploy to Vercel

### Option A: GitHub (recommended)
1. Push this project folder to a GitHub repo
2. Go to **vercel.com** → New Project → Import your repo
3. Vercel auto-detects Next.js — click Deploy
4. Go to **Settings → Environment Variables** and add:

```
MONGODB_URI        = your full MongoDB connection string
ATLAS_CLOUD_API_KEY = your Atlas Cloud API key
ATLAS_CLOUD_BASE_URL = https://api.atlascloud.ai/v1
JWT_SECRET          = any long random string (e.g. paste: openssl rand -base64 32)
```

5. Click **Redeploy** — your app is live!

### Option B: Vercel CLI
```bash
npm install -g vercel
cd genflow-studio
vercel
# Follow the prompts, then set env vars in the Vercel dashboard
```

---

## Step 5 — Run locally (for testing)

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env.local
# Edit .env.local with your MongoDB URI, Atlas Cloud key, and JWT secret

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## Project structure

```
genflow/
├── pages/
│   ├── index.js              ← Main canvas UI (the node editor)
│   └── api/
│       ├── auth/
│       │   ├── login.js      ← POST /api/auth/login
│       │   └── register.js   ← POST /api/auth/register
│       ├── generate/
│       │   ├── image.js      ← POST /api/generate/image  (Seedance)
│       │   └── video.js      ← POST /api/generate/video  (Kling)
│       └── pipelines/
│           ├── index.js      ← GET/POST /api/pipelines
│           └── [id].js       ← PUT/DELETE /api/pipelines/:id
├── lib/
│   ├── db.js                 ← MongoDB connection
│   ├── models.js             ← User, Pipeline, Asset schemas
│   ├── auth.js               ← JWT sign/verify helpers
│   └── atlascloud.js         ← Seedance & Kling API calls
├── .env.example              ← Copy to .env.local
└── package.json
```

---

## API endpoints summary

| Method | Endpoint | What it does |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in, get JWT token |
| GET | /api/pipelines | Load all saved pipelines |
| POST | /api/pipelines | Save new pipeline |
| PUT | /api/pipelines/:id | Update existing pipeline |
| DELETE | /api/pipelines/:id | Delete pipeline |
| POST | /api/generate/image | Generate image via Seedance 2.0 |
| POST | /api/generate/video | Generate video via Kling 3.0 |

---

## Cost breakdown (starting out)

| Service | Cost |
|---|---|
| Vercel | Free (Hobby tier) |
| MongoDB Atlas | Free (M0, 512MB) |
| Atlas Cloud | Pay per generation only |

You only pay when you actually generate images or videos.

---

## Next steps once it's running

1. Connect the canvas UI (pages/index.js) to these API routes
2. Wire each node's "Generate" button to `/api/generate/image` or `/api/generate/video`
3. Wire "Save Pipeline" to `/api/pipelines`
4. Load saved pipelines from `/api/pipelines` on login
