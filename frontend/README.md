# AI Chat Assistant Frontend

A modern, responsive web frontend for the AI Chat Assistant application. This frontend provides a clean, intuitive interface for chatting with OpenAI's GPT models through your FastAPI backend.

## Features

- **Modern UI**: Clean, gradient-based design with smooth animations
- **Real-time Streaming**: Displays AI responses as they are generated
- **Configurable Settings**: Easy-to-use settings panel for API key, model selection, and system messages
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage**: Saves your configuration locally for convenience
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Typing Indicators**: Visual feedback when the AI is processing your request

## Quick Start

### Option 1: Serve with Python (Recommended for Development)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start a local HTTP server:
   ```bash
   # Python 3
   python -m http.server 8080
   
   # Or if you have Python 2
   python -m SimpleHTTPServer 8080
   ```

3. Open your browser and go to: `http://localhost:8080`

### Option 2: Serve with Node.js

1. Install a simple HTTP server:
   ```bash
   npm install -g http-server
   ```

2. Navigate to the frontend directory and start the server:
   ```bash
   cd frontend
   http-server -p 8080
   ```

3. Open your browser and go to: `http://localhost:8080`

### Option 3: Open Directly in Browser

You can also open the `index.html` file directly in your browser, but you may encounter CORS issues when trying to connect to your API.

## Configuration

1. **Start your FastAPI backend** first (make sure it's running on `http://localhost:8000`)

2. **Open the frontend** in your browser

3. **Click the ⚙️ Settings button** to configure:
   - **OpenAI API Key**: Enter your OpenAI API key (required)
   - **Model**: Choose your preferred GPT model (default: gpt-4.1-mini)
   - **System Message**: Customize the AI's behavior and personality

4. **Click "Save Configuration"** to store your settings locally

5. **Start chatting!** Type your message and press Enter or click the send button

## File Structure

```
frontend/
├── index.html      # Main HTML file with the chat interface
├── styles.css      # All styling and responsive design
├── script.js       # JavaScript for chat functionality and API integration
└── README.md       # This file
```

## API Integration

The frontend automatically detects whether you're running locally or in production:

- **Local Development**: Connects to `http://localhost:8000/api/chat`
- **Production**: Uses relative path `/api/chat`

## Browser Compatibility

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile browsers**: iOS Safari, Chrome Mobile, Samsung Internet

## Security Notes

- Your OpenAI API key is stored locally in your browser's localStorage
- The API key is never sent to any server other than OpenAI's API
- All communication with your FastAPI backend uses HTTPS in production

## Troubleshooting

### Common Issues

1. **"Failed to fetch" error**:
   - Make sure your FastAPI backend is running on port 8000
   - Check that CORS is properly configured in your backend

2. **API key not working**:
   - Verify your OpenAI API key is correct
   - Check that you have sufficient credits in your OpenAI account

3. **Blank responses**:
   - Try a different model (gpt-3.5-turbo is more reliable)
   - Check your system message isn't conflicting

4. **Styling issues**:
   - Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
   - Clear your browser cache

### Development Tips

- Open browser developer tools (F12) to see any console errors
- Check the Network tab to monitor API requests
- Use the console to inspect the application state

## Customization

### Styling
Edit `styles.css` to customize colors, fonts, and layout. The design uses CSS custom properties for easy theming.

### Functionality  
Modify `script.js` to add new features like:
- Message history persistence
- Export chat conversations
- Custom message formatting
- Additional model parameters

### UI Elements
Update `index.html` to add new interface elements or modify the layout structure.

## Production Deployment

For production deployment, consider:

1. **Minifying assets** for better performance
2. **Using a CDN** for static file serving
3. **Implementing proper error tracking**
4. **Adding analytics** if needed
5. **Setting up proper HTTPS** configuration