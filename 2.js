const express = require("express");
const router = require("./router/client/index.router");
const path = require("path");
const os = require("os");
const app = express();
const networkInterfaces = os.networkInterfaces();
const http = require("http");
const server = http.createServer(app); // tạo http server từ express app
const { Server } = require("socket.io");
const io = new Server(server); // gắn socket.io vào server này

const session = require("express-session");

app.use(
  session({
    secret: "chatSecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

function getLocalIP() {
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));
const goiy = require("./controllers/API/goiy.api");
const phantrang1 = require("./controllers/API/phantrang.api");
const local = require("./controllers/API/localip.api");
const mail = require("./controllers/API/login.api/email");
const pushuser = require("./controllers/API/login.api/server");
const checklogin = require("./controllers/API/login.api/Checklogin");
const addcomment = require("./controllers/API/comment.api");
const logout = require("./controllers/API/login.api/logout.api");
const profile = require("./controllers/API/profile.api");
const addmessage = require("./controllers/API/messeage.api/messagesingle.api");
const callmessage = require("./controllers/API/messeage.api/message.call.api");

// Gọi các API
goiy(app);
phantrang1(app);
local(app);
mail(app);
pushuser(app);
addcomment(app, io);
checklogin(app);
logout(app);
profile(app);
addmessage(app, io);
callmessage(app, io);

app.set("view engine", "pug");

app.set("views", path.join(__dirname, "views"));
// File css, js, img phải có trong thư mục ./public
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "./uploads")));

const PORT = process.env.PORT || 5000;
let ip = getLocalIP();
router(app);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://${ip}:${PORT}`);
  console.log(`Server is running at http://localhost:${PORT}`);
});
