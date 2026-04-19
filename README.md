# 🧠 IntelliHire — AI-Powered Recruitment Platform

An end-to-end hiring platform where companies post jobs, candidates apply,
and an **Agentic RAG system** autonomously screens resumes, answers candidate
queries, and generates intelligent shortlists — built on microservices.

---

## 🏗️ Architecture Overview
```
                    ┌─────────────────┐
                    │  React Frontend │
                    └────────┬────────┘
                             │ HTTP / WebSocket
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │    (NestJS)     │
                    └────────┬────────┘
                             │
          ┌──────────────────▼──────────────────┐
          │           Kafka Event Bus            │
          └──┬───────────────┬──────────────┬───┘
             │               │              │
    ┌────────▼──────┐ ┌──────▼──────┐ ┌────▼──────────────┐
    │  Job Service  │ │  Candidate  │ │    RAG Service     │
    │  (Postgres)   │ │   Service   │ │    (pgvector)      │
    └───────────────┘ │ (Postgres)  │ └────────────────────┘
                      └─────────────┘
                             │
                    ┌────────▼────────┐
                    │  Notification   │
                    │    Service      │
                    └─────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, TailwindCSS |
| API Gateway | NestJS, JWT Auth, WebSockets |
| Microservices | NestJS (modular) |
| Message Broker | Apache Kafka |
| Databases | PostgreSQL 16 (per service) |
| AI / Vector Search | pgvector, Agentic RAG, OpenAI Embeddings |
| Infrastructure | Docker, Docker Compose |

## 📦 Services

| Service | Port | Responsibility |
|---|---|---|
| `api-gateway` | 3000 | Auth, routing, WebSocket hub |
| `job-service` | 3001 | Job CRUD, search |
| `candidate-service` | 3002 | Profiles, resume upload |
| `rag-service` | 3003 | Embeddings, AI screening agent |
| `notification-service` | 3004 | Email/event notifications |
| `frontend` | 5173 | React UI |

## 🗄️ Infrastructure Ports

| Container | Port |
|---|---|
| Kafka | 9092 |
| Zookeeper | 2181 |
| Kafka UI | 8080 |
| job-db | 5433 |
| candidate-db | 5434 |
| rag-db (pgvector) | 5435 |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop
- Git

### Run the Infrastructure
```bash
# Clone the repo
git clone https://github.com/shak612/intellihire.git
cd intellihire

# Copy env file
cp .env.example .env

# Start all containers
docker-compose up -d

# Verify containers
docker ps
```

Open **http://localhost:8080** to see the Kafka UI dashboard.

## 🗺️ Build Phases

- [x] **Phase 0** — Monorepo scaffold, Docker infrastructure (Kafka, DBs)
- [ ] **Phase 1** — NestJS microservices bootstrap, DB connections
- [ ] **Phase 2** — Kafka event-driven pipeline (resume upload → ingestion → notification)
- [ ] **Phase 3** — Agentic RAG (embeddings, vector search, AI screening agent)
- [ ] **Phase 4** — React frontend, dashboards, real-time chat

## 📁 Project Structure
```
intellihire/
├── apps/
│   ├── api-gateway/
│   ├── job-service/
│   ├── candidate-service/
│   ├── rag-service/
│   ├── notification-service/
│   └── frontend/
├── libs/
│   └── shared/           # Shared DTOs, types, constants
├── docker-compose.yml
├── .env.example
└── README.md
```

## 👤 Author

Built as a portfolio project demonstrating:
- Microservices architecture
- Event-driven design with Kafka
- Agentic RAG with pgvector
- Full-stack TypeScript (NestJS + React)
