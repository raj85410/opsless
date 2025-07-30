# Opsless - DevOps Automation Platform

A comprehensive DevOps platform that simplifies deployment, monitoring, and scaling of modern applications with AI-powered automation.

## Features

- Lightning Fast Deployments** - Deploy applications in seconds with optimized CI/CD pipelines
- AI-Powered Assistant** - Generate Dockerfiles, Jenkins pipelines, and Kubernetes configurations
- Real-time Monitoring** - Comprehensive logging and monitoring with Prometheus/Grafana integration
- Enterprise Security** - Role-based access control and security scanning
- Global Scale** - Multi-region deployments with automatic scaling
- CI/CD Integration** - Jenkins + Docker + Kubernetes automation

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend & Infrastructure
- **Firebase Auth** for authentication
- **Firestore** for data storage
- **Firebase Hosting** for deployment
- **Jenkins** for CI/CD pipelines
- **Docker** for containerization
- **Kubernetes** for orchestration
- **Prometheus/Grafana** for monitoring

### AI Integration
- **Gemini API** for AI-powered assistance
- Smart configuration generation
- Intelligent troubleshooting

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI
- Docker (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd opsless
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Auth/           # Authentication components
│   ├── Chat/           # AI chatbot components
│   ├── Dashboard/      # Dashboard components
│   ├── Layout/         # Layout components
│   └── Logs/           # Log viewer components
├── config/             # Configuration files
├── contexts/           # React contexts
├── pages/              # Page components
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Key Components

### Authentication
- Firebase Auth integration
- Role-based access control (Admin, Developer, Viewer)
- Secure user management

### Dashboard
- Project overview and management
- Deployment status tracking
- Real-time statistics
- Quick actions and shortcuts

### AI Assistant
- Context-aware help system
- Configuration file generation
- Best practices recommendations
- Troubleshooting assistance

### Log Viewer
- Real-time log streaming
- Advanced filtering and search
- Log level categorization
- Export functionality

### Deployment Pipeline
- Automated Docker builds
- Jenkins pipeline integration
- Kubernetes deployment
- Multi-environment support

## Firebase Configuration

The application uses Firebase for:
- **Authentication**: User login/signup with email/password
- **Database**: Firestore for storing projects, deployments, logs, and chat history
- **Hosting**: Static site hosting with SPA routing
- **Security**: Firestore security rules for data protection

## Security Features

- **Firestore Security Rules**: Restrict data access based on user authentication
- **Role-based Access Control**: Different permission levels for users
- **Secure API Integration**: Protected endpoints and data validation
- **Environment Variables**: Sensitive configuration stored securely

## Monitoring & Logging

- **Real-time Logs**: Live log streaming from deployments
- **Metrics Dashboard**: Performance and usage analytics
- **Alert System**: Automated notifications for issues
- **Export Capabilities**: Log data export for analysis

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs.opsless.com](https://docs.opsless.com)
- **Community**: [community.opsless.com](https://community.opsless.com)
- **Support Email**: support@opsless.com
- **Status Page**: [status.opsless.com](https://status.opsless.com)

## Roadmap

- [ ] Multi-cloud support (AWS, GCP, Azure)
- [ ] Advanced monitoring dashboards
- [ ] GitOps integration
- [ ] Mobile application
- [ ] Enterprise SSO integration
- [ ] Advanced security scanning
- [ ] Cost optimization recommendations

---

Built with ❤️ by the Opsless team
