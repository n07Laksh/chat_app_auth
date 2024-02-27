require("dotenv").config();
const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;

function getUser(req, res, next) {
  const token = req.header("token");

  if (!token) {
    return res.status(404).json({
      error: true,
      message: "Invalid request please login again",
    });
  }

  try {
    const data = jwt.verify(token, secretKey);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(404).json({
      error: true,
      message: "Invalid request please login again",
    });
  }
}

module.exports = getUser;
