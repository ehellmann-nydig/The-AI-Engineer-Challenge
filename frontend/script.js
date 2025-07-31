class ChatApp {
    constructor() {
        this.apiKey = localStorage.getItem('openai_api_key') || '';
        this.model = localStorage.getItem('model') || 'gpt-4.1-mini';
        this.systemMessage = localStorage.getItem('system_message') || 'You are a helpful AI assistant. Provide clear, accurate, and concise responses to user queries.';
        this.isStreaming = false;
        
        this.initializeElements();
        this.bindEvents();
        this.loadConfiguration();
        this.updateSendButtonState();
    }

    initializeElements() {
        // Main elements
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.statusText = document.getElementById('statusText');
        
        // Config panel elements
        this.configPanel = document.getElementById('configPanel');
        this.configBtn = document.getElementById('configBtn');
        this.closeConfigBtn = document.getElementById('closeConfig');
        this.apiKeyInput = document.getElementById('apiKey');
        this.modelSelect = document.getElementById('model');
        this.systemMessageInput = document.getElementById('systemMessage');
        this.saveConfigBtn = document.getElementById('saveConfig');
        
        // Other buttons
        this.clearBtn = document.getElementById('clearBtn');
    }

    bindEvents() {
        // Send message events
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
            this.updateSendButtonState();
        });

        // Config panel events
        this.configBtn.addEventListener('click', () => this.openConfigPanel());
        this.closeConfigBtn.addEventListener('click', () => this.closeConfigPanel());
        this.saveConfigBtn.addEventListener('click', () => this.saveConfiguration());

        // Clear chat event
        this.clearBtn.addEventListener('click', () => this.clearChat());

        // Close config panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.configPanel.classList.contains('open') && 
                !this.configPanel.contains(e.target) && 
                !this.configBtn.contains(e.target)) {
                this.closeConfigPanel();
            }
        });
    }

    loadConfiguration() {
        this.apiKeyInput.value = this.apiKey;
        this.modelSelect.value = this.model;
        this.systemMessageInput.value = this.systemMessage;
        this.updateSendButtonState();
    }

    saveConfiguration() {
        this.apiKey = this.apiKeyInput.value.trim();
        this.model = this.modelSelect.value;
        this.systemMessage = this.systemMessageInput.value.trim();

        // Save to localStorage
        localStorage.setItem('openai_api_key', this.apiKey);
        localStorage.setItem('model', this.model);
        localStorage.setItem('system_message', this.systemMessage);

        this.updateSendButtonState();
        this.closeConfigPanel();
        this.updateStatus('Configuration saved successfully!');

        // Update welcome message if this is the first time setting up
        if (this.apiKey && this.chatMessages.children.length === 1) {
            this.clearChat();
            this.addMessage('assistant', 'Great! Your API key has been configured. You can now start chatting with me. How can I help you today?');
        }
    }

    updateSendButtonState() {
        const hasMessage = this.messageInput.value.trim().length > 0;
        // Allow sending if we have a message and either have an API key or are in dev mode
        this.sendBtn.disabled = !hasMessage || this.isStreaming;
    }

    openConfigPanel() {
        this.configPanel.classList.add('open');
    }

    closeConfigPanel() {
        this.configPanel.classList.remove('open');
    }

    clearChat() {
        this.chatMessages.innerHTML = '';
    }

    addMessage(role, content, isStreaming = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = role === 'user' ? '👤' : '🤖';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${content}</p>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }

    addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                AI is typing
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        return typingDiv;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    addErrorMessage(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        
        // Special handling for quota errors to provide more helpful information
        if (error.includes('quota') || error.includes('billing') || error.includes('budget') || error.includes('payment method')) {
            errorDiv.innerHTML = `
                <div style="margin-bottom: 10px;"><strong>❌ OpenAI Payment Required</strong></div>
                <div style="font-size: 14px; line-height: 1.4;">
                    OpenAI now requires a payment method to use their API, even with free credits:<br><br>
                    💳 <strong>Add payment method:</strong> <a href="https://platform.openai.com/account/billing" target="_blank" style="color: #fff; text-decoration: underline;">platform.openai.com/billing</a><br>
                    💰 <strong>Add a credit card</strong> (you'll still use free credits first)<br>
                    � <strong>Choose a paid plan</strong> (starts at $5/month minimum)<br>
                    🔄 <strong>Wait a few minutes</strong> after adding payment method<br><br>
                    <em>Free tier users can no longer access the API without a payment method on file</em>
                </div>
            `;
        } else {
            errorDiv.innerHTML = `<strong>Error:</strong> ${error}`;
        }
        
        this.chatMessages.appendChild(errorDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    updateStatus(message) {
        this.statusText.textContent = message;
        setTimeout(() => {
            if (this.statusText.textContent === message) {
                this.statusText.textContent = 'Ready';
            }
        }, 3000);
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isStreaming) return;

        // Add user message to chat
        this.addMessage('user', message);
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.updateSendButtonState();

        // Show typing indicator
        const typingIndicator = this.addTypingIndicator();
        this.isStreaming = true;
        this.updateSendButtonState();
        this.updateStatus('AI is thinking...');

        try {
            // Determine the API URL based on the current location
            const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                ? 'http://localhost:8000/api/chat'
                : '/api/chat';

            // Prepare request body - only include api_key if we have one
            const requestBody = {
                developer_message: this.systemMessage,
                user_message: message,
                model: this.model
            };
            
            // Only include API key if we have one (for development vs production)
            if (this.apiKey) {
                requestBody.api_key = this.apiKey;
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            this.removeTypingIndicator();

            if (!response.ok) {
                let errorDetail = 'Unknown error occurred';
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.detail || errorDetail;
                    console.log('API Error Response:', errorData);
                } catch (parseError) {
                    console.log('Failed to parse error response:', parseError);
                    errorDetail = `HTTP ${response.status}: ${response.statusText}`;
                }
                console.log('Throwing error with detail:', errorDetail);
                throw new Error(errorDetail);
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = this.addMessage('assistant', '');
            let fullResponse = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                fullResponse += chunk;
                
                // Update the assistant message content
                const messageContent = assistantMessage.querySelector('.message-content p');
                messageContent.textContent = fullResponse;
                this.scrollToBottom();
            }

            this.updateStatus('Response completed');

        } catch (error) {
            console.error('Error sending message:', error);
            this.removeTypingIndicator();
            
            let errorMessage = error.message || 'Failed to send message. Please try again.';
            
            // Handle different types of errors based on the actual error message
            if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
                errorMessage = '❌ OpenAI API quota exceeded. Please check your billing at https://platform.openai.com/account/billing';
                this.addErrorMessage(errorMessage);
                
            } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
                errorMessage = '⏳ Rate limit exceeded. Please wait a moment and try again.';
                this.addErrorMessage(errorMessage);
                
            } else if (errorMessage.includes('401') || errorMessage.includes('authentication') || errorMessage.includes('Invalid API key')) {
                errorMessage = '🔑 Invalid API key. Please check your OpenAI API key in settings.';
                this.addErrorMessage(errorMessage);
                
            } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Connection failed')) {
                errorMessage = '🔌 Connection failed. Make sure the backend server is running on port 8000.';
                this.addErrorMessage(errorMessage);
                
            } else {
                // Generic error handling
                this.addErrorMessage(`❌ ${errorMessage}`);
            }
            
            this.updateStatus('Error occurred');
        } finally {
            this.isStreaming = false;
            this.updateSendButtonState();
        }
    }
}

// Initialize the chat app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
