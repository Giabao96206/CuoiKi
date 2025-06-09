const express = require("express");
const router = require("./router/client/index.router");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const session = require("express-session");

app.use(
  session({
    secret: "chatSecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// Gọi các API (giữ nguyên)
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

router(app);

const PORT = 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
