const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const likeController = require("../controllers/likeController");

router.post("/posts/:id/like", auth, likeController.like);
router.delete("/posts/:id/like", auth, likeController.unlike);
router.get("/posts/:id/likes", auth, likeController.getLikes);

module.exports = router;
