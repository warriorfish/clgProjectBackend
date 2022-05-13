require("dotenv").config();
const jwt = require('jsonwebtoken');

function authorization(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        console.log("Invalid request no authorization header");
        res.status(403);
        res.json({ "error": "Invalid request, no authorization header found" });
        return;
    }
    const jwtToken = authHeader.split(" ")[1];
    if (!jwtToken) {
        console.log("No token found");
        res.status(403);
        res.json({ "error": "No token found in authorization header" });
        return;
    }
    jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET, (err, userInfo) => {
        if (err) {
            console.log("Invalid token found");
            console.log(err);
            res.status(403);
            res.json({ "error": "Invalid token found" });
            return;
        }
        req.id = userInfo.id;
        next();
    })
}

module.exports = {
    "auth": authorization
};