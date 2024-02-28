const express = require("express");
const User = require("../Models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { sendCookie } = require("../UtilityFunction/utilityFunction");

require("dotenv").config();

const secret_key = process.env.SECRET_KEY;

if (!secret_key) {
  console.error("Secret key is not defined.");
  process.exit(1); // Exit the process with an error code
}

const router = express.Router();

// signup endpoint for user signup using POST method route /chatapp/user/auth/signup
router.post(
  "/signup",
  [
    body("name", "Name will be required").isLength({ min: 1 }),
    body("email").isEmail(),
    body("password", "Password length will be 6 or greater").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    // express validation result
    const error = validationResult(req);
    // if error is accured then
    if (!error.isEmpty()) {
      return res.status(400).json({ error: true, message: error });
    }

    try {
      let user = await User.findOne({ email: req.body.email }).select(
        "-password -_id -name -__v"
      );

      if (user) {
        return res
          .status(409)
          .json({ error: true, message: "User already exists" });
      }

      //hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        ...req.body,
        password: hashPassword,
      });

      // create token and send response to client side
      const data = {
        user: {
          id: user._id,
        },
      };

      const token = jwt.sign(data, secret_key);

      const { password, _id, ...userData } = user.toObject();

      // setting token to cookie
      sendCookie(res, "sessionToken", token, 365);

      return res.status(200).json({
        error: false,
        user: userData,
        message: `Welcome to the chat app ${userData.name}`,
      });
    } catch (error) {
      return res
        .status(401)
        .json({ error: true, message: "Internal server error" });
    }
  }
);

// login endpoint for user login using POST method route /chatapp/user/auth/login
router.post(
  "/login",
  [
    // express validation requirement field
    body("email", "Please fill the email field").isEmail(),
    body("password", "Password minimum 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    // express validation result
    const error = validationResult(req);
    // if error is occurred then
    if (!error.isEmpty()) {
      return res.status(400).json({ error: true, message: error });
    }

    try {
      let user = await User.findOne({ email: req.body.email }).select(" -__v");
      // if user not exist in the database
      if (!user) {
        return res.status(400).json({
          error: true,
          message: "Please use the correct UserId and Password",
        });
      }

      const comparePass = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (!comparePass) {
        return res
          .status(400)
          .json({
            error: true,
            message: "Please use correct UserId and Password",
          });
      }

      // jwt authentication
      const data = {
        user: {
          id: user._id,
        },
      };
      const token = jwt.sign(data, secret_key);

      const { password, _id, ...userData } = user.toObject();

      re.cookie("token", token);
      // setting token to cookie
      sendCookie(res, "sessionToken", token, 365);

      return res.status(201).json({
        error: false,
        message: `Welcome Again ${userData.name}`,
        user: userData,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: true, message: "Internal server error" });
    }
  }
);

module.exports = router;
