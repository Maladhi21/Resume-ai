# AI Resume Analyzer

An advanced full-stack web application designed to parse, extract, and analyze resumes using AI. It evaluates formatting, detects skills, scores ATS compatibility, and provides concrete improvement steps.

## Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: Local MongoDB via Mongoose
- **Authentication**: JWT + bcryptjs
- **Parsing Engines**: `pdf-parse` (PDF) and `mammoth` (DOCX)
- **AI Engines**: Google Gemini API (`@google/genai`) or OpenAI API

---

## Installation & Setup

Follow these simple steps to run the application locally:

### 1. Install MongoDB Community Server
Ensure you have **MongoDB Community Server** installed on your system.
- Download it here: [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### 2. Start the MongoDB Service
Start your local MongoDB service:
- **macOS (Homebrew)**:
  ```bash
  brew services start mongodb-community
  ```
- **Windows**:
  Run `services.msc`, locate the **MongoDB Server** service, and click **Start**.
- **Linux (systemd)**:
  ```bash
  sudo systemctl start mongod
  ```

### 3. Configure Environment Variables
Create the `.env` configuration file inside the `backend/` folder:
- Copy from `/backend/.env.example`:
  ```bash
  cp backend/.env.example backend/.env
  ```
- Open `/backend/.env` and insert your API keys:
  ```env
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/ai_resume_analyzer
  JWT_SECRET=change_this_to_a_secure_secret
  OPENAI_API_KEY=your_openai_api_key_here
  GEMINI_API_KEY=your_gemini_api_key_here
  ```

### 4. Install Dependencies & Start Dev Servers
Run the following commands in the **root folder**:

```bash
# Install all root, frontend, and backend packages
npm run install-all

# Start both frontend and backend development servers concurrently
npm run dev
```

---

## Key URLs

- **Frontend Application**: [http://localhost:3000](http://localhost:3000) (Serves React + Vite; automatically proxies API requests)
- **Backend Server API**: [http://localhost:5000](http://localhost:5000) (Serves Express Endpoints)
