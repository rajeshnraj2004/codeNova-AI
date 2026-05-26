# CodeNova AI

An AI-powered coding assistant SaaS — generate, debug, and explain code instantly. Built with React, Node.js, MongoDB, and OpenAI/Gemini.

![CodeNova AI](https://img.shields.io/badge/React-19-blue) ![Node](https://img.shields.io/badge/Node-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-8-green)

## Features

- **Landing Page** — Modern hero, feature cards, glassmorphism UI
- **AI Playground** — Monaco editor with generate, fix, and explain actions
- **Authentication** — JWT login/register with protected routes
- **Dashboard** — Usage analytics, chat history, saved snippets
- **AI Integration** — OpenAI or Google Gemini API

## Tech Stack

| Layer    | Technologies                                      |
|----------|---------------------------------------------------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, Monaco  |
| Backend  | Node.js, Express, MongoDB, JWT                    |
| AI       | OpenAI GPT-4o-mini or Gemini 1.5 Flash            |

## Project Structure

```
codeNova-AI/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── context/
│   │   └── hooks/
│   └── package.json
├── backend/           # Express API
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── utils/
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- OpenAI API key **or** Google Gemini API key

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT_SECRET, and API keys
npm install
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to `http://localhost:5000`.

### Environment Variables

**Backend (`backend/.env`)**

| Variable         | Description                          |
|------------------|--------------------------------------|
| `PORT`           | Server port (default: 5000)          |
| `MONGODB_URI`    | MongoDB connection string            |
| `JWT_SECRET`     | Secret for signing JWT tokens        |
| `OPENAI_API_KEY`     | OpenAI API key                                       |
| `OPENROUTER_API_KEY` | OpenRouter API key                                   |
| `OPENROUTER_MODEL`   | OpenRouter model name (default: `gpt-4o-mini`)        |
| `GEMINI_API_KEY`     | Google Gemini API key (alternative)                  |
| `AI_PROVIDER`        | `openai`, `openrouter`, or `gemini`                  |
| `CLIENT_URL`         | Frontend URL for CORS                                |

**Frontend (`frontend/.env`)**

| Variable       | Description                    |
|----------------|--------------------------------|
| `VITE_API_URL` | API base URL (default: `/api`) |

## API Endpoints

| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| POST   | `/api/auth/register`        | Register user      |
| POST   | `/api/auth/login`           | Login user         |
| GET    | `/api/auth/me`              | Get current user   |
| POST   | `/api/ai/generate`          | Generate code      |
| POST   | `/api/ai/fix`               | Fix buggy code     |
| POST   | `/api/ai/explain`           | Explain code       |
| GET    | `/api/dashboard/history`    | Chat history       |
| GET    | `/api/dashboard/snippets`   | Saved snippets     |
| GET    | `/api/dashboard/stats`      | Usage statistics   |

## Production Build

```bash
cd frontend && npm run build
cd backend && npm start
```

Serve the `frontend/dist` folder with any static host and point `VITE_API_URL` to your deployed API.

## License

MIT
