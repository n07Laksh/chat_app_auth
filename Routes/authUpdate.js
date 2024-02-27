const express = require("express");
const User = require("../Models/User");
const getUser = require("../Middleware/getUser");

const router = express.Router();

router.put("/updatename", getUser, async (req, res) => {
  try {
    // Validate request body
    if (!req.body || !req.body.name) {
      return res.status(400).json({
        error: true,
        message: "Name is required",
      });
    }

    const userId = req.user.id;

    const name = req.body.name;

    // Update user's name
    const user = await User.findByIdAndUpdate(
      userId,
      { name: name },
      { new: true }
    );

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    const {_id, password, __v, ...newUser} = user.toObject();

    return res.status(200).json({
      error: false,
      message: "Name updated successfully!",
      user: newUser,
    });
  } catch (error) {
    console.error("Error updating name:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

module.exports = router;
