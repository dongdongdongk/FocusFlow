const { app, BrowserWindow, Menu, globalShortcut, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const os = require('os');
// const imagemin = require('imagemin')
// const imageminMozjpeg = require('imagemin-mozjpeg')
// const imageminPngquant = require('imagemin-pngquant')
// const slash = require('slash')
// Set env



process.env.NODE_ENV = 'production'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let aboutWindow
let mainWindow


function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: isDev ? 800 : 500,
    height: 600,
    icon: './assets/Icon_256x256.png',
    resizable: isDev ? true : false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  ipcMain.handle('getOutputPath', async () => {
    return {
      downloads: path.join(os.homedir(), 'Downloads'),
      project: __dirname
    };
  });

  ipcMain.on('image:minimize', (e, option) => {
    option.dest = path.join(os.homedir(), 'imageshrink')
    shrinkImage(option)
  })

  async function shrinkImage({ imgPath, quality, dest }) {
    try {

      const { default: imagemin } = await import('imagemin');
      const { default: imageminMozjpeg } = await import('imagemin-mozjpeg');
      const { default: imageminPngquant } = await import('imagemin-pngquant');
      const slash = (await import('slash')).default;

      const pngQuality = quality / 100

      const files = await imagemin([slash(imgPath)], {
        destination: dest,
        plugins: [
          imageminMozjpeg({ quality }),
          imageminPngquant({
            quality: [pngQuality, pngQuality]
          })
        ]
      })
      log.info('dest: ' + dest)
      console.log(files)
      shell.openPath(dest)
      mainWindow.webContents.send('image:done')
    } catch (error) {
      log.info(error)
    }
  }

  ipcMain.handle('dialog:selectFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
      ]
    });

    if (!result.canceled) {
      return result.filePaths[0];
    }
    return null;
  });

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
  // mainWindow.loadURL('https://www.base64decode.org/')
  // mainWindow.loadURL(`file://${__dirname}/app/index.html`);
  mainWindow.loadFile('./app/index.html')
}


function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: 'About ImageShrink',
    width: 300,
    height: 300,
    icon: './assets/Icon_256x256.png',
    resizable: false,
    backgroundColor: 'white'
  })
  aboutWindow.loadFile('./app/about.html')
}


app.on('ready', () => {
  createMainWindow()

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload())
  globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+C', () => mainWindow.toggleDevTools())

  mainWindow.on('closed', () => mainWindow = null)
});

const menu = [
  ...(isMac
    ? [
      {
        label: app.name,
        submenu: [
          {
            label: 'About',
            click: createAboutWindow,
          }
        ]

      }] : []),
  {
    role: 'fileMenu',
  },
  ...(!isMac
    ? [
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: createAboutWindow
          },
        ],
      },
    ]
    : []),
  ...(isDev
    ? [
      {
        label: 'Developer',
        submenu: [
          { role: 'reload' },
          { type: 'separator' },
          { role: 'forcereload' },
          { type: 'separator' },
          { role: 'toggledevtools' },
        ],
      },
    ] : []
  )
]

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})


app.allowRendererProcessReuse = true;