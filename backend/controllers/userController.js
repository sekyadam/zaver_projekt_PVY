const db = require("../db");

exports.getComments = async function (req, res) {
    const postId = req.params.id;

    const [rows] = await db.query(
        `SELECT c.*, u.FirstName AS authorFirstName, u.LastName AS authorLastName
         FROM Comments c
         JOIN Users u ON u.Id = c.UserId
         WHERE c.PostId = ?
         ORDER BY c.CreatedAt DESC`,
        [postId]
    );

    res.json(rows);
};

exports.addComment = async function (req, res) {
    const postId = req.params.id;
    const text = req.body.text;

    await db.query(
        "INSERT INTO Comments (UserId, PostId, Text) VALUES (?, ?, ?)",
        [req.user.id, postId, text]
    );

    res.json({ success: true });
};
