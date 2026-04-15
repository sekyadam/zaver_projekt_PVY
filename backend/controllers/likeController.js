const db = require("../db");

exports.likePost = async (req, res) => {
  try {
    const { userId, postId } = req.body;

    await db.query(
      "INSERT INTO likes (userid, postid) VALUES (?, ?)",
      [userId, postId]
    );

    res.json({ success: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Už jsi lajknul" });
    }

    console.log(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
};
