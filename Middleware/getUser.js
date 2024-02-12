const jwt = require("jsonwebtoken");

const secret_key = process.env.SECRET_KEY;

const getUser = (req, res, next) => {
  const token = req.header("token");
  if (!token) {
    return res
      .status(400)
      .json({ err: true, msg: "Please use the valid token" });
  }

  try {
    const data = jwt.verify(token, secret_key);

    req.user = data.user;

    next();
  } catch (error) {
    return res
      .status(400)
      .json({ error: true, message: "Authenticate using correct credentials" });
  }
};

module.exports = getUser;
