/**
 * Project Store
 * Manages project state using Zustand
 */

import { create } from 'zustand';
import { projectsAPI, uploadAPI, swapAPI } from '../services/api';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  stats: null,
  isLoading: false,
  isProcessing: false,
  uploadProgress: 0,
  error: null,

  /**
   * Fetch all projects
   */
  fetchProjects: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsAPI.getAll(params);
      set({ projects: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * Create new project
   */
  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsAPI.create(projectData);
      const newProject = response.data.project;
      set((state) => ({
        projects: [newProject, ...state.projects],
        currentProject: newProject,
        isLoading: false,
      }));
      return { success: true, project: newProject };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Get project by ID
   */
  fetchProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsAPI.getById(projectId);
      set({ currentProject: response.data.project, isLoading: false });
      return response.data.project;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  /**
   * Update project
   */
  updateProject: async (projectId, updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectsAPI.update(projectId, updateData);
      const updatedProject = response.data.project;
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? updatedProject : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete project
   */
  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await projectsAPI.delete(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId ? null : state.currentProject,
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Upload source image
   */
  uploadSourceImage: async (projectId, file) => {
    set({ isLoading: true, uploadProgress: 0, error: null });
    try {
      const response = await uploadAPI.uploadSource(projectId, file, (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        set({ uploadProgress: progress });
      });
      
      // Refresh project to get updated assets
      await get().fetchProject(projectId);
      set({ isLoading: false, uploadProgress: 100 });
      return { success: true, asset: response.data.asset };
    } catch (error) {
      set({ error: error.message, isLoading: false, uploadProgress: 0 });
      return { success: false, error: error.message };
    }
  },

  /**
   * Upload target image
   */
  uploadTargetImage: async (projectId, file) => {
    set({ isLoading: true, uploadProgress: 0, error: null });
    try {
      const response = await uploadAPI.uploadTarget(projectId, file, (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        set({ uploadProgress: progress });
      });
      
      // Refresh project to get updated assets
      await get().fetchProject(projectId);
      set({ isLoading: false, uploadProgress: 100 });
      return { success: true, asset: response.data.asset };
    } catch (error) {
      set({ error: error.message, isLoading: false, uploadProgress: 0 });
      return { success: false, error: error.message };
    }
  },

  /**
   * Remove asset from project
   */
  removeAsset: async (projectId, assetId) => {
    set({ isLoading: true, error: null });
    try {
      await uploadAPI.removeAsset(projectId, assetId);
      await get().fetchProject(projectId);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Execute face swap
   */
  executeSwap: async (projectId, options = {}) => {
    set({ isProcessing: true, error: null });
    try {
      const response = await swapAPI.execute(projectId, options);
      
      // Update current project with new result
      set((state) => ({
        currentProject: response.data.project,
        isProcessing: false,
      }));
      
      return { success: true, result: response.data.result };
    } catch (error) {
      set({ error: error.message, isProcessing: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete result
   */
  deleteResult: async (projectId, resultId) => {
    set({ isLoading: true, error: null });
    try {
      await projectsAPI.deleteResult(projectId, resultId);
      await get().fetchProject(projectId);
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  /**
   * Fetch user stats
   */
  fetchStats: async () => {
    try {
      const response = await projectsAPI.getStats();
      set({ stats: response.data.stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  /**
   * Set current project
   */
  setCurrentProject: (project) => set({ currentProject: project }),

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),

  /**
   * Reset upload progress
   */
  resetUploadProgress: () => set({ uploadProgress: 0 }),
}));

export default useProjectStore;
