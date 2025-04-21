"""
Main entry point for the FastAPI backend server.
Handles routing and server startup.
"""
from fastapi import FastAPI
from app.api import routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Airbnb Photo Enhancer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
def include_routes(app):
    app.include_router(routes.router)

include_routes(app)

# To run: uvicorn app.main:app --reload
