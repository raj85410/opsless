// API Service for Opsless Platform
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyBUnJbyfBFyf-1TFLCxVWKfaiIoNVyEl4c';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  icon?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // Search functionality
  async searchHelp(query: string): Promise<ApiResponse<SearchResult[]>> {
    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // AI Assistant - Gemini API
  async sendToAI(message: string, context?: string): Promise<ApiResponse<string>> {
    try {
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

**Context:** ${context || 'General DevOps assistance'}

**User Request:** ${message}

Provide a comprehensive, actionable response that helps the user solve their DevOps challenge immediately.`;

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
        return {
          success: true,
          data: data.candidates[0].content.parts[0].text
        };
      } else {
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (error) {
      console.error('AI API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI service unavailable',
      };
    }
  }

  // AWS Credentials
  async saveAWSCredentials(credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    accountId?: string;
  }): Promise<ApiResponse> {
    return this.request('/aws/credentials', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getAWSCredentials(): Promise<ApiResponse> {
    return this.request('/aws/credentials');
  }

  // Projects
  async getProjects(): Promise<ApiResponse> {
    return this.request('/projects');
  }

  async createProject(project: {
    name: string;
    description: string;
    repositoryUrl: string;
    branch: string;
    framework: string;
  }): Promise<ApiResponse> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  // Deployments
  async deployProject(projectId: string, config: unknown): Promise<ApiResponse> {
    return this.request(`/projects/${projectId}/deploy`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getDeployments(projectId: string): Promise<ApiResponse> {
    return this.request(`/projects/${projectId}/deployments`);
  }

  // Monitoring
  async getMetrics(projectId: string): Promise<ApiResponse> {
    return this.request(`/projects/${projectId}/metrics`);
  }

  async getLogs(projectId: string): Promise<ApiResponse> {
    return this.request(`/projects/${projectId}/logs`);
  }

  // Support
  async submitSupportRequest(request: {
    name: string;
    email: string;
    subject: string;
    message: string;
    type: 'bug' | 'feature' | 'general';
  }): Promise<ApiResponse> {
    return this.request('/support', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Utility functions
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.healthCheck();
      return response.success;
    } catch {
      return false;
    }
  }

  // Local storage helpers
  saveToLocalStorage(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  getFromLocalStorage<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return defaultValue || null;
    }
  }

  removeFromLocalStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual functions for convenience
export const {
  healthCheck,
  searchHelp,
  sendToAI,
  saveAWSCredentials,
  getAWSCredentials,
  getProjects,
  createProject,
  deployProject,
  getDeployments,
  getMetrics,
  getLogs,
  submitSupportRequest,
  testConnection,
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
} = apiService;

export default apiService; 