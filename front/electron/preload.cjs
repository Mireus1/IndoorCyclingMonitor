const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('icm', {
  canDeleteWorkouts: () => ipcRenderer.invoke('workouts:can-delete'),
  deleteWorkout: (id) => ipcRenderer.invoke('workouts:delete', id)
})
