const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vault', {
  exists:         ()       => ipcRenderer.invoke('vault:exists'),
  load:           (pw)     => ipcRenderer.invoke('vault:load', pw),
  save:           (args)   => ipcRenderer.invoke('vault:save', args),
  create:         (args)   => ipcRenderer.invoke('vault:create', args),
  changePassword: (args)   => ipcRenderer.invoke('vault:changePassword', args),
});

contextBridge.exposeInMainWorld('settings', {
  load:           ()       => ipcRenderer.invoke('settings:load'),
  save:           (s)      => ipcRenderer.invoke('settings:save', s),
  pickVaultPath:  ()       => ipcRenderer.invoke('dialog:pickVaultPath'),
});
