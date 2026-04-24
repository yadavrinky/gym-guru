# 🏋️‍♂️ GYM GURU: Camera-only AI Gym & Fitness Assistant

GYM GURU is a cutting-edge, full-stack fitness ecosystem that leverages computer vision and artificial intelligence to provide real-time form correction, personalized coaching, and comprehensive health analytics.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose-007FFF?style=for-the-badge&logo=google)

---

## 🚀 Key Features

### 1. **AI Workout Assistant (Vision-Based)**
- Real-time pose analysis using **MediaPipe**.
- Form correction and rep counting via camera input.
- Detailed workout session logs and performance metrics.

### 2. **Personalized AI Dietitian**
- AI-driven meal planning and nutritional advice.
- Calorie tracking and dietary goal management.
- Dynamic recommendations based on user progress and preferences.

### 3. **Smart Habit Tracker**
- Habit prediction models to identify patterns and suggest improvements.
- Streak tracking and gamified fitness milestones.

### 4. **AI Fitness Buddy**
- Social features and AI companionship to keep users motivated.
- Community challenges and progress sharing.

### 5. **Advanced Analytics Dashboard**
- Visual representation of fitness data using **Recharts**.
- Historical trend analysis and predictive health insights.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, React, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | FastAPI (Python), Beanie ODM, Motor |
| **AI/ML** | MediaPipe (Pose Estimation), Custom NLP & Habit Prediction Models |
| **Database** | MongoDB (Cloud Atlas) |
| **Auth** | Firebase Authentication |
| **DevOps** | Docker, Docker Compose, Vercel |

---

## 🏗️ Project Structure

```text
GYM-GURU/
├── frontend/           # Next.js Application
│   ├── app/            # App Router (Pages & Layouts)
│   ├── components/     # UI Components
│   └── services/       # API integration
├── backend/            # FastAPI Application
│   ├── api/            # Routes and Controllers
│   ├── core/           # Configuration and Security
│   ├── db/             # MongoDB Models (Beanie)
│   └── services/       # Business Logic
├── ai_modules/         # Core AI/ML Logic
│   ├── pose_analyzer/  # Computer Vision Logic
│   ├── nlp/            # Natural Language Processing
│   └── habit_predictor/# Predictive Modeling
└── data/               # Local data storage/datasets
```

---

## 🏁 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Instance
- Firebase Project (for Authentication)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables in `.env`.
5. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`.
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🐳 Docker Deployment
Run the entire ecosystem using Docker Compose:
```bash
docker-compose up --build
```

---

## 📄 License
This project is developed by **Rivoquix Learning**. All rights reserved.

---

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements.
