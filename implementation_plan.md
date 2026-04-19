# UNLOX AI Gym & Fitness Assistant Implementation Plan

This document outlines the architectural migration and the phased development approach to fulfill the updated specifications for the completely server-less-video AI Fitness ecosystem.

## Goal Description

We will restructure the existing MVP into a high-fidelity monorepo architecture. The architecture enforces 100% client-side inference using MediaPipe Pose WASM within a Next.js App Router frontend, maintaining strict payload constraints (< 50KB JSON for workout sessions). The backend will migrate to FastAPI + MongoDB (Motor & Beanie ODM) for fast asynchronous processing and modular AI services (pose evaluation via DTW, Chatbots via RAG, Habit prediction).

> [!IMPORTANT]
> - **Video Privacy Hard Constraint:** Camera never leaves the device. `useMediaPipe.ts` must purely process the `videoElement` entirely on the frontend without any backend WebSocket image streaming. 
> - **No IoT Services:** All IoT nodes, routes, and Node-RED dependencies have been excluded from the architecture.

---

## User Review Required

> [!WARNING]
> Please review the following structural changes! The existing frontend is currently using the **Pages Router** (`src/pages`). It will be heavily migrated to the **App Router** (`app/`). Existing backend logic (`app/routers/pose.py` and `app/routers/chat.py`) will be reimagined under `api/routes` with a strong division between API and Background AI workers.

---

## Proposed Changes

### Monorepo Restructuring

We will align the directory structure to the user's specification.

#### [NEW] [docker-compose.yml](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/docker-compose.yml)
#### [DELETE] [ml/](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/ml)
#### [NEW] [ai_modules/](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/ai_modules)
#### [NEW] [data/](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/data)

---

### Frontend Migration (Next.js 14 App Router)

Migrate from the `src/` directory to the `app/` directory alongside React 18, Tailwind, and Recharts.

#### [DELETE] [frontend/src/](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/frontend/src)
#### [NEW] [frontend/app/](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/frontend/app)
#### [NEW] [frontend/components/](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/frontend/components)
#### [NEW] [frontend/utils/angles.ts](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/frontend/utils/angles.ts)
#### [NEW] [frontend/utils/stateMachine.ts](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/frontend/utils/stateMachine.ts)

---

### Backend Migration (FastAPI, Beanie, Motor)

Shift the monolithic `backend/app/` structure to separated layers: `api`, `core`, `db`, and `services`. Integrating MongoDB initialization using Motor + Beanie.

#### [DELETE] [backend/app/](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/backend/app)
#### [NEW] [backend/api/](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/backend/api)
#### [NEW] [backend/core/](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/backend/core)
#### [NEW] [backend/db/](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/backend/db)
#### [NEW] [backend/services/](file:///d:/RINKY%20YADAV/Internship/AI%20GymFitness%20Assisstant/ai-fitness-ecosystem/backend/services)

---

## Phased Execution Strategy

We will build the application adhering strictly to the **Priority Build Order**:

1. **Auth + User Profile:** Setup JWT, Beanie Models (`unlox_db.users`), Register/Login endpoints, Next.js auth context.
2. **Camera + MediaPipe (Client-Side):** 
   - `WebcamTracker` component
   - WASM initialization via `@mediapipe/pose`
   - Angle computation (`utils/angles.ts`) and FSM Rep Counter (`utils/stateMachine.ts`)
   - `<canvas>` overlay rendering.
3. **Workout Session API:** Building the `< 50KB` data transmitter (`/api/workout/session`). Stores lightweight skeletal telemetry per rep into `unlox_db.workout_sessions`.
4. **Pose Analyzer (DTW):** A background task consuming the lightweight session payload against benchmark models to derive performance score.
5. **AI Dietician:** MongoDB Atlas Vector Search + Next.js WebSocket UI for RAG chatbot.
6. **Gym Buddy:** Sentiment classification via DistilBERT and personalized tone framing.
7. **Habit Tracker:** Scheduled offline training task via SCP using Gradient Boosting Classifier (GBM).
8. **Gym Recommender System:** 2dsphere indexing and Semantic gym querying.
9. **Admin Dashboard:** Real-time analytics view.

---

## Open Questions

> [!CAUTION]
> 1. Since MongoDB Atlas is required for the Vector Search (required by the AI Dietician and Recommender), do you possess an Atlas URI (`mongodb+srv://...`) or should we use local MongoDB without the exact semantic vector indexes to mock the functionality first?
> 2. The Pose Analyzer suggests PyTorch LSTM and scikit-learn models. Given we want continuous progress, would you like me to start by developing the structure and mocked version of the AI endpoints, and sequentially drop in the complex ML pipelines? 

## Verification Plan

### Automated Tests
- Writing basic FastAPI unit tests with `pytest` for the Auth API, Workout Session parsing to guarantee the payload constraint.
- Checking component mounts in Next.js. 

### Manual Verification
- Testing the frontend App structure inside `npm run dev`.
- Evaluating WASM pose estimation locally (using front-facing camera fallback).
- Inspecting Network payload to guarantee POST `< 50KB` for session logs.
