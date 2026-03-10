const { app, BrowserWindow, Menu, Tray } = require('electron');

const path = require('path');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const ip = require('ip');

const expressApp = express();
const PORT = 3000;
let serverDataPath;
let tray = null;
let mainWindow = null;

expressApp.use(cors());
expressApp.use(express.json({ limit: '100mb' }));
expressApp.use(express.static(path.join(__dirname, '/')));

app.whenReady().then(() => {
    serverDataPath = path.join(app.getPath('userData'), 'ams-server-data.json');
    console.log('Database Path:', serverDataPath);

    expressApp.get('/api/data', (req, res) => {
        try {
            if (fs.existsSync(serverDataPath)) {
                const data = fs.readFileSync(serverDataPath, 'utf-8');
                res.json(JSON.parse(data));
            } else {
                res.json({ students: [], assessmentMetadata: {}, attendanceData: {}, batchMetadata: {}, staffMembers: [] });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Failed to read data' });
        }
    });

    expressApp.post('/api/data', (req, res) => {
        try {
            fs.writeFileSync(serverDataPath, JSON.stringify(req.body));
            res.json({ success: true });
        } catch (e) {
            console.error('Error saving data:', e);
            res.status(500).json({ error: 'Failed to save data' });
        }
    });

    expressApp.listen(PORT, '0.0.0.0', () => {
        console.log(`Express server running on your network at http://${ip.address()}:${PORT}`);
    });

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'build/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Remove menu bar entirely
    Menu.setApplicationMenu(null);

    mainWindow.loadURL(`http://localhost:${PORT}`);

    // Prevent window from closing, just hide it for background operation
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    // Setup System Tray
    tray = new Tray(path.join(__dirname, 'build/icon.png'));
    const trayMenu = Menu.buildFromTemplate([
        { label: 'Open AMS', click: () => mainWindow.show() },
        {
            label: 'Exit Completely', click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);
    tray.setToolTip('AMS Server Running');
    tray.setContextMenu(trayMenu);
    tray.on('click', () => mainWindow.show());

    // Inject the server IP so the frontend knows what to display
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
      if (document.getElementById('headerVersionDisplay')) {
         const btn = document.createElement('div');
         btn.className = 'text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full ml-4 font-bold border border-green-300 shadow-sm flex items-center gap-2';
         btn.innerHTML = '<span>🌐 Server Active: http://${ip.address()}:${PORT}</span>';
         
         // Add some copy functionality
         btn.style.cursor = 'pointer';
         btn.title = 'Click to copy LAN address';
         btn.onclick = () => {
             navigator.clipboard.writeText('http://${ip.address()}:${PORT}');
             alert('Network address copied: http://${ip.address()}:${PORT}');
         };
         
         const headerContainer = document.querySelector('header .flex.items-center.gap-6') || document.querySelector('header .flex');
         if (headerContainer) headerContainer.appendChild(btn);
      }
    `);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
