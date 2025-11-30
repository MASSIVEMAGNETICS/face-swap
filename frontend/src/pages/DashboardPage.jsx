/**
 * Dashboard Page
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Image,
  Video,
  Layers,
  Clock,
  TrendingUp,
  ArrowRight,
  FolderKanban,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useProjectStore from '../store/projectStore';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { projects, stats, isLoading, fetchProjects, fetchStats } = useProjectStore();

  useEffect(() => {
    fetchProjects({ limit: 5 });
    fetchStats();
  }, [fetchProjects, fetchStats]);

  const quickActions = [
    {
      icon: <Image className="w-6 h-6" />,
      title: 'New Image Swap',
      description: 'Swap faces in photos',
      link: '/studio?type=image',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'New Video Swap',
      description: 'Swap faces in videos',
      link: '/studio?type=video',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Batch Processing',
      description: 'Process multiple images',
      link: '/studio?type=batch',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Creator'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your face swap activity
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.totalProjects || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Swaps</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.totalSwaps || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Processing Time</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.averageProcessingTime 
                    ? `${(stats.averageProcessingTime / 1000).toFixed(1)}s`
                    : '0s'
                  }
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Image Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.projectsByType?.image || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Image className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="card-hover bg-white group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : projects.length === 0 ? (
            <div className="card bg-white text-center py-12">
              <FolderKanban className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first project to get started
              </p>
              <Link to="/studio" className="btn-primary inline-flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create Project
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project) => (
                <Link
                  key={project.id}
                  to={`/studio/${project.id}`}
                  className="card-hover bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        project.type === 'video' 
                          ? 'bg-purple-100 text-purple-600'
                          : project.type === 'batch'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-blue-100 text-blue-600'
                      }`}>
                        {project.type === 'video' ? (
                          <Video className="w-5 h-5" />
                        ) : project.type === 'batch' ? (
                          <Layers className="w-5 h-5" />
                        ) : (
                          <Image className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      project.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : project.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-700'
                          : project.status === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.metadata.totalSwaps} swap{project.metadata.totalSwaps !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="card bg-gradient-to-r from-primary-500 to-secondary-600 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Pro Tip 💡</h3>
              <p className="text-primary-100">
                For best results, use high-quality images with clearly visible faces
                and similar lighting conditions between source and target images.
              </p>
            </div>
            <Link
              to="/studio"
              className="btn bg-white text-primary-600 hover:bg-primary-50 mt-4 md:mt-0 md:ml-4 whitespace-nowrap"
            >
              Start Creating
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
