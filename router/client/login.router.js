const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/login.controllers");
router.get("/", controller.login);

module.exports = router;
