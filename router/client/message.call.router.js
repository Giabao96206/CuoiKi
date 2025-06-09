const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/message.call.controllers");
router.get("/:id", controller.callmessage);

module.exports = router;
