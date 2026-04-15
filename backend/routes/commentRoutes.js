const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const commentController = require("../controllers/commentController");

router.get("/posts/:id/comments", auth, commentController.getComments);
router.post("/posts/:id/comments", auth, commentController.addComment);

module.exports = router;
