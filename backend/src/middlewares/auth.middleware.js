const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized: Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({
                message: 'Unauthorized: Invalid or expired access token'
            });
        }

        req.user = user;
        next();
    });
};

module.exports = { verifyJWT };