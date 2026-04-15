const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const postController = require("../controllers/postController");

router.get("/posts", auth, postController.getAll);
router.post("/posts", auth, upload.single("image"), postController.create);

module.exports = router;
