const db = require("../db");

exports.addComment = async (req, res) => {
  try {
    const { userId, postId, text } = req.body;

    await db.query(
      "INSERT INTO comments (userid, postid, text) VALUES (?, ?, ?)",
      [userId, postId, text]
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const [rows] = await db.query(
      `SELECT c.*, u.username 
       FROM comments c 
       JOIN users u ON u.id = c.userid 
       WHERE c.postid = ?
       ORDER BY c.createdat ASC`,
      [postId]
    );

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
};
