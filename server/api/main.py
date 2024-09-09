from fastapi import APIRouter

from .routes import game

api_router = APIRouter()

api_router.include_router(game.router, prefix="/game", tags=["game"])