const db = require("../db");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  try {
    const { firstname, lastname, age, gender, username, password } = req.body;

    if (!firstname || !lastname || !age || !gender || !username || !password) {
      return res.status(400).json({ error: "Chybí údaje" });
    }

    const [exists] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (exists.length > 0) {
      return res.status(400).json({ error: "Uživatel už existuje" });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (firstname, lastname, age, gender, username, passwordhash) VALUES (?, ?, ?, ?, ?, ?)",
      [firstname, lastname, age, gender, username, hash]
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Špatné jméno nebo heslo" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.passwordhash);

    if (!ok) {
      return res.status(400).json({ error: "Špatné jméno nebo heslo" });
    }

    res.json({ success: true, userId: user.id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
};
