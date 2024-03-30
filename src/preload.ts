// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {app, BrowserWindow, clipboard , ipcMain, ipcRenderer} from 'electron';

(window as any).ipcRenderer = ipcRenderer;
(window as any).clipboard = clipboard;
