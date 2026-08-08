const jwt = require("jsonwebtoken");
const Client = require("./model/model");

const middleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Token not provided"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await Client.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists. Please login again."
            });
        }

        req.user = decoded;

        next();

    } catch (error) {
        console.error("AUTH ERROR:", error);

        return res.status(401).json({
            message: "Unauthorized! Invalid or Expired Token"
        });
    }
};

module.exports = middleware;