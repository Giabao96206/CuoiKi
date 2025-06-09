const express = require("express");
const app = express();
const port = 5000;
const sql = require("mssql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
app.use(express.static(path.join(__dirname, "../../uploads")));
app.use(express.json()); // Middleware để parse JSON request body
app.use(cors());
// app.use(express.static(path.join(__dirname, "uploads")));
const config = {
  user: "sa",
  password: "Giahuybao123zx",
  server: "localhost",
  database: "DESKtop1",
  options: { encrypt: false, trustServerCertificate: true },
};

const addanhdaidien = async (app) => {
  app.post("/anhdaidien", async (req, res) => {
    let { url, email } = req.body;
    console.log("Received request to update avatar:", { url, email });
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("url_image", sql.NVarChar, String(url))
        .query("UPDATE users SET url_image = @url_image WHERE email = @email;");
      req.session.user.avatar = url;
      res.status(200).json({ message: "Đã update anh đại diện" });
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/editprofile", async (req, res) => {
    let { email, location, work, phone, bio } = req.body;

    console.log("Received request to update profile:", {
      email,
      location: location,
      linkfb: work,
      phone: phone,
      bio: bio,
    });

    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .input("address", sql.NVarChar, String(location))
        .input("linkfb", sql.NVarChar, String(work))
        .input("phone", sql.NVarChar, String(phone))
        .input("about_me", sql.NVarChar, String(bio))
        .query(
          "UPDATE users SET address = @address, linkfb = @linkfb, phone = @phone, about_me = @about_me WHERE email = @email"
        );
      res.status(200).json({ message: "Đã update thống tin ca nhan" });
    } catch (err) {
      console.log(err);
    }
  });

  app.get("/checkfriend", async (req, res) => {
    let { user_email, friend_email } = req.query;
    if (!user_email || !friend_email) {
      return res
        .status(400)
        .json({ message: "Missing user_email or friend_email" });
    }
    try {
      let pool = await sql.connect(config);
      let result = await pool
        .request()
        .input("user_email", sql.VarChar, user_email)
        .input("friend_email", sql.VarChar, friend_email)
        .query(`SELECT status FROM friends f
              WHERE (
                (f.user_email = @user_email AND f.friend_email = @friend_email)
              OR
                (f.user_email = @friend_email AND f.friend_email = @user_email)
                )
              AND status = 'accepted' `);
      if (result.recordset.length > 0) {
        return res.json(result.recordset[0]);
      } else {
        return res.json({ message: "User not found" });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
};

module.exports = addanhdaidien;
