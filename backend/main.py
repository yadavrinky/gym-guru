from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from db.models.users import User
from db.models.workout import WorkoutSession
from api.routes import auth, workout, diet, buddy, habit, recommender, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client.gym_guru_db,
        document_models=[User, WorkoutSession],
    )
    yield
    # Shutdown
    client.close()

app = FastAPI(
    title="GYM GURU AI Fitness API",
    description="Camera-only AI Gym & Fitness Assistant by Rivoquix Learning",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://gym-guru-ai.web.app",
        "https://gym-guru-ai.firebaseapp.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(workout.router, prefix="/api/workout", tags=["workout"])
app.include_router(diet.router, prefix="/api/diet", tags=["diet"])
app.include_router(buddy.router, prefix="/api/buddy", tags=["buddy"])
app.include_router(habit.router, prefix="/api/habit", tags=["habit"])
app.include_router(recommender.router, prefix="/api/recommender", tags=["recommender"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "app": "GYM GURU AI Fitness API", "version": "1.0.0"}
