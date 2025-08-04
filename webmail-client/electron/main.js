const { app, BrowserWindow, webContents } = require('electron');
const path = require('path');

function createWindow() {
  // メインウィンドウを作成
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      webviewTag: true,
      enableRemoteModule: false,
      allowRunningInsecureContent: true
    },
    titleBarStyle: 'default',
    show: false
  });

  // ウィンドウが準備できたら表示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // HTMLファイルを直接読み込み
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // 開発環境では開発ツールを開く（必要に応じてコメントアウトを解除）
  // if (process.env.NODE_ENV === 'development') {
  //   mainWindow.webContents.openDevTools();
  // }

  // ウィンドウが閉じられた時の処理
  mainWindow.on('closed', () => {
    // macOS以外ではアプリを終了
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

// アプリが準備できたらウィンドウを作成
app.whenReady().then(createWindow);

// macOSでの処理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// セキュリティ警告を無効化（開発用）
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'; 