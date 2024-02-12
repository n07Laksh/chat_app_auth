const express = require("express");
const User = require("../Models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const getUser = require("../Middleware/getUser");

require("dotenv").config();

const secret_key = process.env.SECRET_KEY;

// Create the upload directory if it doesn't exist
const uploadDirectory = "./upload";
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

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
        return res.status(409).json({ error: true, message: "User already exists" });
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

      const { password, ...userData } = user.toObject();

      return res.status(200).json({
        error: false,
        token: token,
        user: userData,
        message: "Login Succesfully",
      });
    } catch (error) {
      return res.status(401).json({ error: true, message: error });
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
          .json({ error: true, message: "Please use correct UserId and Password" });
      }

      // jwt authentication
      const data = {
        user: {
          id: user._id,
        },
      };
      const token = jwt.sign(data, secret_key);

      const { password, ...userData } = user.toObject();
      return res.status(201).json({
        error: false,
        message: `Welcome Again ${userData.name}`,
        user: userData,
        token: token,
      });
    } catch (error) {
      return res.status(400).json({ error: true, message: error });
    }
  }
);

// multer middleware for handling files upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + Date.now() + ".jpg");
  },
});

const upload = multer({ storage: storage }).single("picture");

router.post("/profile", getUser, upload, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password -name -email");

    if (!user)
      return res.status(400).json({
        error: true,
        message: "Please use the correct Credehehentials",
      });

    // for deleting the old profile image
    if (user.profile_img && fs.existsSync(user.profile_img)) {
      fs.unlink(user.profile_img, (err) => {
        if (err) {
          return res
            .status(400)
            .json({ error: true, message: "Error Deleting file", });
        }
      });
    }

    // Update user's profile image path in the database
    user.profile_img = req.file.path;
    await user.save();

    return res.status(200).json({
      error: false,
      message: "Profile image uploaded successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
});

// fetch profile picture
router.get("/fetchprofileimg", getUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password -name -email");

    if (!user)
      return res.status(400).json({
        error: true,
        message: "Please use the correct Credehehentials",
      });

    if (user.profile_img && user.profile_img.includes("upload")) {
      const filepath = path.resolve(user.profile_img);
      return res.sendFile(filepath);
    }

    return res
      .status(200)
      .json({
        blobFile: false,
        img: user.profile_img,
        message: "upload the profile image",
      });
  } catch (error) {
    return res.status(400).json({ error: true, message: error.message });
  }
});

//delete profile image
router.delete("/removeimage", getUser, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select("-password -name -email");

    if (!user) {
      return res
        .status(400)
        .json({ error: true, message: "Use the correct credentials" });
    }

    if (user.profile_img) {
      // If the user has a profile image, remove it from the local directory
      fs.unlink(user.profile_img, (err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: true, message: "Internal server error" });
        } else {
          user.profile_img = null; // Set profile_img to null to remove the image
          user.save().then(() => {
            return res
              .status(200)
              .json({ error: false, message: "Profile image removed successfully" });
          });
        }
      });
    } else {
      // If the user doesn't have a profile image, return a message
      return res
        .status(200)
        .json({ error: true, message: "User doesn't have a profile image" });
    }
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal sever error" });
  }
});

module.exports = router;
