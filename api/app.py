# Import required FastAPI components for building the API
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
# Import Pydantic for data validation and settings management
from pydantic import BaseModel
# Import OpenAI client for interacting with OpenAI's API
from openai import OpenAI
import os
from typing import Optional

# Load environment variables from .env file only in development
if os.getenv("ENV") != "production":
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        # python-dotenv not available, skip loading .env
        pass

# Initialize FastAPI application with a title
app = FastAPI(title="OpenAI Chat API")

# Configure CORS (Cross-Origin Resource Sharing) middleware
# This allows the API to be accessed from different domains/origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from any origin
    allow_credentials=True,  # Allows cookies to be included in requests
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers in requests
)

# Define the data model for chat requests using Pydantic
# This ensures incoming request data is properly validated
class ChatRequest(BaseModel):
    developer_message: str  # Message from the developer/system
    user_message: str      # Message from the user
    model: Optional[str] = "gpt-4.1-mini"  # Optional model selection with default
    api_key: Optional[str] = None          # Optional OpenAI API key (can use env var)

# Define the main chat endpoint that handles POST requests
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Use API key from request or environment variable
        api_key = request.api_key or os.getenv("OPEN_API_KEY")
        if not api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        
        # Initialize OpenAI client with the API key
        client = OpenAI(api_key=api_key)
        
        # Test the API call first to catch errors before streaming
        try:
            # Create a streaming chat completion request
            stream = client.chat.completions.create(
                model=request.model,
                messages=[
                    {"role": "developer", "content": request.developer_message},
                    {"role": "user", "content": request.user_message}
                ],
                stream=True  # Enable streaming response
            )
        except Exception as openai_error:
            # Handle OpenAI-specific errors before streaming starts
            error_message = str(openai_error)
            
            if "RateLimitError" in str(type(openai_error)) or "429" in error_message:
                if "insufficient_quota" in error_message.lower():
                    error_message = "OpenAI API quota exceeded. You need to add a payment method and upgrade to a paid plan at https://platform.openai.com/account/billing"
                elif "billing_hard_limit_reached" in error_message.lower():
                    error_message = "OpenAI billing limit reached. Please add a payment method at https://platform.openai.com/account/billing"
                else:
                    error_message = "OpenAI API access denied. You need to add a payment method to use the API, even with free credits. Visit https://platform.openai.com/account/billing"
            elif "AuthenticationError" in str(type(openai_error)) or "401" in error_message:
                error_message = "Invalid API key. Please check your OpenAI API key."
            elif "InvalidRequestError" in str(type(openai_error)):
                error_message = f"Invalid request: {error_message}"
            else:
                error_message = f"OpenAI API error: {error_message}"
            
            raise HTTPException(status_code=500, detail=error_message)
        
        # Create an async generator function for streaming responses
        async def generate():
            # Yield each chunk of the response as it becomes available
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content

        # Return a streaming response to the client
        return StreamingResponse(generate(), media_type="text/plain")
    
    except HTTPException:
        # Re-raise HTTP exceptions (these are handled properly by FastAPI)
        raise
    except Exception as e:
        # Handle any other unexpected errors
        error_message = f"An unexpected error occurred: {str(e)}"
        raise HTTPException(status_code=500, detail=error_message)

# Define a root API endpoint
@app.get("/")
async def root():
    return {"message": "OpenAI Chat API", "status": "running", "endpoints": ["/chat", "/health"]}

# Define a health check endpoint to verify API status
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Entry point for running the application directly
if __name__ == "__main__":
    import uvicorn
    # Start the server on all network interfaces (0.0.0.0) on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
