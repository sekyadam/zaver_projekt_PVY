const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const authController = require("../controllers/authController");

router.post("/register", upload.single("photo"), authController.register);
router.post("/login", authController.login);

module.exports = router;
