const Boom = require("boom");
const jwt = require("jsonwebtoken");
const process = require("process");

function verifyToken(req, res, next) {
        try {
            const token = req.cookies.token;
            if (!token) {
                return next(Boom.unauthorized("Unauthorized"));
            }
            req.user = jwt.verify(token, process.env.SECRET_KEY);
            next();
        } catch (err) {
            next(err)
        }
}

module.exports = verifyToken;
