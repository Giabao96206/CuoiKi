const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/message.controllers");
router.get("/:users", controller.message);

module.exports = router;
