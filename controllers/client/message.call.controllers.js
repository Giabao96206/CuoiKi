module.exports.callmessage = (req, res) => {
  try {
    let email = req.params.id;
    let mine = req.session.user;

    if (mine.email === email) {
      return res.send("❌ Không thể gọi chính mình!");
    }
    if (!email) {
      return res.status(400).send("Email is required");
    }
    res.render("client/pages/message/callmess", {
      email,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
  }
};
