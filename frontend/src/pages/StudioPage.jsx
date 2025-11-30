/**
 * Studio Page
 * Main face swap editing interface
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Save,
  Play,
  Download,
  Settings2,
  RefreshCw,
  Trash2,
  ArrowLeft,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useProjectStore from '../store/projectStore';
import ImageDropZone from '../components/ImageDropZone';
import LoadingSpinner, { ProcessingOverlay } from '../components/LoadingSpinner';
import { swapAPI } from '../services/api';

const StudioPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectType = searchParams.get('type') || 'image';

  const {
    currentProject,
    isLoading,
    isProcessing,
    uploadProgress,
    createProject,
    fetchProject,
    updateProject,
    uploadSourceImage,
    uploadTargetImage,
    removeAsset,
    executeSwap,
  } = useProjectStore();

  const [sourcePreview, setSourcePreview] = useState(null);
  const [targetPreview, setTargetPreview] = useState(null);
  const [sourceFile, setSourceFile] = useState(null);
  const [targetFile, setTargetFile] = useState(null);
  const [sourceFaces, setSourceFaces] = useState(null);
  const [targetFaces, setTargetFaces] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    quality: 'high',
    preserveExpression: true,
    blendStrength: 80,
    enhanceFace: true,
    outputFormat: 'png',
  });
  const [projectName, setProjectName] = useState('');

  // Load existing project
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId).then((project) => {
        if (project) {
          setProjectName(project.name);
          setSettings(project.settings);
          
          // Load existing assets
          const sourceAsset = project.assets.find((a) => a.type === 'source');
          const targetAsset = project.assets.find((a) => a.type === 'target');
          
          if (sourceAsset) {
            setSourcePreview(`/uploads/${sourceAsset.filename}`);
            setSourceFaces(sourceAsset.faces?.length || 0);
          }
          if (targetAsset) {
            setTargetPreview(`/uploads/${targetAsset.filename}`);
            setTargetFaces(targetAsset.faces?.length || 0);
          }
        }
      });
    }
  }, [projectId, fetchProject]);

  // Create project if needed
  const ensureProject = async () => {
    if (currentProject) return currentProject.id;

    const name = projectName || `Face Swap ${new Date().toLocaleString()}`;
    const result = await createProject({
      name,
      type: projectType,
    });

    if (result.success) {
      navigate(`/studio/${result.project.id}`, { replace: true });
      return result.project.id;
    }

    toast.error('Failed to create project');
    return null;
  };

  // Handle source file selection
  const handleSourceSelect = async (file) => {
    setSourceFile(file);
    setSourcePreview(URL.createObjectURL(file));
    
    const pId = await ensureProject();
    if (!pId) return;

    const result = await uploadSourceImage(pId, file);
    if (result.success) {
      setSourceFaces(result.asset.faces?.length || 0);
      toast.success('Source image uploaded');
    } else {
      toast.error(result.error || 'Upload failed');
      setSourcePreview(null);
      setSourceFile(null);
    }
  };

  // Handle target file selection
  const handleTargetSelect = async (file) => {
    setTargetFile(file);
    setTargetPreview(URL.createObjectURL(file));
    
    const pId = await ensureProject();
    if (!pId) return;

    const result = await uploadTargetImage(pId, file);
    if (result.success) {
      setTargetFaces(result.asset.faces?.length || 0);
      toast.success('Target image uploaded');
    } else {
      toast.error(result.error || 'Upload failed');
      setTargetPreview(null);
      setTargetFile(null);
    }
  };

  // Clear source image
  const handleSourceClear = async () => {
    if (currentProject) {
      const sourceAsset = currentProject.assets.find((a) => a.type === 'source');
      if (sourceAsset) {
        await removeAsset(currentProject.id, sourceAsset.id);
      }
    }
    setSourcePreview(null);
    setSourceFile(null);
    setSourceFaces(null);
  };

  // Clear target image
  const handleTargetClear = async () => {
    if (currentProject) {
      const targetAsset = currentProject.assets.find((a) => a.type === 'target');
      if (targetAsset) {
        await removeAsset(currentProject.id, targetAsset.id);
      }
    }
    setTargetPreview(null);
    setTargetFile(null);
    setTargetFaces(null);
  };

  // Execute face swap
  const handleSwap = async () => {
    if (!currentProject) {
      toast.error('Please create a project first');
      return;
    }

    const sourceAsset = currentProject.assets.find((a) => a.type === 'source');
    const targetAsset = currentProject.assets.find((a) => a.type === 'target');

    if (!sourceAsset || !targetAsset) {
      toast.error('Please upload both source and target images');
      return;
    }

    const result = await executeSwap(currentProject.id, settings);
    
    if (result.success) {
      toast.success('Face swap completed!');
    } else {
      toast.error(result.error || 'Face swap failed');
    }
  };

  // Save project settings
  const handleSaveSettings = async () => {
    if (!currentProject) return;

    const result = await updateProject(currentProject.id, {
      name: projectName,
      settings,
    });

    if (result.success) {
      toast.success('Settings saved');
    } else {
      toast.error('Failed to save settings');
    }
  };

  // Download result
  const handleDownload = (resultId) => {
    const downloadUrl = swapAPI.download(resultId, settings.outputFormat);
    window.open(downloadUrl, '_blank');
  };

  const canSwap = sourcePreview && targetPreview && !isProcessing;

  return (
    <div className="min-h-screen bg-gray-100">
      <ProcessingOverlay 
        isProcessing={isProcessing} 
        message="Processing face swap..."
        progress={isProcessing ? uploadProgress : null}
      />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name..."
                className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn-ghost flex items-center"
              >
                <Settings2 className="w-5 h-5 mr-2" />
                Settings
                {showSettings ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>
              <button
                onClick={handleSaveSettings}
                className="btn-outline flex items-center"
                disabled={isLoading}
              >
                <Save className="w-5 h-5 mr-2" />
                Save
              </button>
              <button
                onClick={handleSwap}
                disabled={!canSwap}
                className="btn-primary flex items-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Swap Faces
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                <Sliders className="w-5 h-5 mr-2" />
                Swap Settings
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality
                  </label>
                  <select
                    value={settings.quality}
                    onChange={(e) => setSettings({ ...settings, quality: e.target.value })}
                    className="input"
                  >
                    <option value="low">Low (Fastest)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra (Slowest)</option>
                  </select>
                </div>

                {/* Blend Strength */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blend Strength: {settings.blendStrength}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.blendStrength}
                    onChange={(e) => setSettings({ ...settings, blendStrength: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Output Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Output Format
                  </label>
                  <select
                    value={settings.outputFormat}
                    onChange={(e) => setSettings({ ...settings, outputFormat: e.target.value })}
                    className="input"
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.preserveExpression}
                      onChange={(e) => setSettings({ ...settings, preserveExpression: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Preserve Expression</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.enhanceFace}
                      onChange={(e) => setSettings({ ...settings, enhanceFace: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enhance Face</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Source Image */}
          <div className="card bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Source Face
              </h2>
              {sourcePreview && (
                <button
                  onClick={handleSourceClear}
                  className="text-red-500 hover:text-red-700"
                  disabled={isLoading}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <ImageDropZone
              onFileSelect={handleSourceSelect}
              preview={sourcePreview}
              onClear={handleSourceClear}
              label="Drop source face image"
              description="The face you want to use"
              disabled={isLoading || isProcessing}
              facesDetected={sourceFaces}
            />
          </div>

          {/* Target Image */}
          <div className="card bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Target Image
              </h2>
              {targetPreview && (
                <button
                  onClick={handleTargetClear}
                  className="text-red-500 hover:text-red-700"
                  disabled={isLoading}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <ImageDropZone
              onFileSelect={handleTargetSelect}
              preview={targetPreview}
              onClear={handleTargetClear}
              label="Drop target image"
              description="The image to swap the face into"
              disabled={isLoading || isProcessing}
              facesDetected={targetFaces}
            />
          </div>
        </div>

        {/* Results Section */}
        {currentProject?.results && currentProject.results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-yellow-500" />
              Results
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProject.results.map((result) => (
                <div key={result.id} className="card bg-white">
                  <div className="relative">
                    <img
                      src={swapAPI.getResult(result.id)}
                      alt="Face swap result"
                      className="w-full h-auto rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => handleDownload(result.id)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Processed in {(result.processingTime / 1000).toFixed(1)}s</p>
                    <p>{new Date(result.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Tips for best results:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use high-quality images with clearly visible faces</li>
            <li>• Ensure similar lighting conditions between source and target</li>
            <li>• Faces should be facing forward for best results</li>
            <li>• Adjust blend strength if the result looks unnatural</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default StudioPage;
