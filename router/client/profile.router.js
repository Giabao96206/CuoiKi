const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/profile.controllers");

router.get("/:email", controller.profile);

module.exports = router;
