const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

router.get("/users", auth, userController.getAll);
router.get("/users/:id", auth, userController.getDetail);

module.exports = router;
