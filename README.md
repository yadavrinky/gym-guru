# 🏋️ Gym Guru — AI-Powered Fitness Assistant

> A full-stack AI fitness platform with real-time pose analysis, personalized coaching, and comprehensive nutrition tracking.

**🔗 Live Demo:** [https://unlox-ai.web.app](https://unlox-ai.web.app)

---

## ✨ Features

### 🤖 AI Camera Trainer
- **Real-time pose analysis** using MediaPipe + DTW (Dynamic Time Warping)
- Client-side skeletal tracking at **10 FPS** via WebSocket
- **Rep counting** with 120°/160° knee-angle state machine
- Live **form scoring** with instant coaching feedback

### 🔐 Authentication
- Email/Password registration & login
- **Google Sign-In** via Firebase Authentication
- JWT-secured API routes and WebSocket connections
- Multi-step **onboarding** for new users (Gender, DOB, Height, Weight, Goals)

### 📊 Dashboard & Analytics
- Real-time daily summary (Calories, Protein, Workout Duration, Active Burn)
- Weekly performance charts with **Recharts**
- Session history and form score tracking

### 🍽️ Diet Tracking
- Log meals with full macronutrient breakdown (Calories, Protein, Carbs, Fat)
- Daily nutrition summaries

### 💬 AI Chat
- **Gym Buddy** — Workout advice and exercise form tips (powered by Groq/LLaMA)
- **Dietitian** — Nutrition guidance and meal planning

### 👤 User Profile
- Editable profile with body measurements and fitness preferences
- Personalized experience based on fitness goals and experience level

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Python, FastAPI, Beanie/Motor ODM |
| **Database** | MongoDB |
| **AI/ML** | MediaPipe Pose, DTW (tslearn), Groq LLM |
| **Auth** | Firebase Auth (Google Sign-In), JWT |
| **Hosting** | Firebase Hosting |
| **Real-time** | WebSockets (FastAPI) |

---

## 📁 Project Structure

```
gym-guru/
├── backend/
│   ├── api/
│   │   ├── routes/          # REST endpoints (auth, diet, exercise, analytics)
│   │   └── websockets/      # WebSocket handlers (workout pose analysis)
│   ├── core/                # Config, security, JWT utilities
│   ├── db/models/           # Beanie/Motor document models
│   ├── services/            # PoseAnalyzer (DTW scoring)
│   └── main.py              # FastAPI application entry point
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   │   ├── dashboard/       # Daily summary dashboard
│   │   ├── workout/         # Exercise logging
│   │   ├── workout/live/    # AI Camera Trainer
│   │   ├── diet/            # Nutrition tracking
│   │   ├── chat/            # AI assistants (Buddy + Dietitian)
│   │   ├── analytics/       # Performance charts
│   │   ├── profile/         # User profile management
│   │   ├── onboarding/      # New user setup wizard
│   │   ├── login/           # Login (Email + Google)
│   │   └── register/        # Registration (Email + Google)
│   ├── components/          # Reusable UI components (shadcn/ui)
│   ├── context/             # AuthContext (JWT + user state)
│   └── lib/                 # API client, Firebase config, utilities
├── data/
│   └── benchmark_poses/     # Reference squat pose data for DTW
├── firebase.json            # Firebase Hosting config
└── .firebaserc              # Firebase project alias
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.10+ and **pip**
- **MongoDB** (local or Atlas)
- **Firebase** project with Authentication enabled

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "MONGODB_URL=mongodb://localhost:27017/gym_guru_db" > .env
echo "SECRET_KEY=your-secret-key" >> .env
echo "GROQ_API_KEY=your-groq-key" >> .env

# Start the server
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start dev server
npm run dev
```

### Firebase Deployment

```bash
# Build static export
cd frontend && npm run build

# Deploy to Firebase Hosting
cd .. && firebase deploy --only hosting
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Email/password registration |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google` | Google Sign-In |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/update-profile` | Update user profile |
| POST | `/api/exercise` | Log an exercise |
| GET | `/api/exercise/today` | Get today's exercises |
| POST | `/api/diet/food` | Log a food entry |
| GET | `/api/diet/today` | Get today's food entries |
| GET | `/api/analytics/summary/me` | Get analytics summary |
| GET | `/api/analytics/weekly-report/me` | Get weekly report |
| WS | `/api/websockets/workout/ws` | Real-time pose analysis |
| WS | `/api/buddy/chat` | AI Gym Buddy chat |

---

## 👨‍💻 Author

**Rinky Yadav** — [@yadavrinky](https://github.com/yadavrinky)

---

## 📄 License

This project is part of an internship program. All rights reserved.
