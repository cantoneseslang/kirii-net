// Preload script for WebViews
const { contextBridge, ipcRenderer } = require('electron');

// セキュリティのためのAPIを公開
contextBridge.exposeInMainWorld('electronAPI', {
  // 基本的なIPC通信
  send: (channel, data) => {
    // 許可されたチャンネルのみ
    const validChannels = ['webview-ready', 'webview-error'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // 通知を受け取る
  on: (channel, func) => {
    const validChannels = ['notification'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  // 通知リスナーを削除
  removeAllListeners: (channel) => {
    const validChannels = ['notification'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});

// WebViewが読み込まれた時の処理
window.addEventListener('DOMContentLoaded', () => {
  // WebViewの準備完了を通知
  window.electronAPI.send('webview-ready', {
    url: window.location.href,
    userAgent: navigator.userAgent
  });
});

// エラーハンドリング
window.addEventListener('error', (event) => {
  window.electronAPI.send('webview-error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack
  });
});

// 未処理のPromiseエラー
window.addEventListener('unhandledrejection', (event) => {
  window.electronAPI.send('webview-error', {
    type: 'unhandledrejection',
    reason: event.reason
  });
}); 