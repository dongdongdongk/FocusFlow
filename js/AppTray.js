const { app, Menu, Tray } = require('electron')

class AppTray extends Tray {
    constructor(icon, mainWindow) {
        super(icon)

        this.setToolTip('포모도로 타이머')

        this.mainWindow = mainWindow

        // 🔥 bind(this) 제거
        this.on('click', this.onClick);
        this.on('right-click', this.onRightClick);
    }

    onClick = () => { // 🔥 화살표 함수 사용 (자동으로 this 유지)
        if (this.mainWindow.isVisible()) {
            this.mainWindow.hide();
        } else {
            this.mainWindow.show();
        }
    };

    onRightClick = () => { // 🔥 화살표 함수 사용
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Quit',
                click: () => {
                    app.isQuitting = true;
                    app.quit();
                }
            }
        ]);
        this.popUpContextMenu(contextMenu);
    };
}

module.exports = AppTray