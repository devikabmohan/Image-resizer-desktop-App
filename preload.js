const os = require('os');
const path = require('path');
const Toastify = require('toastify-js');
const Buffer = require('buffer');
const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('os',{
   homedir: ()=> os.homedir()
});
contextBridge.exposeInMainWorld('path',{
   join: (...args)=> path.join(...args)
});
contextBridge.exposeInMainWorld('Toastify',{
   toast: (options)=> Toastify(options).showToast(),
});
contextBridge.exposeInMainWorld('ipcRenderer',{
   send: (channel,data)=> ipcRenderer.send(channel, data),
   on: (channel, func)=> ipcRenderer.on(channel, (event, ...args)=> func (...args))
});
contextBridge.exposeInMainWorld('Buffer', Buffer);
