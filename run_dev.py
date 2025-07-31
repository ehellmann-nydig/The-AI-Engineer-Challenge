#!/usr/bin/env python3
"""
Simple script to run both the FastAPI backend and serve the frontend
"""
import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path

def run_backend():
    """Run the FastAPI backend"""
    print("🚀 Starting FastAPI backend on http://localhost:8000")
    api_dir = Path(__file__).parent / "api"
    
    # Set development environment
    env = os.environ.copy()
    env["ENV"] = "development"
    
    return subprocess.Popen([
        "uv", "run", "uvicorn", "app:app", 
        "--host", "0.0.0.0", "--port", "8000", "--reload"
    ], cwd=api_dir, env=env)

def run_frontend():
    """Run the frontend server"""
    print("🌐 Starting frontend server on http://localhost:3000")
    frontend_dir = Path(__file__).parent / "frontend"
    return subprocess.Popen([
        sys.executable, "-m", "http.server", "3000"
    ], cwd=frontend_dir)

def main():
    print("🤖 AI Chat Assistant - Starting Development Servers")
    print("=" * 50)
    
    # Start backend
    backend_process = run_backend()
    
    # Wait a moment for backend to start
    time.sleep(2)
    
    # Start frontend
    frontend_process = run_frontend()
    
    # Wait a moment for frontend to start
    time.sleep(2)
    
    print("\n✅ Both servers are running!")
    print("📖 Backend API: http://localhost:8000")
    print("🎨 Frontend: http://localhost:3000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("\n💡 Press Ctrl+C to stop both servers")
    
    # Open browser
    try:
        webbrowser.open("http://localhost:3000")
    except:
        pass
    
    try:
        # Wait for keyboard interrupt
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        
        # Wait for processes to terminate
        backend_process.wait()
        frontend_process.wait()
        
        print("✅ Servers stopped successfully!")

if __name__ == "__main__":
    main()
