const express = require("express");
const router = express.Router();

const {
  getUserById,
} = require("./user.controller");

router.get("/:id", getUserById);

module.exports = router;