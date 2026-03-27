# CODEX — Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm installed

## Step 1: Get your free API keys (15 minutes)

### MongoDB Atlas (database)

1. Go to cloud.mongodb.com
2. Create free account → New Project → Create Cluster (M0 Free)
3. Database Access → Add user with password
4. Network Access → Allow access from anywhere (0.0.0.0/0)
5. Connect → Drivers → copy the connection string
6. Replace \<password\> with your actual password

### Gemini API (AI features)

1. Go to aistudio.google.com
2. Sign in with Google account
3. Click "Get API Key" → Create API key → copy it

### Judge0 via RapidAPI (code execution)

1. Go to rapidapi.com and create free account
2. Search "Judge0 CE"
3. Subscribe to Basic plan (free)
4. Go to Endpoints tab → copy your RapidAPI Key

## Step 2: Configure the project

1. Open server/.env.example
2. Copy it and rename the copy to server/.env
3. Fill in each value:

   - **MONGODB_URI** = (paste your Atlas connection string)
   - **JWT_SECRET** = (type any long random string, 32+ chars)
   - **GEMINI_API_KEY** = (paste your Gemini key)
   - **JUDGE0_API_KEY** = (paste your RapidAPI key)

## Step 3: Install and run

Open a terminal in the project folder.

**Backend:**

```bash
cd server
npm install
npm run seed
npm run dev
```

Open a **second** terminal.

**Frontend:**

```bash
cd client
npm install
npm run dev
```

## Step 4: Open the app

Go to **http://localhost:3000**

- **Register as Interviewer** → create questions → schedule interviews
- **Register as Candidate** → join interviews → practice with AI
