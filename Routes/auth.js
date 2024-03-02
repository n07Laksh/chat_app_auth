const express = require("express");
const User = require("../Models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

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
      sendCookie(res, "sessionToken", token);

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
        return res.status(400).json({
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

      // setting token to cookie
      sendCookie(res, "sessionToken", token);

      return res.status(201).json({
        error: false,
        message: `Welcome Again ${userData.name}`,
        user: userData,
      });
    } catch (error) {
      console.log("Error in loginUser : ", error);
      return res
        .status(400)
        .json({ error: true, message: "Internal server error " + error });
    }
  }
);

// Initialize Nodemailer transporter
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAIL_USER,
    pass: process.env.NODE_MAIL_PASS,
  },
});

// Generate random verification code
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 900000);
}

router.post("/email", async (req, res) => {
  const email = req.body.email;

  // Generate verification code
  const verificationCode = generateVerificationCode();

  const salt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(`${verificationCode}`, salt);

  // Send verification code via email
  const mailOptions = {
    from: `"Chat App" ${process.env.NODE_MAIL_USER}`,
    to: email,
    subject: "Email Verification Code for Chat App",
    html: `
      <div style="text-align: center; color: green; font-size: large;">
      <b>Welcome to the Chat App</b>
      </div>
      <br/> <hr/>
     <div style="text-align: center;">
     <h5 style="color:red"><b>Your verification code for Chat</b></h5>
     <br/><br/>
     <mark style="font-size:30px; background:yellow; color:black">${verificationCode}</mark>
     </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Mailing error:", error);
      return res
        .status(500)
        .json({
          error: true,
          message: "Failed to send verification code via email.",
        });
    } else {
      console.log("Email sent: " + info);
      return res
        .status(200)
        .json({
          error: false,
          message: "Verification code send to email",
          otp: hashedOTP,
        });
    }
  });
});

router.post("/verifyemail", async (req, res) => {
  const { code, enteredCode } = req.body;

  const compareOTP = await bcrypt.compare(enteredCode, code);

  if (compareOTP) {
    return res.status(200).json({error:false, message:"Verification successful. User authenticated."});
  } else {
    return res.status(400).json({error:true, message:"Verification failed. Incorrect code entered."});
  }
});

module.exports = router;
