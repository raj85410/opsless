import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User,
  Code,
  FileText,
  Settings
} from 'lucide-react';
import { collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ChatMessage } from '../../types';

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyAc23Xbf3ETuTGVaRAyWQ3RK8aHCFSQJqk';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const ChatBot: React.FC = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatType, setChatType] = useState<'dockerfile' | 'jenkinsfile' | 'k8s' | 'general'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = useCallback(async () => {
    try {
      const chatQuery = query(
        collection(db, 'chats'),
        where('userId', '==', currentUser!.uid),
        orderBy('timestamp', 'asc')
      );
      const chatSnapshot = await getDocs(chatQuery);
      const chatData = chatSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp instanceof Date ? data.timestamp : new Date(data.timestamp)
        };
      }) as ChatMessage[];
      setMessages(chatData);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadChatHistory();
    }
  }, [isOpen, currentUser, loadChatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGeminiAPI = async (message: string, context: string): Promise<string> => {
    try {
      const prompt = `You are a helpful DevOps assistant. The user is asking about ${context}. 
      
User question: ${message}

Please provide a helpful, detailed response that includes:
- Clear explanations
- Code examples when relevant
- Best practices
- Troubleshooting tips if applicable

Keep your response concise but comprehensive. If the user is asking about their project, provide specific guidance that would help them with their DevOps tasks.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return `I apologize, but I'm having trouble connecting to my AI service right now. Here's what I can help you with:

**For ${context} questions:**
- Docker containerization and optimization
- Jenkins CI/CD pipeline setup
- Kubernetes deployment and management
- General DevOps best practices
- Project-specific guidance

Please try asking your question again, or I can provide some general guidance based on your query.`;
    }
  };

  const generateAIResponse = async (message: string, type: string): Promise<string> => {
    try {
      let context = 'general DevOps';
      
      switch (type) {
        case 'dockerfile':
          context = 'Docker containerization, Dockerfile creation, and container optimization';
          break;
        case 'jenkinsfile':
          context = 'Jenkins CI/CD pipelines, automation, and deployment workflows';
          break;
        case 'k8s':
          context = 'Kubernetes deployment, configuration, and cluster management';
          break;
        default:
          context = 'general DevOps practices, project management, and technical guidance';
      }

      // Add project context if user has projects
      if (currentUser) {
        context += `. The user is working on a DevOps project and may need help with their specific implementation.`;
      }

      return await callGeminiAPI(message, context);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback responses
      switch (type) {
        case 'dockerfile':
          return `Here's a sample Dockerfile for your project:

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

This Dockerfile:
- Uses Node.js 18 Alpine for a lightweight base
- Sets up the working directory
- Installs dependencies efficiently
- Copies your application code
- Exposes port 3000
- Starts your application

For your specific project, you might want to customize the base image, ports, and build steps based on your application requirements.`;

        case 'jenkinsfile':
          return `Here's a Jenkins pipeline for your project:

\`\`\`groovy
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'your-repo-url'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Docker Build') {
            steps {
                sh 'docker build -t your-app:latest .'
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'kubectl apply -f k8s/'
            }
        }
    }
}
\`\`\`

This pipeline includes:
- Code checkout from your repository
- Building your application
- Running tests
- Creating Docker image
- Deploying to Kubernetes

You can customize this based on your specific project needs and deployment targets.`;

        case 'k8s':
          return `Here's a Kubernetes deployment configuration:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: your-app
  template:
    metadata:
      labels:
        app: your-app
    spec:
      containers:
      - name: your-app
        image: your-app:latest
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: your-app-service
spec:
  selector:
    app: your-app
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
\`\`\`

This configuration:
- Creates a deployment with 3 replicas for high availability
- Sets up a service to expose your application
- Uses LoadBalancer type for external access
- Maps port 80 to your app's port 3000

Adjust the replicas, ports, and image names based on your project requirements.`;

        default:
          return `I'm here to help you with DevOps tasks! I can assist you with:

• **Dockerfile generation** - Create optimized Docker containers
• **Jenkins pipelines** - Set up CI/CD workflows  
• **Kubernetes configs** - Deploy and manage your applications
• **General DevOps questions** - Best practices and troubleshooting
• **Project-specific guidance** - Help with your specific implementation

What would you like help with today? You can ask me about:
- Setting up your development environment
- Containerizing your application
- Creating deployment pipelines
- Managing infrastructure
- Troubleshooting issues
- Best practices for your project`;
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentUser) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    try {
      // Add user message
      const userChatMessage: Omit<ChatMessage, 'id'> = {
        message: userMessage,
        response: '',
        timestamp: new Date(),
        userId: currentUser.uid,
        type: chatType,
        isUser: true
      };

      const userDocRef = await addDoc(collection(db, 'chats'), userChatMessage);
      
      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage, chatType);
      
      // Update with AI response
      const completeChatMessage: ChatMessage = {
        id: userDocRef.id,
        ...userChatMessage,
        response: aiResponse
      };

      setMessages(prev => [...prev, completeChatMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getChatTypeIcon = (type: string) => {
    switch (type) {
      case 'dockerfile':
        return <Code size={16} />;
      case 'jenkinsfile':
        return <Settings size={16} />;
      case 'k8s':
        return <FileText size={16} />;
      default:
        return <MessageCircle size={16} />;
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">DevOps Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Type Selector */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex space-x-2">
              {[
                { type: 'general', label: 'General' },
                { type: 'dockerfile', label: 'Docker' },
                { type: 'jenkinsfile', label: 'Jenkins' },
                { type: 'k8s', label: 'K8s' }
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => setChatType(type as 'dockerfile' | 'jenkinsfile' | 'k8s' | 'general')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    chatType === type
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm">
                <Bot className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium text-gray-700 mb-1">Hi! I'm your DevOps assistant.</p>
                <p className="mb-3">I can help you with:</p>
                <div className="text-left space-y-1 text-xs">
                  <p>• <strong>General Questions:</strong> DevOps concepts, best practices, troubleshooting</p>
                  <p>• <strong>Docker:</strong> Containerization, Dockerfiles, optimization</p>
                  <p>• <strong>Jenkins:</strong> CI/CD pipelines, automation, deployment</p>
                  <p>• <strong>Kubernetes:</strong> Deployment, configuration, cluster management</p>
                  <p>• <strong>Project Help:</strong> Specific guidance for your implementation</p>
                </div>
                <p className="mt-3 text-xs mb-3">Ask me anything about DevOps or your project!</p>
                
                <div className="text-left space-y-2 text-xs">
                  <p className="font-medium text-gray-600">Example questions:</p>
                  <div className="space-y-1">
                    <p className="text-blue-600 cursor-pointer hover:text-blue-800" 
                       onClick={() => setInputMessage("How do I create a Dockerfile for a Node.js app?")}>
                      • "How do I create a Dockerfile for a Node.js app?"
                    </p>
                    <p className="text-blue-600 cursor-pointer hover:text-blue-800"
                       onClick={() => setInputMessage("What's the best way to set up CI/CD for my project?")}>
                      • "What's the best way to set up CI/CD for my project?"
                    </p>
                    <p className="text-blue-600 cursor-pointer hover:text-blue-800"
                       onClick={() => setInputMessage("How can I deploy my app to Kubernetes?")}>
                      • "How can I deploy my app to Kubernetes?"
                    </p>
                    <p className="text-blue-600 cursor-pointer hover:text-blue-800"
                       onClick={() => setInputMessage("What are some DevOps best practices?")}>
                      • "What are some DevOps best practices?"
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {/* User Message */}
                <div className="flex items-start space-x-2">
                  <User className="h-6 w-6 text-gray-400 mt-1" />
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <div className="flex items-center space-x-1 mb-1">
                      {getChatTypeIcon(msg.type || 'general')}
                      <span className="text-xs text-gray-500 capitalize">{msg.type || 'general'}</span>
                    </div>
                    <p className="text-sm text-gray-900">{msg.message}</p>
                  </div>
                </div>
                
                {/* AI Response */}
                {msg.response && (
                  <div className="flex items-start space-x-2">
                    <Bot className="h-6 w-6 text-blue-600 mt-1" />
                    <div className="bg-blue-50 rounded-lg p-3 max-w-xs">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                        {msg.response}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start space-x-2">
                <Bot className="h-6 w-6 text-blue-600 mt-1" />
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about DevOps..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;