const { app,Notification, BrowserWindow, Tray, Menu, autoUpdater, dialog  } = require('electron');
const path = require('path');

// Setup autoUpdater
const { autoUpdater } = require('electron-updater');
// Configure logging for auto-updater
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";

let mainWindow;
let tray = null;

app.on('ready', () => {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    // Load the HTML file into the window
    mainWindow.loadFile('index.html');

    // Hide the window when it's minimized
    mainWindow.on('minimize', function(event) {
        event.preventDefault();
        mainWindow.hide();
    });

    // Handle window close event
    mainWindow.on('close', function(event) {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    // Create a tray icon
    tray = new Tray(path.join(__dirname, 'assets/images/icon.png'));  // Replace with your own icon
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: function() { mainWindow.show(); }},
        { label: 'Quit', click: function() { app.isQuiting = true; app.quit(); }}
    ]);
    tray.setToolTip('Salat Times and Currency Converter');
    tray.setContextMenu(contextMenu);

    // Show the window when the tray icon is clicked
    tray.on('click', function() {
        mainWindow.show();
    });



    // Auto-start the application at boot (Windows)
    if (process.platform === 'win32') {
        app.setLoginItemSettings({
            openAtLogin: true
        });
    }
});

// Auto-update logic
autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: 'A new version of the app is available. Downloading now...',
        buttons: ['OK']
    });
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. The application will now restart to install the update.',
        buttons: ['Restart']
    }).then(() => {
        autoUpdater.quitAndInstall();
    });
});

autoUpdater.on('error', (error) => {
    dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString());
});

// Quit when all windows are closed (optional)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
