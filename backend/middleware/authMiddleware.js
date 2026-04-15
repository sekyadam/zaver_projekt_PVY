const jwt = require("jsonwebtoken");

function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        res.status(401).json({ error: "Missing token" });
        return;
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "tajnyklic");
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = auth;
