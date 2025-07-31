import React, { useState } from 'react';
import { 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Video,
  Code,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showBestPracticesModal, setShowBestPracticesModal] = useState(false);
  const [showGettingStartedModal, setShowGettingStartedModal] = useState(false);
  const [showLiveChatModal, setShowLiveChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'bot', timestamp: Date}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      question: "How do I deploy my first application?",
      answer: "To deploy your first application, navigate to your dashboard and click 'New Project'. Upload your repository, configure your build settings, and click 'Deploy'. Our AI assistant can help generate the necessary configuration files."
    },
    {
      question: "What types of applications can I deploy?",
      answer: "Opsless supports a wide variety of applications including Node.js, Python, Java, Go, PHP, and static sites. We support both containerized and traditional applications with automatic detection of your tech stack."
    },
    {
      question: "How does the AI assistant work?",
      answer: "Our AI assistant powered by Gemini API can help you generate Dockerfiles, Jenkins pipelines, and Kubernetes configurations. Simply describe your requirements in the chat, and it will provide optimized configurations for your specific use case."
    },
    {
      question: "Can I integrate with my existing CI/CD pipeline?",
      answer: "Yes! Opsless provides APIs and webhooks that integrate seamlessly with popular CI/CD tools like GitHub Actions, GitLab CI, and Bitbucket Pipelines. You can also use our Jenkins integration for more complex workflows."
    },
    {
      question: "How do I monitor my deployments?",
      answer: "Opsless provides comprehensive monitoring through our integrated Prometheus and Grafana setup. You can view real-time metrics, logs, and alerts directly from your dashboard. Custom dashboards and alerting rules can be configured based on your needs."
    },
    {
      question: "What security measures are in place?",
      answer: "We implement enterprise-grade security including role-based access control, encrypted data transmission, vulnerability scanning, and compliance monitoring. All deployments run in isolated environments with network policies and security contexts."
    },
    {
      question: "How much does Opsless cost?",
      answer: "Opsless offers flexible pricing plans starting with a free tier for small projects. Our paid plans scale based on usage and include additional features like advanced monitoring, priority support, and enterprise integrations."
    },
    {
      question: "Can I use custom domains?",
      answer: "Yes, you can configure custom domains for your deployments. We support SSL/TLS certificates through Let's Encrypt or you can upload your own certificates. DNS configuration is handled automatically."
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Complete walkthrough for new users",
      icon: <Book className="h-6 w-6" />,
      type: "Documentation"
    },
    {
      title: "API Reference",
      description: "Comprehensive API documentation",
      icon: <Code className="h-6 w-6" />,
      type: "Documentation"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      icon: <Video className="h-6 w-6" />,
      type: "Video"
    },
    {
      title: "Best Practices",
      description: "DevOps best practices and tips",
      icon: <FileText className="h-6 w-6" />,
      type: "Guide"
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gemini API Configuration
  const GEMINI_API_KEY = 'AIzaSyBUnJbyfBFyf-1TFLCxVWKfaiIoNVyEl4c';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  const handleContactSupport = () => {
    setShowContactModal(true);
  };

  const handleLiveChat = () => {
    setShowLiveChatModal(true);
    // Add welcome message
    if (chatMessages.length === 0) {
      setChatMessages([{
        id: '1',
        text: 'Hello! I\'m your Opsless AI assistant. How can I help you today? I can assist with deployment issues, configuration questions, or general platform guidance. Try asking me about deployment, configuration, or any Opsless platform questions!',
        sender: 'bot',
        timestamp: new Date()
      }]);
      
      // Test API connection
      console.log('🔑 Testing API key:', GEMINI_API_KEY.substring(0, 10) + '...');
      testApiConnection();
    }
  };

  const testApiConnection = async () => {
    try {
      console.log('🔍 Testing API connection...');
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello, this is a test message for Opsless platform. Please respond with "API is working correctly" if you receive this message.'
            }]
          }]
        })
      });
      
      console.log('📊 API Test Response Status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Test Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📋 API Test Response Data:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const testResponse = data.candidates[0].content.parts[0].text;
        console.log('✅ API is working! Test response:', testResponse);
        
        // Add success message to chat
        if (testResponse.includes('API is working correctly')) {
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            text: '🎉 AI Assistant is fully operational and ready to help! I can generate Docker files, Jenkins pipelines, Kubernetes manifests, and much more. What would you like me to help you with?',
            sender: 'bot',
            timestamp: new Date()
          }]);
        }
      } else {
        console.warn('⚠️ API response structure is unexpected:', data);
      }
    } catch (error) {
      console.error('❌ API Test Error:', error);
      // Add error message to chat
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        text: '⚠️ AI service is experiencing temporary issues. I\'ll use my enhanced fallback responses to help you with Docker, Jenkins, Kubernetes, and other DevOps configurations.',
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    // Enhanced prompt for DevOps configuration generation
    const enhancedPrompt = `You are an expert DevOps AI assistant for Opsless, a professional CI/CD automation platform. You have deep expertise in:

**DevOps Tools & Technologies:**
- Docker (Dockerfiles, docker-compose, multi-stage builds, optimization)
- Jenkins (pipelines, groovy scripts, plugins, automation)
- Kubernetes (manifests, helm charts, kubectl commands, cluster management)
- Terraform (infrastructure as code, modules, cloud resources)
- Ansible (playbooks, roles, inventory, automation)
- Git (workflows, hooks, branching strategies, CI/CD)
- AWS/GCP/Azure (cloud services, IAM, networking, security)
- Monitoring (Prometheus, Grafana, ELK stack, alerting)

**Configuration Generation Capabilities:**
- Generate optimized Dockerfiles for any framework/language (React, Node.js, Python, Java, Go, PHP)
- Create Jenkins pipelines (declarative and scripted) with best practices
- Write Kubernetes manifests (deployments, services, ingress, configmaps, secrets)
- Generate Terraform configurations for multi-cloud environments
- Create Ansible playbooks for server automation
- Write shell scripts and automation workflows
- Generate CI/CD configurations for GitHub Actions, GitLab CI
- Create monitoring and logging configurations
- Generate security configurations and best practices

**Response Format:**
- Provide complete, production-ready code with proper syntax
- Include detailed explanations and best practices
- Use proper syntax highlighting with \`\`\`language blocks
- Add comprehensive comments for clarity
- Suggest optimizations, security considerations, and monitoring
- Include error handling and troubleshooting tips
- Provide multiple options when applicable

**User Request:** ${message}

Please provide a comprehensive, professional response with complete code examples, explanations, and best practices. Always format code blocks properly with language specification.`;

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
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        console.error('Response Status:', response.status);
        console.error('Response Headers:', response.headers);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', data); // For debugging
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        const botResponse = data.candidates[0].content.parts[0].text;
        const botMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: 'bot' as const,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMessage]);
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Enhanced fallback responses with configuration examples
      const fallbackResponses: { [key: string]: string } = {
        'docker': `🐳 **Docker Configuration Examples:**

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
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

**Docker Compose for Full Stack:**
\`\`\`yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:5000
    depends_on:
      - backend
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
    depends_on:
      - db
  
  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=app
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\``,
        
        'jenkins': `🔧 **Jenkins Pipeline Examples:**

**Declarative Pipeline for Node.js:**
\`\`\`groovy
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '18'
        DOCKER_IMAGE = 'myapp:latest'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker.build(DOCKER_IMAGE)
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    docker.withRegistry('https://registry.example.com', 'registry-credentials') {
                        docker.image(DOCKER_IMAGE).push()
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}
\`\`\``,
        
        'kubernetes': `☸️ **Kubernetes Manifest Examples:**

**Deployment and Service:**
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
  labels:
    app: myapp
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
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
\`\`\``,
        
        'terraform': `🏗️ **Terraform Configuration Examples:**

**AWS ECS Cluster:**
\`\`\`hcl
provider "aws" {
  region = "us-west-2"
}

resource "aws_ecs_cluster" "main" {
  name = "myapp-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "myapp"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512

  container_definitions = jsonencode([
    {
      name  = "myapp"
      image = "myapp:latest"
      
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "app" {
  name            = "myapp-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = ["subnet-12345678", "subnet-87654321"]
    security_groups = [aws_security_group.app.id]
  }
}
\`\`\``,
        
        'deploy': '🚀 **Advanced Deployment Guide:**\n\n**Multi-Environment Setup:**\n• Development: Auto-deploy on push to dev branch\n• Staging: Manual approval required\n• Production: Blue-green deployment with rollback\n\n**CI/CD Pipeline:**\n1. Code commit triggers build\n2. Run tests and security scans\n3. Build Docker image\n4. Deploy to staging\n5. Run integration tests\n6. Deploy to production\n7. Health checks and monitoring\n\n**Rollback Strategy:**\n• Automatic rollback on health check failures\n• Manual rollback to previous versions\n• Database migration safety checks',
        
        'help': '🤝 **DevOps AI Assistant Capabilities:**\n\n**Configuration Generation:**\n• Docker (Dockerfiles, docker-compose)\n• Jenkins (pipelines, groovy scripts)\n• Kubernetes (manifests, helm charts)\n• Terraform (infrastructure as code)\n• Ansible (playbooks, automation)\n\n**Best Practices:**\n• Security hardening\n• Performance optimization\n• Monitoring and alerting\n• Disaster recovery\n• Compliance and governance\n\n**Ask me to generate any configuration file!**',
        
        'error': '🔧 **Advanced Troubleshooting:**\n\n**Build Failures:**\n• Check dependency versions and compatibility\n• Verify build environment and tools\n• Review build logs for specific errors\n• Test build commands locally\n\n**Deployment Issues:**\n• Verify network connectivity and security groups\n• Check resource limits and quotas\n• Review application logs and health checks\n• Validate configuration files\n\n**Performance Issues:**\n• Monitor resource usage (CPU, memory, disk)\n• Check database connection pools\n• Review caching strategies\n• Analyze application bottlenecks',
        
        'setup': '📋 **Complete DevOps Setup:**\n\n**Infrastructure Setup:**\n1. Cloud provider configuration (AWS/GCP/Azure)\n2. Network and security setup\n3. Container registry configuration\n4. Monitoring and logging infrastructure\n\n**Application Setup:**\n1. Repository structure and branching strategy\n2. CI/CD pipeline configuration\n3. Environment-specific configurations\n4. Security and compliance setup\n\n**Monitoring Setup:**\n1. Application performance monitoring\n2. Infrastructure monitoring\n3. Log aggregation and analysis\n4. Alerting and notification systems',
        
        'config': '⚙️ **Advanced Configuration Management:**\n\n**Environment Management:**\n• Development, staging, production configs\n• Environment-specific variables\n• Secret management and encryption\n• Configuration validation\n\n**Infrastructure as Code:**\n• Terraform for cloud resources\n• Ansible for server configuration\n• Helm charts for Kubernetes\n• Docker Compose for local development\n\n**Security Configuration:**\n• Network policies and firewalls\n• IAM roles and permissions\n• SSL/TLS certificate management\n• Vulnerability scanning and patching',
        
        'monitor': '📊 **Comprehensive Monitoring Strategy:**\n\n**Application Monitoring:**\n• Real-time performance metrics\n• Error tracking and alerting\n• User experience monitoring\n• Business metrics tracking\n\n**Infrastructure Monitoring:**\n• Resource utilization (CPU, memory, disk)\n• Network performance and connectivity\n• Database performance and health\n• Security event monitoring\n\n**Observability:**\n• Distributed tracing\n• Log aggregation and analysis\n• Custom dashboards and reports\n• Automated incident response',
        
        'api': '🔌 **API Integration & Automation:**\n\n**RESTful APIs:**\n• Complete API documentation\n• Authentication and authorization\n• Rate limiting and quotas\n• Error handling and logging\n\n**Webhooks & Events:**\n• Real-time event notifications\n• Integration with external services\n• Automated workflows and triggers\n• Event-driven architecture\n\n**SDKs & Libraries:**\n• Multi-language SDKs (JavaScript, Python, Go, PHP)\n• Code examples and tutorials\n• Best practices and patterns\n• Community support and contributions',
        
        'support': '📞 **24/7 Support & Resources:**\n\n**Technical Support:**\n• Live chat with AI assistant (this chat)\n• Email: opslessraj@gmail.com\n• Phone: (+91)8511734001\n• Priority support for enterprise customers\n\n**Documentation & Learning:**\n• Comprehensive guides and tutorials\n• Video tutorials and webinars\n• Best practices and case studies\n• Community forums and discussions\n\n**Professional Services:**\n• Custom implementation support\n• Migration assistance\n• Training and certification\n• Consulting and architecture review'
      };

      // Enhanced keyword detection for fallback responses
      const messageLower = message.toLowerCase();
      let fallbackResponse = 'I understand you\'re asking about Opsless. While I\'m having trouble connecting to my AI service right now, I can help with basic questions. For specific technical support, please contact our team at opslessraj@gmail.com or call (+91)8511734001.';
      
      // Enhanced keyword matching with multiple keywords per category
      const keywordMapping: { [key: string]: string[] } = {
        'docker': ['docker', 'container', 'dockerfile', 'containerization', 'image'],
        'jenkins': ['jenkins', 'pipeline', 'ci/cd', 'groovy', 'automation'],
        'kubernetes': ['kubernetes', 'k8s', 'kubectl', 'pod', 'deployment', 'service'],
        'terraform': ['terraform', 'iac', 'infrastructure', 'aws', 'gcp', 'azure'],
        'deploy': ['deploy', 'deployment', 'release', 'production', 'staging'],
        'help': ['help', 'assist', 'support', 'guide', 'tutorial'],
        'error': ['error', 'fail', 'issue', 'problem', 'troubleshoot', 'debug'],
        'setup': ['setup', 'install', 'configure', 'initialize', 'onboard'],
        'config': ['config', 'configuration', 'settings', 'env', 'environment'],
        'monitor': ['monitor', 'logging', 'metrics', 'alert', 'dashboard'],
        'api': ['api', 'rest', 'endpoint', 'sdk', 'integration'],
        'support': ['support', 'contact', 'help', 'assist', 'team']
      };
      
      // Find the best matching category
      let bestMatch = '';
      let maxMatches = 0;
      
      for (const [category, keywords] of Object.entries(keywordMapping)) {
        const matches = keywords.filter(keyword => messageLower.includes(keyword)).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestMatch = category;
        }
      }
      
      if (bestMatch && fallbackResponses[bestMatch]) {
        fallbackResponse = fallbackResponses[bestMatch];
      }

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(currentMessage);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    toast.success('Support request submitted! We\'ll get back to you soon.');
    setShowContactModal(false);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleResourceClick = (title: string) => {
    if (title === "API Reference") {
      setShowApiModal(true);
    } else if (title === "Best Practices") {
      setShowBestPracticesModal(true);
    } else if (title === "Getting Started Guide") {
      setShowGettingStartedModal(true);
    } else {
      toast.success(`${title} would open here`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions, browse our documentation, or get in touch with our support team.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredFaqs.map((faq, index) => (
                  <div key={index} className="px-6 py-4">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-medium text-gray-900 pr-4">{faq.question}</h3>
                      {expandedFaq === index ? (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="mt-4 text-gray-600">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleResourceClick(resource.title)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-600">{resource.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                            <ExternalLink className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {resource.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
              <div className="space-y-4">
                <div 
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={handleLiveChat}
                >
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm text-gray-600">opslessraj@gmail</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm text-gray-600"> (+91)8511734001</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleContactSupport}
                className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contact Support
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  System Status
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  Service Updates
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  Community Forum
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  Feature Requests
                </a>
                <a href="#" className="block text-blue-600 hover:text-blue-700 text-sm">
                  Bug Reports
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Contact Support</h3>
              <button 
                onClick={() => setShowContactModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Reference Modal */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">API Reference Documentation</h3>
              <button 
                onClick={() => setShowApiModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <div className="prose max-w-none">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">📚 Overview</h2>
                  <p className="text-gray-600 mb-4">
                    The Opsless API provides programmatic access to all platform features including project management, deployments, monitoring, and AI assistance.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-mono text-sm">
                      <strong>Base URL:</strong> https://api.opsless.com/v1<br/>
                      <strong>API Version:</strong> v1.0.0<br/>
                      <strong>Content Type:</strong> application/json
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">🔐 Authentication</h2>
                  <p className="text-gray-600 mb-4">All API requests require authentication using your API key in the header:</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Rate Limits:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li><strong>Free Tier:</strong> 1,000 requests/hour</li>
                      <li><strong>Pro Tier:</strong> 10,000 requests/hour</li>
                      <li><strong>Enterprise:</strong> 100,000 requests/hour</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 API Endpoints</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">🔧 Projects Management</h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                          <code className="text-blue-600 font-mono">/projects</code>
                        </div>
                        <p className="text-gray-600 text-sm">Get all projects with pagination and filtering</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">POST</span>
                          <code className="text-blue-600 font-mono">/projects</code>
                        </div>
                        <p className="text-gray-600 text-sm">Create a new project</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                          <code className="text-blue-600 font-mono">/projects/{'{projectId}'}</code>
                        </div>
                        <p className="text-gray-600 text-sm">Get project details by ID</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">🚀 Deployments Management</h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                          <code className="text-blue-600 font-mono">/projects/{'{projectId}'}/deployments</code>
                        </div>
                        <p className="text-gray-600 text-sm">Get project deployments</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">POST</span>
                          <code className="text-blue-600 font-mono">/projects/{'{projectId}'}/deploy</code>
                        </div>
                        <p className="text-gray-600 text-sm">Trigger new deployment</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">🤖 AI Assistant API</h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">POST</span>
                          <code className="text-blue-600 font-mono">/ai/generate</code>
                        </div>
                        <p className="text-gray-600 text-sm">Generate configuration files</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">POST</span>
                          <code className="text-blue-600 font-mono">/ai/chat</code>
                        </div>
                        <p className="text-gray-600 text-sm">Chat with AI assistant</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">📊 Monitoring & Analytics</h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                          <code className="text-blue-600 font-mono">/projects/{'{projectId}'}/metrics</code>
                        </div>
                        <p className="text-gray-600 text-sm">Get project performance metrics</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                          <code className="text-blue-600 font-mono">/projects/{'{projectId}'}/logs/stream</code>
                        </div>
                        <p className="text-gray-600 text-sm">Real-time log streaming</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 SDKs & Libraries</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">JavaScript/Node.js</h4>
                      <code className="text-blue-600 font-mono text-sm">npm install @opsless/sdk</code>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Python</h4>
                      <code className="text-blue-600 font-mono text-sm">pip install opsless-sdk</code>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Go</h4>
                      <code className="text-blue-600 font-mono text-sm">go get github.com/opsless/go-sdk</code>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">PHP</h4>
                      <code className="text-blue-600 font-mono text-sm">composer require opsless/php-sdk</code>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 Error Handling</h2>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    {`{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project name",
    "details": {
      "field": "name",
      "constraint": "min_length"
    }
  },
  "timestamp": "2024-01-15T12:00:00Z"
}`}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Common Error Codes:</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li><code className="bg-gray-100 px-1 rounded">AUTHENTICATION_ERROR</code> - Invalid or missing API key</li>
                      <li><code className="bg-gray-100 px-1 rounded">AUTHORIZATION_ERROR</code> - Insufficient permissions</li>
                      <li><code className="bg-gray-100 px-1 rounded">VALIDATION_ERROR</code> - Invalid request data</li>
                      <li><code className="bg-gray-100 px-1 rounded">RESOURCE_NOT_FOUND</code> - Requested resource doesn't exist</li>
                      <li><code className="bg-gray-100 px-1 rounded">RATE_LIMIT_EXCEEDED</code> - Too many requests</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">🔄 Webhooks</h2>
                  <p className="text-gray-600 mb-4">Configure webhooks to receive real-time notifications for events like deployments, project updates, and more.</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                    {`POST /webhooks
{
  "url": "https://your-app.com/webhook",
  "events": ["deployment.success", "deployment.failed"],
  "secret": "your_webhook_secret"
}`}
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">📞 Support</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">API Support</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>📧 api-support@opsless.com</li>
                        <li>💬 Discord Community</li>
                        <li>📊 Status Page</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Best Practices</h4>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>Cache responses when possible</li>
                        <li>Use pagination for large datasets</li>
                        <li>Handle rate limits gracefully</li>
                        <li>Store API keys securely</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <a 
                    href="https://docs.opsless.com/api" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>View Full API Documentation</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Best Practices Modal */}
      {showBestPracticesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">DevOps Best Practices & Tips</h3>
              <button 
                onClick={() => setShowBestPracticesModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <div className="prose max-w-none">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">🚀 DevOps Best Practices</h2>
                  <p className="text-gray-600 mb-6">
                    Master the art of DevOps with these proven practices and tips for successful CI/CD implementation, deployment automation, and infrastructure management.
                  </p>
                </div>

                {/* CI/CD Best Practices */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">🔄 CI/CD Pipeline Best Practices</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">✅ Do's</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Automate everything - builds, tests, deployments</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Use version control for all configuration files</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Implement automated testing at every stage</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Use feature flags for safe deployments</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Monitor and alert on pipeline failures</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Keep deployments small and frequent</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">❌ Don'ts</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span>Deploy directly to production without testing</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span>Store secrets in code repositories</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span>Skip code reviews and approvals</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span>Ignore security scanning results</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span>Deploy during peak business hours</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span>Use manual deployment processes</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Security Best Practices */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">🔒 Security Best Practices</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">🔐 Secrets Management</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Best Practices:</h4>
                          <ul className="text-gray-600 space-y-2">
                            <li>• Use environment variables for configuration</li>
                            <li>• Implement secret rotation policies</li>
                            <li>• Use encrypted storage for sensitive data</li>
                            <li>• Limit access to production secrets</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Tools:</h4>
                          <ul className="text-gray-600 space-y-2">
                            <li>• HashiCorp Vault</li>
                            <li>• AWS Secrets Manager</li>
                            <li>• Azure Key Vault</li>
                            <li>• Docker Secrets</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">🛡️ Container Security</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Container Hardening:</h4>
                          <ul className="text-gray-600 space-y-2">
                            <li>• Use minimal base images</li>
                            <li>• Run containers as non-root users</li>
                            <li>• Scan images for vulnerabilities</li>
                            <li>• Implement resource limits</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Network Security:</h4>
                          <ul className="text-gray-600 space-y-2">
                            <li>• Use network policies</li>
                            <li>• Implement service mesh</li>
                            <li>• Enable TLS everywhere</li>
                            <li>• Monitor network traffic</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monitoring & Observability */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Monitoring & Observability</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">📈 Metrics</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Application performance metrics</li>
                        <li>• Infrastructure utilization</li>
                        <li>• Business KPIs</li>
                        <li>• Error rates and latency</li>
                        <li>• Resource consumption</li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">📝 Logging</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Structured logging (JSON)</li>
                        <li>• Centralized log aggregation</li>
                        <li>• Log retention policies</li>
                        <li>• Real-time log analysis</li>
                        <li>• Correlation IDs</li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">🔍 Tracing</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Distributed tracing</li>
                        <li>• Request flow visualization</li>
                        <li>• Performance bottleneck identification</li>
                        <li>• Service dependency mapping</li>
                        <li>• Error propagation tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Infrastructure as Code */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">🏗️ Infrastructure as Code (IaC)</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">📋 Best Practices</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Code Organization:</h4>
                          <ul className="text-gray-600 space-y-2">
                            <li>• Modular and reusable components</li>
                            <li>• Version control for all infrastructure code</li>
                            <li>• Consistent naming conventions</li>
                            <li>• Documentation and comments</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Deployment Strategy:</h4>
                          <ul className="text-gray-600 space-y-2">
                            <li>• Automated testing of infrastructure</li>
                            <li>• Blue-green deployments</li>
                            <li>• Rollback capabilities</li>
                            <li>• Environment parity</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">🛠️ Popular Tools</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Cloud Providers:</h4>
                          <ul className="text-gray-600 space-y-1">
                            <li>• AWS CloudFormation</li>
                            <li>• Azure ARM Templates</li>
                            <li>• Google Cloud Deployment Manager</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Multi-Cloud:</h4>
                          <ul className="text-gray-600 space-y-1">
                            <li>• Terraform</li>
                            <li>• Pulumi</li>
                            <li>• Ansible</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Kubernetes:</h4>
                          <ul className="text-gray-600 space-y-1">
                            <li>• Helm Charts</li>
                            <li>• Kustomize</li>
                            <li>• Operator SDK</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Optimization */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">⚡ Performance Optimization</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">🚀 Application Performance</h3>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Implement caching strategies (Redis, CDN)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Optimize database queries and indexing</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Use connection pooling</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Implement async processing</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Optimize bundle sizes and lazy loading</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">🔄 Deployment Performance</h3>
                      <ul className="text-gray-600 space-y-3">
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Use multi-stage Docker builds</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Implement build caching</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Parallel test execution</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Optimize container images</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Use distributed builds</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Team Collaboration */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 Team Collaboration</h2>
                  
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">🤝 Best Practices</h3>
                        <ul className="text-gray-600 space-y-3">
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Cross-functional team collaboration</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Shared responsibility for deployments</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Regular knowledge sharing sessions</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Documentation as part of development</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>Automated code reviews</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">📚 Learning Resources</h3>
                        <ul className="text-gray-600 space-y-3">
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>DevOps culture workshops</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Tool-specific training</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Incident response drills</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Security awareness training</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Performance optimization workshops</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Quick Tips</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">🚀 Start Small</h4>
                      <p className="text-blue-800 text-sm">Begin with simple automation and gradually increase complexity</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">📊 Measure Everything</h4>
                      <p className="text-green-800 text-sm">Track metrics to understand what works and what doesn't</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">🔄 Iterate Fast</h4>
                      <p className="text-yellow-800 text-sm">Make small, frequent improvements rather than big changes</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">🛡️ Security First</h4>
                      <p className="text-purple-800 text-sm">Always consider security implications in your decisions</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2">📝 Document</h4>
                      <p className="text-red-800 text-sm">Keep documentation updated with your infrastructure changes</p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 mb-2">🎯 Focus on Value</h4>
                      <p className="text-indigo-800 text-sm">Automate processes that provide real business value</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <a 
                    href="https://docs.opsless.com/best-practices" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>View Complete Best Practices Guide</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started Guide Modal */}
      {showGettingStartedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Getting Started Guide - Complete Walkthrough</h3>
              <button 
                onClick={() => setShowGettingStartedModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <div className="prose max-w-none">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">🚀 Welcome to Opsless!</h2>
                  <p className="text-gray-600 mb-6">
                    This comprehensive guide will walk you through setting up and deploying your first application on Opsless in just 10 minutes. No DevOps experience required!
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">⏱️ Time to Complete: 10-15 minutes</h4>
                    <p className="text-blue-800 text-sm">Follow this guide step-by-step to deploy your first application successfully.</p>
                  </div>
                </div>

                {/* Prerequisites */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Prerequisites</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">✅ What You Need</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>An Opsless account (sign up at opsless.com)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>A GitHub, GitLab, or Bitbucket repository</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Basic understanding of Git</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span>Cloud provider account (AWS, GCP, Azure)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">🎯 What You'll Learn</h3>
                      <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Setting up your first project</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Configuring deployment settings</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Using the AI assistant</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>Monitoring your deployment</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Guide */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 Step-by-Step Guide</h2>
                  
                  {/* Step 1 */}
                  <div className="border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">1</span>
                      <h3 className="text-xl font-semibold text-gray-900">Create Your Account</h3>
                    </div>
                    <div className="ml-11">
                      <p className="text-gray-600 mb-4">Start by creating your Opsless account and setting up your profile.</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Actions:</h4>
                        <ol className="list-decimal list-inside text-gray-600 space-y-2">
                          <li>Visit <a href="https://opsless.com" className="text-blue-600 hover:underline">opsless.com</a> and click "Sign Up"</li>
                          <li>Enter your email and create a password</li>
                          <li>Verify your email address</li>
                          <li>Complete your profile information</li>
                          <li>Choose your plan (start with Free tier)</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">2</span>
                      <h3 className="text-xl font-semibold text-gray-900">Set Up Credentials</h3>
                    </div>
                    <div className="ml-11">
                      <p className="text-gray-600 mb-4">Configure your cloud provider and repository credentials securely.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">GitHub Setup:</h4>
                          <ol className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
                            <li>Go to GitHub Settings → Developer settings</li>
                            <li>Create a new Personal Access Token</li>
                            <li>Select repo and workflow scopes</li>
                            <li>Copy the token to Opsless</li>
                          </ol>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">AWS Setup:</h4>
                          <ol className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
                            <li>Create an IAM user with EC2 and S3 access</li>
                            <li>Generate Access Key and Secret Key</li>
                            <li>Add credentials to Opsless dashboard</li>
                            <li>Select your preferred region</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">3</span>
                      <h3 className="text-xl font-semibold text-gray-900">Create Your First Project</h3>
                    </div>
                    <div className="ml-11">
                      <p className="text-gray-600 mb-4">Set up your first project and configure the deployment settings.</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Project Configuration:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Basic Information:</h5>
                            <ul className="text-gray-600 space-y-1 text-sm">
                              <li>• Project name: Choose a descriptive name</li>
                              <li>• Repository URL: Your Git repository link</li>
                              <li>• Branch: Usually 'main' or 'master'</li>
                              <li>• Framework: Auto-detected or manual selection</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Build Settings:</h5>
                            <ul className="text-gray-600 space-y-1 text-sm">
                              <li>• Build command: npm run build (for React)</li>
                              <li>• Output directory: build or dist</li>
                              <li>• Node version: 18.x or latest LTS</li>
                              <li>• Environment variables: Add if needed</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">4</span>
                      <h3 className="text-xl font-semibold text-gray-900">Configure Deployment</h3>
                    </div>
                    <div className="ml-11">
                      <p className="text-gray-600 mb-4">Set up where and how your application will be deployed.</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Deployment Settings:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Platform Configuration:</h5>
                            <ul className="text-gray-600 space-y-1 text-sm">
                              <li>• Platform: AWS, GCP, Azure, or Vercel</li>
                              <li>• Region: Choose closest to your users</li>
                              <li>• Instance type: t3.micro for testing</li>
                              <li>• Auto-scaling: Enable for production</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Domain & SSL:</h5>
                            <ul className="text-gray-600 space-y-1 text-sm">
                              <li>• Custom domain: your-app.opsless.com</li>
                              <li>• SSL certificate: Automatic with Let's Encrypt</li>
                              <li>• CDN: Enable for global performance</li>
                              <li>• Health checks: Automatic monitoring</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">5</span>
                      <h3 className="text-xl font-semibold text-gray-900">Use AI Assistant (Optional)</h3>
                    </div>
                    <div className="ml-11">
                      <p className="text-gray-600 mb-4">Get help with configuration and troubleshooting using our AI assistant.</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">AI Assistant Features:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Configuration Help:</h5>
                            <ul className="text-gray-600 space-y-1 text-sm">
                              <li>• Generate Dockerfiles</li>
                              <li>• Create Kubernetes manifests</li>
                              <li>• Optimize build configurations</li>
                              <li>• Debug deployment issues</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Example Prompts:</h5>
                            <ul className="text-gray-600 space-y-1 text-sm">
                              <li>• "Generate a Dockerfile for my React app"</li>
                              <li>• "Help me optimize my build process"</li>
                              <li>• "Debug my deployment failure"</li>
                              <li>• "Set up monitoring for my app"</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">6</span>
                      <h3 className="text-xl font-semibold text-gray-900">Deploy Your Application</h3>
                    </div>
                    <div className="ml-11">
                      <p className="text-gray-600 mb-4">Deploy your application and monitor the process in real-time.</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Deployment Process:</h4>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono mr-3">1</span>
                            <span className="text-gray-600">Clone repository and validate code</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono mr-3">2</span>
                            <span className="text-gray-600">Install dependencies and run tests</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono mr-3">3</span>
                            <span className="text-gray-600">Build application and create container</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono mr-3">4</span>
                            <span className="text-gray-600">Deploy to cloud platform</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono mr-3">5</span>
                            <span className="text-gray-600">Configure SSL and domain</span>
                          </div>
                          <div className="flex items-center">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono mr-3">6</span>
                            <span className="text-gray-600">Set up monitoring and alerts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 7 */}
                  <div className="border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">7</span>
                      <h3 className="text-xl font-semibold text-gray-900">Monitor & Manage</h3>
                    </div>
                    <div className="ml-11">
                      <p className="text-gray-600 mb-4">Monitor your application's performance and manage deployments.</p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Monitoring Features:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Real-time Monitoring:</h5>
                            <ul className="text-gray-600 space-y-1 text-sm">
                              <li>• Application uptime and performance</li>
                              <li>• Resource usage (CPU, memory, disk)</li>
                              <li>• Response times and error rates</li>
                              <li>• Custom metrics and dashboards</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Management Tools:</h5>
                            <ul className="text-gray-600 space-y-1 text-sm">
                              <li>• Deployment history and rollbacks</li>
                              <li>• Environment variable management</li>
                              <li>• Scaling policies and auto-scaling</li>
                              <li>• Log streaming and analysis</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Common Issues & Solutions */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">🔧 Common Issues & Solutions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">🚨 Build Failures</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Issue: Dependencies not found</h4>
                          <p className="text-gray-600 text-sm">Solution: Check package.json and ensure all dependencies are listed</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Issue: Build command fails</h4>
                          <p className="text-gray-600 text-sm">Solution: Test build command locally first</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Issue: Node version mismatch</h4>
                          <p className="text-gray-600 text-sm">Solution: Specify correct Node version in project settings</p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">🌐 Deployment Issues</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Issue: Application not accessible</h4>
                          <p className="text-gray-600 text-sm">Solution: Check security groups and port configuration</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Issue: SSL certificate errors</h4>
                          <p className="text-gray-600 text-sm">Solution: Verify domain configuration and DNS settings</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Issue: Environment variables missing</h4>
                          <p className="text-gray-600 text-sm">Solution: Add required environment variables in project settings</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">🎯 Next Steps</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">🚀 Advanced Features</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Set up automatic deployments</li>
                        <li>• Configure custom domains</li>
                        <li>• Implement blue-green deployments</li>
                        <li>• Set up monitoring alerts</li>
                        <li>• Configure auto-scaling</li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">📚 Learning Resources</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Read our API documentation</li>
                        <li>• Explore best practices guide</li>
                        <li>• Watch video tutorials</li>
                        <li>• Join our community forum</li>
                        <li>• Attend webinars and workshops</li>
                      </ul>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">💬 Get Help</h3>
                      <ul className="text-gray-600 space-y-2">
                        <li>• Use the AI assistant</li>
                        <li>• Contact support team</li>
                        <li>• Check our knowledge base</li>
                        <li>• Join Discord community</li>
                        <li>• Submit feature requests</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <a 
                    href="https://docs.opsless.com/getting-started" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>View Complete Getting Started Guide</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Modal */}
      {showLiveChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Live Chat - Opsless AI Assistant</h3>
                  <p className="text-xs text-green-600 font-medium">🟢 AI Success Rate: 95% | Response Time: &lt; 2s</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={testApiConnection}
                  className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Test API
                </button>
                <button 
                  onClick={() => setShowLiveChatModal(false)} 
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
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
                    <div className="text-sm whitespace-pre-wrap">
                      {message.text.split('```').map((part, index) => {
                        if (index % 2 === 1) {
                          // This is code block
                          const lines = part.split('\n');
                          const language = lines[0].trim();
                          const code = lines.slice(1).join('\n');
                          return (
                            <div key={index} className="my-2">
                              <div className="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                                <div className="text-gray-400 text-xs mb-1">{language}</div>
                                <pre className="whitespace-pre-wrap">{code}</pre>
                              </div>
                            </div>
                          );
                        }
                        return part;
                      })}
                    </div>
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
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">Typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 p-3 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '🐳 Docker', action: 'Generate a Dockerfile for my React app' },
                  { label: '🔧 Jenkins', action: 'Create a Jenkins pipeline for Node.js' },
                  { label: '☸️ K8s', action: 'Write Kubernetes manifests for my app' },
                  { label: '🏗️ Terraform', action: 'Generate Terraform for AWS ECS' },
                  { label: '📊 Monitor', action: 'Set up monitoring with Prometheus' },
                  { label: '🔒 Security', action: 'Security best practices for containers' }
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentMessage(item.action);
                      sendMessage(item.action);
                    }}
                    className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    disabled={isLoading}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Ask about Docker, Jenkins, Kubernetes, Terraform, or any DevOps configuration..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!currentMessage.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;