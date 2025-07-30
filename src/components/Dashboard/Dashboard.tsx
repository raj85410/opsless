import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { Project, Deployment, DashboardStats } from '../../types';
import { 
  Plus, 
  Rocket, 
  GitBranch, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Shield,
  BarChart3,
  Activity
} from 'lucide-react';
import ProjectCard from './ProjectCard';
import StatsCard from './StatsCard';
import CredentialsSetup from '../Credentials/CredentialsSetup';
import ProjectCreator from '../Projects/ProjectCreator';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentDeployments, setRecentDeployments] = useState<Deployment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeDeployments: 0,
    successfulDeployments: 0,
    failedDeployments: 0,
    averageDeploymentTime: 0,
    uptimePercentage: 99.9
  });
  const [loading, setLoading] = useState(true);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Load projects
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      setProjects(projectsData);

      // Load recent deployments
      const deploymentsQuery = query(
        collection(db, 'deployments'),
        where('userId', '==', currentUser.uid),
        orderBy('startedAt', 'desc'),
        limit(5)
      );
      const deploymentsSnapshot = await getDocs(deploymentsQuery);
      const deploymentsData = deploymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deployment[];
      setRecentDeployments(deploymentsData);

      // Calculate stats
      const activeDeployments = deploymentsData.filter(d => 
        ['pending', 'building', 'testing', 'deploying'].includes(d.status)
      ).length;
      
      const successfulDeployments = deploymentsData.filter(d => d.status === 'success').length;
      const failedDeployments = deploymentsData.filter(d => d.status === 'failed').length;
      
      const avgDeploymentTime = deploymentsData.length > 0 
        ? deploymentsData.reduce((acc, d) => acc + (d.duration || 0), 0) / deploymentsData.length
        : 0;

      setStats({
        totalProjects: projectsData.length,
        activeDeployments,
        successfulDeployments,
        failedDeployments,
        averageDeploymentTime: Math.round(avgDeploymentTime / 1000 / 60), // Convert to minutes
        uptimePercentage: 99.9
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const checkCredentials = useCallback(async () => {
    if (!currentUser) return;

    try {
      const credentialsRef = doc(db, 'users', currentUser.uid, 'secrets', 'credentials');
      const credentialsSnap = await getDoc(credentialsRef);
      setHasCredentials(credentialsSnap.exists());
    } catch (error) {
      console.error('Error checking credentials:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
      checkCredentials();
    }
  }, [currentUser, loadDashboardData, checkCredentials]);

  const handleProjectCreated = () => {
    setShowProjectModal(false);
    loadDashboardData(); // Refresh data
    toast.success('Project created successfully!');
  };

  const handleCredentialsSaved = () => {
    setShowCredentialsModal(false);
    setHasCredentials(true);
    toast.success('Credentials configured successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Opsless Dashboard</h1>
              <p className="text-gray-600">Manage your deployments and monitor your applications</p>
            </div>
            <div className="flex gap-3">
              {!hasCredentials && (
                <button
                  onClick={() => setShowCredentialsModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Setup Credentials
                </button>
              )}
              <button
                onClick={() => setShowProjectModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={<GitBranch className="w-6 h-6" />}
            color="blue"
            trend="+12%"
            trendDirection="up"
          />
          <StatsCard
            title="Active Deployments"
            value={stats.activeDeployments}
            icon={<Activity className="w-6 h-6" />}
            color="green"
            trend="+5%"
            trendDirection="up"
          />
          <StatsCard
            title="Success Rate"
            value={`${stats.totalProjects > 0 ? Math.round((stats.successfulDeployments / (stats.successfulDeployments + stats.failedDeployments)) * 100) : 0}%`}
            icon={<CheckCircle className="w-6 h-6" />}
            color="emerald"
            trend="+2.1%"
            trendDirection="up"
          />
          <StatsCard
            title="Avg Deploy Time"
            value={`${stats.averageDeploymentTime}m`}
            icon={<Clock className="w-6 h-6" />}
            color="purple"
            trend="-15%"
            trendDirection="down"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowProjectModal(true)}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Rocket className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Deploy New Project</h3>
                <p className="text-sm text-gray-600">Set up automated deployment</p>
              </div>
            </button>
            
            <button
              onClick={() => setShowCredentialsModal(true)}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Manage Credentials</h3>
                <p className="text-sm text-gray-600">Update CI/CD credentials</p>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/monitoring'}
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-600">Monitor performance</p>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Project
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first project</p>
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Create First Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Deployments */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Deployments</h2>
              </div>
              
              <div className="p-6">
                {recentDeployments.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No deployments yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentDeployments.map(deployment => (
                      <div key={deployment.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          deployment.status === 'success' ? 'bg-green-500' :
                          deployment.status === 'failed' ? 'bg-red-500' :
                          deployment.status === 'pending' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {deployment.version}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(deployment.startedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {deployment.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {deployment.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                          {deployment.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                          {['building', 'testing', 'deploying'].includes(deployment.status) && (
                            <AlertCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">CI/CD Pipeline</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Build System</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Deployment Engine</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Monitoring</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <CredentialsSetup onComplete={handleCredentialsSaved} isModal={true} />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <ProjectCreator onComplete={handleProjectCreated} isModal={true} />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;