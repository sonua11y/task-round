from fastapi import APIRouter, Depends
from app.schemas.chatbot import ChatRequest, ChatResponse
from app.services.chatbot_service import process_query
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=ChatResponse)
def chat(data: ChatRequest,
         user = Depends(get_current_user)):

    reply = process_query(user, data.message)
    return {"reply": reply}