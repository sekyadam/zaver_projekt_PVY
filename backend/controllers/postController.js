const db = require("../db");

exports.addPost = async (req, res) => {
  try {
    const { userId, title, text } = req.body;

    await db.query(
      "INSERT INTO posts (userid, title, text) VALUES (?, ?, ?)",
      [userId, title, text]
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.username 
       FROM posts p 
       JOIN users u ON u.id = p.userid 
       ORDER BY p.createdat DESC`
    );

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
};
