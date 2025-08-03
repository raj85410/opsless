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
  }, []);

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

    // Enhanced DevOps prompt
    const enhancedPrompt = `You are Opsless, an AI-powered DevOps engineer designed to help developers build, test, deploy, and monitor apps with minimal effort. Your job is to automate and guide technical workflows like a co-pilot.

**Your Core Rules:**
1. Always act like a DevOps expert — fluent with Docker, Kubernetes, Jenkins, CI/CD, GitHub Actions, Firebase, and cloud deployments
2. If the user shares code, review it and offer immediate fixes, suggestions, and optimization tips
3. If a user gives an error, explain what it means, why it happens, and how to solve it — include exact commands or code blocks to copy-paste
4. Always assume the user is a developer who wants to **just code** — so automate everything else where possible (builds, tests, deploys)
5. Use friendly but sharp tone: Fast. Clear. No fluff. Always start with what the user needs most
6. When unsure, ask follow-up questions to guide the user better — but **never leave the user stuck**
7. Avoid saying "I can't." If something is not possible, suggest an alternative
8. End replies with either a next step, command, or confirmation

**Your Capabilities:**
- Generate Dockerfiles, docker-compose.yml, Kubernetes manifests, Jenkins pipelines, GitHub Actions, Terraform configs
- Debug deployment issues, build failures, configuration problems
- Optimize performance, security, and scalability
- Provide exact commands and code blocks ready to copy-paste
- Explain complex DevOps concepts in simple terms
- Suggest best practices and industry standards

**Response Format:**
- Use \`\`\`language blocks for code with proper syntax highlighting
- Include exact commands that can be copy-pasted
- Provide step-by-step solutions when needed
- Add explanations for why certain approaches are recommended
- Include troubleshooting tips and common pitfalls

**User Request:** ${message}

Provide a comprehensive, actionable response that helps the user solve their DevOps challenge immediately.`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
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
        const parsedResponse = parseResponseWithCodeBlocks(botResponse);
        
        setMessages(prev => [...prev, ...parsedResponse]);
      } else {
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      
      // Enhanced fallback responses
      const fallbackResponse = getFallbackResponse(message);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseResponseWithCodeBlocks = (response: string): Message[] => {
    const messages: Message[] = [];
    const parts = response.split(/(```[\s\S]*?```)/);
    
    parts.forEach((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // This is a code block
        const codeContent = part.slice(3, -3);
        const lines = codeContent.split('\n');
        const language = lines[0].trim();
        const code = lines.slice(1).join('\n');
        
        messages.push({
          id: (Date.now() + index).toString(),
          text: code,
          sender: 'bot',
          timestamp: new Date(),
          type: 'code',
          language: language
        });
      } else if (part.trim()) {
        // This is text
        messages.push({
          id: (Date.now() + index).toString(),
          text: part,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        });
      }
    });
    
    return messages;
  };

  const getFallbackResponse = (message: string): string => {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('docker')) {
      return `🐳 **Docker Configuration:**

**Multi-stage Dockerfile for React App:**
\`\`\`dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

**Quick Commands:**
\`\`\`bash
# Build image
docker build -t myapp .

# Run container
docker run -p 3000:3000 myapp

# View logs
docker logs <container_id>
\`\`\`

Need help with a specific Docker issue? Share the error or your requirements!`;
    }
    
    if (messageLower.includes('kubernetes') || messageLower.includes('k8s')) {
      return `☸️ **Kubernetes Deployment:**

**Basic Deployment YAML:**
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
\`\`\`

**Quick Commands:**
\`\`\`bash
# Apply deployment
kubectl apply -f deployment.yaml

# Check status
kubectl get pods

# View logs
kubectl logs <pod_name>
\`\`\`

What specific Kubernetes setup do you need?`;
    }
    
    if (messageLower.includes('jenkins')) {
      return `🔧 **Jenkins Pipeline:**

**Declarative Pipeline Example:**
\`\`\`groovy
pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
        
        stage('Deploy') {
            steps {
                sh 'docker build -t myapp .'
                sh 'docker push myapp:latest'
            }
        }
    }
}
\`\`\`

**Pipeline Tips:**
• Use declarative syntax for better readability
• Add post actions for cleanup
• Implement parallel stages for speed
• Use environment variables for secrets

Need help with a specific Jenkins configuration?`;
    }
    
    return `🤖 **Opsless DevOps Assistant**

I'm here to help with your DevOps challenges! Here are some things I can assist with:

**🔧 Configuration Generation:**
• Dockerfiles & docker-compose.yml
• Kubernetes manifests & Helm charts  
• Jenkins pipelines & GitHub Actions
• Terraform & Ansible playbooks

**🛠️ Problem Solving:**
• Debug deployment issues
• Optimize build processes
• Security hardening
• Performance tuning

**💡 Quick Examples:**
• "Generate a Dockerfile for my React app"
• "Create a Jenkins pipeline for Node.js"
• "Help me debug this Kubernetes error"

What specific DevOps challenge are you facing? Share details and I'll provide a complete solution!`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const quickPrompts = [
    "Generate a Dockerfile for my React app",
    "Create a Jenkins pipeline for Node.js",
    "Help me debug this Kubernetes error",
    "Set up monitoring for my application",
    "Optimize my build process",
    "Secure my deployment"
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <Bot className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">DevOps Assistant</h3>
            <p className="text-xs text-green-600 font-medium">🟢 AI Success Rate: 95% | Response Time: &lt; 2s</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-gray-600">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'code' ? (
                <div className="relative">
                  <div className="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                    <div className="text-gray-400 text-xs mb-1">{message.language}</div>
                    <pre className="whitespace-pre-wrap">{message.text}</pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(message.text, message.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  >
                    {copiedId === message.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ) : (
                <div className="text-sm whitespace-pre-wrap">{message.text}</div>
              )}
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => sendMessage(prompt)}
              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about DevOps..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DevOpsAssistant; 