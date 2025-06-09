const sql = require("mssql");
const config = {
  user: "sa",
  password: "Giahuybao123zx",
  server: "localhost",
  database: "DESKtop1",
  options: { encrypt: false, trustServerCertificate: true },
};

module.exports.profile = async (req, res) => {
  const email = req.params.email;
  if (!email) {
    return res.status(400).send("Email không tồn tại hoặc không hợp lệ");
  }
  if (!req.session.user) {
    return res.redirect("/login");
  }
  try {
    // if (req.session.user.email !== email) {
    //   return res.status(403).send("Bạn không có quyền truy cập vào trang này");
    // }
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query(
        "SELECT users.username, users.about_me, users.url_image, users.background_image, users.email , users.address, users.linkfb, users.phone FROM users WHERE email = @email"
      );
    if (result.recordset.length === 0) {
      return res.status(404).send("Không tìm thấy người dùng với email này");
    }
    res.render("client/pages/search/profile", {
      user: req.session.user,
      profile: result.recordset[0],
    });
  } catch (err) {
    console.error("Lỗi khi truy cập profile:", err);
    return res.status(500).send("Lỗi server");
  }
};
