const {
    app,
    BrowserWindow,
    Menu,
    globalShortcut,
    ipcMain,
} = require("electron");
const sound = require("sound-play");
const path = require("path");
const fs = require("fs");
const AppTray = require("./js/AppTray");

process.env.NODE_ENV = "production";

const isDev = process.env.NODE_ENV !== "production" ? true : false;
const isMac = process.platform === "darwin" ? true : false;

let aboutWindow;
let mainWindow;
let checkWindow;
let tray;
let scores = [];

// 🔹 사운드 파일 매핑
const soundFiles = {
    focus_start: path.join(__dirname, "./assets/focus_start.mp3"),
    all_sessions_completed: path.join(
        __dirname,
        "./assets/all_sessions_completed.mp3"
    ),
    focus_5min: path.join(__dirname, "./assets/focus_5min.mp3"),
    focus_1min: path.join(__dirname, "./assets/focus_1min.mp3"),
    break_5min: path.join(__dirname, "./assets/break_5min.mp3"),
    break_1min: path.join(__dirname, "./assets/break_1min.mp3"),
    break_start: path.join(__dirname, "./assets/break_start.mp3"),
};

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "FocusFlow",
        width: isDev ? 900 : 650,
        height: 850,
        icon: "./assets/Icon_256x256.png",
        resizable: isDev ? true : false,
        backgroundColor: "white",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    // mainWindow.loadURL('https://www.base64decode.org/')
    // mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    mainWindow.loadFile("./app/index.html");
}

function createCheckWindow() {
    if (checkWindow) {
        checkWindow.focus();
        return;
    }

    checkWindow = new BrowserWindow({
        title: "Check Window",
        width: isDev ? 900 : 700,
        height: 750,
        resizable: true,
        backgroundColor: "white",
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    if (isDev) {
        checkWindow.webContents.openDevTools();
    }

    checkWindow.loadFile("./app/check.html");

    checkWindow.on("closed", () => {
        checkWindow = null;
    });
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        title: "About ImageShrink",
        width: 300,
        height: 300,
        icon: "./assets/Icon_256x256.png",
        resizable: false,
        backgroundColor: "white",
    });
    aboutWindow.loadFile("./app/about.html");
}

ipcMain.on("open-checkWindow", () => createCheckWindow());

ipcMain.on("focus-score-submitted", (event, score) => {
    const timestamp = new Date().toISOString(); // 현재 날짜와 시간 저장
    const scoreData = { score, timestamp };

    // 기존 점수 데이터를 불러와서 추가
    try {
        const data = fs.readFileSync(path.join(__dirname, "scores.json"), "utf-8");
        scores = JSON.parse(data);
    } catch (error) {
        console.log("No previous scores found, starting fresh.");
    }

    // 새 점수 추가 후 파일에 저장
    scores.push(scoreData);
    fs.writeFileSync(
        path.join(__dirname, "scores.json"),
        JSON.stringify(scores, null, 2)
    );
    console.log("Saved score:", scoreData);
});

// ✅ 사운드 재생 핸들러 (타입별 재생)
ipcMain.on("play-alert-sound", (event, type) => {
    const filePath = soundFiles[type]; // 타입별 파일 가져오기
    if (filePath) {
        sound.play(filePath);
    } else {
        console.error(`알 수 없는 알람 타입: ${type}`);
    }
});

app.on("ready", () => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    globalShortcut.register("CmdOrCtrl+R", () => mainWindow.reload());
    globalShortcut.register(isMac ? "Command+Alt+I" : "Ctrl+Shift+C", () =>
        mainWindow.toggleDevTools()
    );

    // mainWindow.on("closed", () => (mainWindow = null));

    mainWindow.on("close", (e) => {
        if (!app.isQuitting) {
            e.preventDefault();
            mainWindow.hide();
        }
        return true;
    });

    const icon = path.join(__dirname, "./assets/tray_icon.png");
    tray = new AppTray(icon, mainWindow);
});

const menu = [
    ...(isMac
        ? [
            {
                label: app.name,
                submenu: [
                    {
                        label: "About",
                        click: createAboutWindow,
                    },
                ],
            },
        ]
        : []),
    {
        role: "fileMenu",
    },
    ...(!isMac
        ? [
            {
                label: "Help",
                submenu: [
                    {
                        label: "About",
                        click: createAboutWindow,
                    },
                ],
            },
        ]
        : []),
    ...(isDev
        ? [
            {
                label: "Developer",
                submenu: [
                    { role: "reload" },
                    { type: "separator" },
                    { role: "forcereload" },
                    { type: "separator" },
                    { role: "toggledevtools" },
                ],
            },
        ]
        : []),
];

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

app.on("window-all-closed", () => {
    if (!isMac) {
        app.quit();
    }
});

app.allowRendererProcessReuse = true;
