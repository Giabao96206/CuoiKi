const sql = require("mssql");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
app.use(express.json()); // Middleware để parse JSON request body
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

const logout = (app) => {
  app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Lỗi khi đăng xuất" });
      }
      res.clearCookie("connect.sid"); // Xóa cookie phiên làm việc
      res.status(200).json({ message: "Đăng xuất thành công" });
    });
  });
};

module.exports = logout;
