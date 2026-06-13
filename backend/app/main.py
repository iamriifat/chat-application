from fastapi import FastAPI
from app.api.routes import auth, chat
from app.db.base import Base
from app.db.session import engine
from app.core.security import setup_cors

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Anonymous Chat Platform API")

# Setup CORS
setup_cors(app)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, tags=["chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Anonymous Chat API"}
