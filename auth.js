require("dotenv").config();
const jwt = require('jsonwebtoken');

function authorization(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        console.log("Invalid request no authorization header");
        res.sendStatus(400);
    }
    const jwtToken = authHeader.split(" ")[1];
    if (!jwtToken) {
        console.log("No token found");
        res.sendStatus(401);
    }
    jwt.verify(jwtToken, process.env.ACCESS_TOKEN_SECRET, (err, userInfo) => {
        if (err) {
            console.log("Invalid token found");
            console.log(err);
            res.sendStatus(403);
        }
        req.id = userInfo.id;
        next();
    })
}

module.exports = {
    "auth": authorization
};