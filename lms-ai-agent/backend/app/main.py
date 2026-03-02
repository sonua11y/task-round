from app.db.session import engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth_routes, profile_routes, chatbot_routes
from dotenv import load_dotenv

load_dotenv()

import os
# warn if the OpenAI key is missing early so developers notice
if not os.getenv("OPENAI_API_KEY"):
    print("WARNING: OPENAI_API_KEY is not set.  The chatbot agent will be inactive until you provide a valid key (set it in your environment or in .env).")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(profile_routes.router, prefix="/profile", tags=["Profile"])
app.include_router(chatbot_routes.router, prefix="/chat", tags=["Chatbot"])
print("Connected DB:", engine.url)