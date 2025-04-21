# Airbnb Photo Enhancer Backend

This backend is built with FastAPI and Python for serving AI-powered image enhancement APIs.

## Structure
- `app/`: Main FastAPI app and services
- `data/`: Data processing scripts

## Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Development Notes
- All main logic is in `app/services/`
- Extend models and endpoints as needed
