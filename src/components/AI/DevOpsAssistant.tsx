import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  Copy,
  Check,
  Loader2,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'code' | 'command';
  language?: string;
}

const DevOpsAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Gemini API Configuration
  const GEMINI_API_KEY = 'AIzaSyBUnJbyfBFyf-1TFLCxVWKfaiIoNVyEl4c';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: `🚀 **Welcome to Opsless DevOps Assistant!**

I'm your AI-powered DevOps co-pilot, designed to make DevOps vanish so you can focus on coding. Here's what I can do:

**🔧 Configuration Generation:**
• Dockerfiles & docker-compose.yml
• Kubernetes manifests & Helm charts
• Jenkins pipelines & GitHub Actions
• Terraform & Ansible playbooks
• CI/CD workflows & automation

**🛠️ Problem Solving:**
• Debug deployment issues
• Optimize build processes
• Security hardening
• Performance tuning
• Infrastructure scaling

**📚 Quick Examples:**
• "Generate a Dockerfile for my React app"
• "Create a Jenkins pipeline for Node.js"
• "Help me debug this Kubernetes error"
• "Set up monitoring for my application"

**💡 Pro Tips:**
• Be specific about your tech stack
• Share error messages for better debugging
• Ask for best practices and optimizations

What can I help you with today?`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }]);
    }
  }, [messages.length]);

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Enhanced system prompt for DevOps automation
      const systemPrompt = `You are Opsless, an AI-powered DevOps engineer. You automate build, test, deploy, and monitor tasks so developers just code.

Rules:
1. You're fluent with Docker, Kubernetes, Jenkins, CI/CD, GitHub Actions, Firebase.
2. Review user code, offer fixes/suggestions instantly.
3. Explain errors clearly and give working solutions (copy-paste ready).
4. Assume devs want everything automated — you do the work.
5. Friendly but sharp tone: Fast. Clear. No fluff.
6. Ask clarifying questions when needed but never leave user stuck.
7. Never say "can't" — always suggest another way.
8. Always end with a next step, command, or confirmation.

You generate:
- Dockerfiles, GitHub Actions YAML, Jenkinsfile, K8s YAML
- Bash scripts, Firebase deploy logic
- Quick tips and 15-sec explanations

Your goal: Make DevOps vanish. The user only writes code — you do the rest.

User Request: ${message}

Provide a comprehensive, professional response with complete code examples, explanations, and best practices. Always format code blocks properly with language specification.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        const botResponse = data.candidates[0].content.parts[0].text;
        
        // Parse response for code blocks
        const parsedMessages = parseResponseWithCodeBlocks(botResponse);
        
        setMessages(prev => [...prev, ...parsedMessages]);
      } else {
        // Fallback response
        const fallbackResponse = getFallbackResponse(message);
        const parsedMessages = parseResponseWithCodeBlocks(fallbackResponse);
        setMessages(prev => [...prev, ...parsedMessages]);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Fallback response on error
      const fallbackResponse = getFallbackResponse(message);
      const parsedMessages = parseResponseWithCodeBlocks(fallbackResponse);
      setMessages(prev => [...prev, ...parsedMessages]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseResponseWithCodeBlocks = (response: string): Message[] => {
    const messages: Message[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = response.slice(lastIndex, match.index).trim();
        if (textBefore) {
          messages.push({
            id: Date.now().toString() + Math.random(),
            text: textBefore,
            sender: 'bot',
            timestamp: new Date(),
            type: 'text'
          });
        }
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2];
      messages.push({
        id: Date.now().toString() + Math.random(),
        text: code,
        sender: 'bot',
        timestamp: new Date(),
        type: 'code',
        language
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < response.length) {
      const remainingText = response.slice(lastIndex).trim();
      if (remainingText) {
        messages.push({
          id: Date.now().toString() + Math.random(),
          text: remainingText,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        });
      }
    }

    return messages;
  };

  const getFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('docker') || lowerMessage.includes('dockerfile')) {
      return `Here's a sample Dockerfile for your project:

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
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

For your specific project, you might want to customize the base image, ports, and build steps based on your application requirements.

**Next step:** Run \`docker build -t your-app .\` to build your image.`;
    }

    if (lowerMessage.includes('jenkins') || lowerMessage.includes('pipeline')) {
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

**Next step:** Save this as \`Jenkinsfile\` in your repository root.`;
    }

    if (lowerMessage.includes('kubernetes') || lowerMessage.includes('k8s')) {
      return `Here's a Kubernetes deployment configuration:

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: your-app
  labels:
    app: your-app
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
        env:
        - name: NODE_ENV
          value: "production"
---
apiVersion: v1
kind: Service
metadata:
  name: your-app-service
spec:
  selector:
    app: your-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
\`\`\`

This configuration:
- Creates a deployment with 3 replicas
- Sets up a service to expose your app
- Uses LoadBalancer type for external access

**Next step:** Apply with \`kubectl apply -f deployment.yaml\``;
    }

    return `I understand you're asking about: "${message}"

I can help you with:
- **Docker**: Dockerfiles, docker-compose, multi-stage builds
- **Kubernetes**: Deployments, services, ingress, configmaps
- **Jenkins**: Pipelines, groovy scripts, automation
- **CI/CD**: GitHub Actions, GitLab CI, automation workflows
- **Infrastructure**: Terraform, Ansible, cloud resources
- **Monitoring**: Prometheus, Grafana, logging setup

Please be more specific about what you need help with, and I'll provide you with complete, production-ready solutions.

**Next step:** Try asking something like "Generate a Dockerfile for my React app" or "Create a Jenkins pipeline for Node.js"`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Bot className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DevOps Assistant</h1>
            <p className="text-sm text-gray-600">AI-powered DevOps automation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'code' ? (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-gray-500">
                      {message.language}
                    </span>
                    <button
                      onClick={() => copyToClipboard(message.text, message.id)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{message.text}</code>
                  </pre>
                </div>
              ) : (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br>')
                  }}
                />
              )}
              <div className="text-xs text-gray-500 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Opsless is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about DevOps... (e.g., 'Generate a Dockerfile for my React app')"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
        
        <div className="mt-4 text-xs text-gray-500">
          💡 Try asking: "Generate a Dockerfile for my React app" or "Create a Jenkins pipeline for Node.js"
        </div>
      </div>
    </div>
  );
};

export default DevOpsAssistant; 