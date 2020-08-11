const { app, BrowserWindow } = require("electron");
const PORT = process.env.PORT || 8080;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
    },
  });
  win.removeMenu();

  require("./app"); // Express app
  win.loadURL(
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `http://localhost:${PORT}`
  );
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
