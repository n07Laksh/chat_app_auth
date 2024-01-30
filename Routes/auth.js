const  express = require("express");
const  User = require("../Models/User");
const  { body, validationResult } = require("express-validator");
const  bcrypt = require("bcrypt");
const  jwt = require("jsonwebtoken");

require("dotenv").config();

const secret_key = process.env.SECRET_KEY;

if (!secret_key) {
    console.error("Secret key is not defined.");
    process.exit(1); // Exit the process with an error code
  }
  
  const router = express.Router();


  // signup endpoint for user signup using POST method route /user/auth/signup
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
        return res.status(400).json({ err: true, msg: error });
      }
  
      try {
        let user = await User.findOne({ email: req.body.email }).select(
          "-password -_id -name -__v"
        );
  
        if (user) {
          return res.status(409).json({ err: true, msg: "User already exists" });
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
  
        return res.status(200).json({
          err: false,
          token: token,
          user: userData,
          msg: "Login Succesfully",
        });
      } catch (error) {
        return res.status(401).json({ err: true, msg: error });
      }
    }
  );


  module.exports = router;