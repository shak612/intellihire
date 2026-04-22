# 🧠 IntelliHire — AI-Powered Recruitment Platform

An end-to-end hiring platform where companies post jobs, candidates apply,
and an **Agentic RAG system** autonomously screens resumes, answers candidate
queries, and generates intelligent shortlists — built on microservices.

---

## 🏗️ Architecture Overview
```
                      ┌─────────────────┐
                     │  React Frontend  │
                     │  (Vite + React)  │
                     └────────┬─────────┘
                              │ HTTP / REST
                     ┌────────▼─────────┐
                     │   API Gateway    │
                     │  JWT Auth + CORS │
                     └────────┬─────────┘
                              │
      ┌───────────────────────▼──────────────────────┐
      │                Kafka Event Bus                │
      │   resume.uploaded · match.result · job.created│
      └──┬─────────────────┬──────────────────┬───────┘
         │                 │                  │
┌────────▼──────┐ ┌────────▼───────┐ ┌───────▼──────────────┐
│  Job Service  │ │   Candidate    │ │     RAG Service      │
│  (Postgres)   │ │   Service      │ │  Ollama + pgvector   │
└───────────────┘ │  (Postgres)    │ └──────────────────────┘
                  └────────────────┘          │
                                     ┌────────▼────────┐
                                     │  Notification   │
                                     │ Nodemailer SMTP │
                                     └─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, TailwindCSS, Recharts |
| API Gateway | NestJS, JWT Auth, Passport, Role-based Guards |
| Microservices | NestJS (Nx monorepo) |
| Message Broker | Apache Kafka + KafkaJS |
| Databases | PostgreSQL 16 (per service) |
| AI Embeddings | Ollama (nomic-embed-text 768-dim) |
| AI Agent | Ollama (llama3.2) — agentic loop with query reformulation |
| Vector Search | pgvector — cosine similarity search |
| Email | Nodemailer + Gmail SMTP |
| Infrastructure | Docker, Docker Compose (12 containers) |

---

## 📦 Services

| Service | Port | Responsibility |
|---|---|---|
| `api-gateway` | 3000 | JWT auth, register/login, role-based routing |
| `job-service` | 3001 | Job CRUD — recruiters post, candidates browse |
| `candidate-service` | 3002 | Resume upload, Kafka producer |
| `rag-service` | 3003 | Embeddings, pgvector search, AI agent, chatbot |
| `notification-service` | 3004 | Email notifications on match results |
| `frontend` | 5173 | React UI — recruiter dashboard + candidate portal |

---

## 🗄️ Infrastructure

| Container | Port | Purpose |
|---|---|---|
| Kafka | 9092 | Event bus |
| Zookeeper | 2181 | Kafka coordination |
| Kafka UI | 8080 | Visual Kafka dashboard |
| auth-db | 5436 | Users (JWT auth) |
| job-db | 5433 | Jobs |
| candidate-db | 5434 | Candidates |
| rag-db (pgvector) | 5435 | Resume + JD embeddings |

---

## ⚡ Kafka Event Pipeline

```
Candidate uploads resume
↓
candidate-service → publishes "resume.uploaded"
↓
rag-service → chunks + embeds resume → scores vs job embeddings
↓
rag-service → publishes "match.result" (real score + reasoning)
↓
notification-service → sends email with score + job title
Recruiter posts job
↓
job-service → publishes "job.created"
↓
rag-service → chunks + embeds job description into pgvector

```

---

## 🧠 Agentic RAG — How It Works

```
1. Resume Upload  → chunk text → nomic-embed-text → store vector(768) in pgvector
2. Job Post       → chunk JD  → nomic-embed-text → store vector(768) in pgvector
3. Recruiter Search:
   → embed query → cosine similarity search → top-K candidates
   → llama3.2 scores each candidate (0-100) + explains reasoning
   → if weak results → agent reformulates query → retries (agentic loop)
4. Candidate Chatbot:
   → embed question → retrieve JD context from pgvector
   → llama3.2 answers "Am I a good fit?" with real job context
```

---

## 🖥️ Frontend Features

### Recruiter Dashboard
- JWT login/register with role selection
- AI shortlist — search candidates by job description
- Match scores (0-100) with LLM reasoning
- Post jobs with skills tagging
- Analytics dashboard — charts, score distribution, top skills

### Candidate Portal
- Browse live jobs from job-service
- Upload resume (triggers full AI pipeline)
- AI chatbot — ask questions about job fit
- Real-time match score via email notification

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git
- Ollama ([ollama.com](https://ollama.com)) with models pulled:
```bash
  ollama pull nomic-embed-text
  ollama pull llama3.2
```

### Run the Full Stack

```bash
# Clone the repo
git clone https://github.com/shak612/intellihire.git
cd intellihire

# Copy env file and fill in values
cp .env.example .env

# Start everything (12 containers)
docker-compose up -d --build

# Verify all containers
docker ps
```

Open **http://localhost:5173** to use the app.
Open **http://localhost:8080** for the Kafka UI dashboard.

### Environment Variables

```env
POSTGRES_USER=intellihire
POSTGRES_PASSWORD=your_password

JOB_DB_NAME=job_db
JOB_DB_PORT=5433

CANDIDATE_DB_NAME=candidate_db
CANDIDATE_DB_PORT=5434

RAG_DB_NAME=rag_db
RAG_DB_PORT=5435

AUTH_DB_HOST=localhost
AUTH_DB_PORT=5436

KAFKA_BROKER=localhost:9092
JWT_SECRET=your_jwt_secret

OLLAMA_BASE_URL=http://localhost:11434

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=IntelliHire <your-gmail@gmail.com>
```

---

## 📁 Project Structure

```
intellihire/
├── apps/
│   ├── api-gateway/          # JWT auth, guards, strategies
│   ├── job-service/          # Job CRUD + Kafka producer
│   ├── candidate-service/    # Resume upload + Kafka producer
│   ├── rag-service/          # Embeddings, agent, pgvector, chatbot
│   ├── notification-service/ # Email notifications
│   └── frontend/             # React + Tailwind + Recharts
├── libs/
│   └── shared/               # Shared DTOs, Kafka module
├── docker-compose.yml        # 12-container stack
├── .env.example
└── README.md
```

---

## 🗺️ Build Phases

- [x] **Phase 0** — Docker infrastructure (Kafka, 4x Postgres, pgvector)
- [x] **Phase 1** — 5 NestJS microservices with TypeORM (Nx monorepo)
- [x] **Phase 2** — Kafka event pipeline (resume.uploaded → match.result → notification)
- [x] **Phase 3** — Agentic RAG (Ollama embeddings, pgvector search, LLM agent loop, chatbot)
- [x] **Phase 4** — React frontend (recruiter dashboard, candidate portal, analytics)
- [x] **Phase 5** — JWT auth, job CRUD, real emails, analytics charts, full Docker Compose

---

## 👤 Author

Built as a portfolio project demonstrating:
- **Microservices architecture** — 5 independent NestJS services
- **Event-driven design** — Kafka decouples all services
- **Agentic RAG** — autonomous multi-step AI reasoning with self-correction
- **Full-stack TypeScript** — NestJS + React + shared types
- **Production infrastructure** — 12 Docker containers, one command deploy