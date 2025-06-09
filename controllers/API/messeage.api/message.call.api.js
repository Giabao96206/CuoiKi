const express = require("express");
const app = express();
const port = 5000;
const sql = require("mssql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
app.use(express.json());

// Cấu hình view engine Pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Gửi file tĩnh
app.use(express.static(path.join(__dirname, "public")));

let users = [];
const callmessage = async (app, io) => {
  const rooms = {}; // roomName => [socket.id, ...]

  io.on("connection", (socket) => {
    socket.on("join-room", (room, email) => {
      socket.join(room);
      socket.room = room;
      socket.email = email;

      if (!rooms[room]) rooms[room] = [];
      if (!rooms[room].includes(socket.id)) {
        rooms[room].push(socket.id);
      }

      io.to(room).emit("user-count", rooms[room].length);

      if (rooms[room].length === 2) {
        io.to(room).emit("ready-to-call");
      }
    });

    socket.on("offer", (offer) => {
      socket.to(socket.room).emit("offer", offer);
    });

    socket.on("answer", (answer) => {
      socket.to(socket.room).emit("answer", answer);
    });

    socket.on("ice-candidate", (candidate) => {
      socket.to(socket.room).emit("ice-candidate", candidate);
    });

    socket.on("decline", () => {
      socket.to(socket.room).emit("decline");
    });

    socket.on("disconnect", () => {
      const room = socket.room;
      if (room && rooms[room]) {
        rooms[room] = rooms[room].filter((id) => id !== socket.id);

        if (rooms[room].length === 0) {
          delete rooms[room];
        } else {
          io.to(room).emit("user-count", rooms[room].length); // ✅ chỉ emit khi tồn tại
        }
      }
    });
  });
};

module.exports = callmessage;
