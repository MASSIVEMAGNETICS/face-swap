/**
 * Projects Page
 * List and manage all projects
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Image,
  Video,
  Layers,
  Trash2,
  MoreVertical,
  FolderKanban,
  Grid,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useProjectStore from '../store/projectStore';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectsPage = () => {
  const { projects, isLoading, fetchProjects, deleteProject } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [viewMode, setViewMode] = useState('grid');
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    fetchProjects({
      sortBy,
      sortOrder: 'desc',
      type: filterType !== 'all' ? filterType : undefined,
    });
  }, [fetchProjects, sortBy, filterType]);

  const handleDelete = async (projectId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const result = await deleteProject(projectId);
    if (result.success) {
      toast.success('Project deleted');
    } else {
      toast.error('Failed to delete project');
    }
    setOpenMenu(null);
  };

  const filteredProjects = projects.filter((project) => {
    if (searchQuery) {
      return project.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getProjectIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'batch':
        return <Layers className="w-5 h-5" />;
      default:
        return <Image className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'video':
        return 'bg-purple-100 text-purple-600';
      case 'batch':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage your face swap projects
            </p>
          </div>
          <Link
            to="/studio"
            className="btn-primary mt-4 sm:mt-0 inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="batch">Batch</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-auto"
          >
            <option value="createdAt">Newest</option>
            <option value="updatedAt">Recently Updated</option>
            <option value="name">Name</option>
          </select>

          {/* View Mode */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card bg-white text-center py-16">
            <FolderKanban className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first project to get started'}
            </p>
            {!searchQuery && (
              <Link to="/studio" className="btn-primary inline-flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create Project
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                to={`/studio/${project.id}`}
                className="card-hover bg-white relative group"
              >
                {/* Menu */}
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenu(openMenu === project.id ? null : project.id);
                    }}
                    className="p-1 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {openMenu === project.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border py-1">
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Thumbnail placeholder */}
                <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center mb-4">
                  <div className={`w-16 h-16 rounded-xl ${getTypeColor(project.type)} flex items-center justify-center`}>
                    {getProjectIcon(project.type)}
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.metadata.totalSwaps} swap{project.metadata.totalSwaps !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="card bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Swaps
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/studio/${project.id}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg ${getTypeColor(project.type)} flex items-center justify-center mr-3`}>
                          {getProjectIcon(project.type)}
                        </div>
                        <span className="font-medium text-gray-900">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 capitalize">
                      {project.type}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {project.metadata.totalSwaps}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
