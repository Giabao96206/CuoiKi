const { app, BrowserWindow } = require("electron");
const path = require("path");
const express = require("express");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // Tùy cấu hình bảo mật
      contextIsolation: true,
    },
  });

  // Load địa chỉ server Express localhost
  mainWindow.loadURL("http://localhost:5000/products");
}

const server = express();

server.set("view engine", "pug");
server.set("views", path.join(__dirname, "views"));
server.use(express.static(path.join(__dirname, "public")));

// Khi Electron sẵn sàng, start Express server rồi tạo cửa sổ Electron
app.whenReady().then(() => {
  server.listen(3000, () => {
    console.log("Express server đang chạy trên http://localhost:5000");
    createWindow();
  });

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
