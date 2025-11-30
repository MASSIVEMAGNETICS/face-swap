/**
 * Preload script for Electron
 * Exposes secure APIs to the renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File dialogs
  openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  
  // Menu events
  onMenuNewProject: (callback) => ipcRenderer.on('menu-new-project', callback),
  onMenuOpenProject: (callback) => ipcRenderer.on('menu-open-project', callback),
  onMenuSave: (callback) => ipcRenderer.on('menu-save', callback),
  onMenuExport: (callback) => ipcRenderer.on('menu-export', callback),
  
  // App info
  getVersion: () => process.versions.electron,
  getPlatform: () => process.platform,
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});

// Expose platform info
contextBridge.exposeInMainWorld('platform', {
  isElectron: true,
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',
});
