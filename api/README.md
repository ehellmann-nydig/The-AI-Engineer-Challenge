# OpenAI Chat API Backend

This is a FastAPI-based backend service that provides a streaming chat interface using OpenAI's API.

## Prerequisites

- Python 3.13 or higher
- uv (package manager) - see project root for setup
- An OpenAI API key

## Setup

This API is part of the main project and uses `uv` for dependency management. Dependencies are managed in the root `pyproject.toml` file.

From the project root directory:

1. Install dependencies:
```bash
uv sync
```

2. Set up environment variables (development):
```bash
# Create/edit .env file in project root
OPEN_API_KEY=your-openai-api-key-here
```

## Running the Server

### Development Mode (Recommended)
From the project root:
```bash
python run_dev.py
```
This starts both the API server and frontend.

### API Only
```bash
uv run uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode
```bash
python run_prod.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### Chat Endpoint
- **URL**: `/api/chat`
- **Method**: POST
- **Request Body**:
```json
{
    "developer_message": "string",
    "user_message": "string",
    "model": "gpt-4.1-mini",  // optional
    "api_key": "your-openai-api-key"
}
```
- **Response**: Streaming text response

### Health Check
- **URL**: `/api/health`
- **Method**: GET
- **Response**: `{"status": "ok"}`

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## CORS Configuration

The API is configured to accept requests from any origin (`*`). This can be modified in the `app.py` file if you need to restrict access to specific domains.

## Error Handling

The API includes basic error handling for:
- Invalid API keys
- OpenAI API errors
- General server errors

All errors will return a 500 status code with an error message. 