import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  GitBranch, 
  Activity, 
  CheckCircle, 
  Clock, 
  Shield,
  ExternalLink,
  Settings
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Project, Deployment, DashboardStats } from '../../types';
import StatsCard from './StatsCard';
import ProjectCard from './ProjectCard';
import CredentialsSetup from '../Credentials/CredentialsSetup';
import ProjectCreator from '../Projects/ProjectCreator';
import PipelineLogsDemo from '../../pages/PipelineLogsDemo';
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
  const [showPipelineLogs, setShowPipelineLogs] = useState(false);
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
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
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
            title="Avg Deployment Time"
            value={`${stats.averageDeploymentTime}m`}
            icon={<Clock className="w-6 h-6" />}
            color="purple"
            trend="-15%"
            trendDirection="down"
          />
        </div>

        {/* Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
              <p className="text-gray-600 text-sm">Your latest projects and their status</p>
            </div>
            <div className="p-6">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-4">Create your first project to get started</p>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Deployments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Deployments</h2>
              <p className="text-gray-600 text-sm">Latest deployment activities</p>
            </div>
            <div className="p-6">
              {recentDeployments.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No deployments yet</h3>
                  <p className="text-gray-600">Deployments will appear here once you create projects</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDeployments.map((deployment) => (
                    <div key={deployment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          deployment.status === 'success' ? 'bg-green-500' :
                          deployment.status === 'failed' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {projects.find(p => p.id === deployment.projectId)?.name || 'Unknown Project'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {deployment.status} • {deployment.startedAt instanceof Date ? deployment.startedAt.toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-gray-600 text-sm">Common tasks and shortcuts</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowProjectModal(true)}
                className="flex items-center justify-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Create New Project</span>
              </button>
              <button
                onClick={() => setShowPipelineLogs(true)}
                className="flex items-center justify-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <Activity className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">View Pipeline Logs</span>
              </button>
              <button
                onClick={() => setShowCredentialsModal(true)}
                className="flex items-center justify-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <Shield className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">Manage Credentials</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Setup AWS Credentials</h2>
              <CredentialsSetup onComplete={handleCredentialsSaved} />
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Project</h2>
              <ProjectCreator onComplete={handleProjectCreated} />
              <button
                onClick={() => setShowProjectModal(false)}
                className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPipelineLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Pipeline Logs</h2>
              <PipelineLogsDemo />
              <button
                onClick={() => setShowPipelineLogs(false)}
                className="mt-4 px-4 py-2 text-gray-600 hover:text-gray-800"
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