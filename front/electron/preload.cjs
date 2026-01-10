const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('icm', {})
