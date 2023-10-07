const Users = require("../models/users.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Tokens = require("../models/token.model");
const crypto = require("crypto");
const { sendMail, sendEmail } = require("../utils/sendEmail");
const mongoose = require("mongoose");

exports.register = async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.password) {
      return res.status(400).send({ message: "Password is required." });
    }

    const hashedValue = await bcrypt.hash(payload.password, 10);

    payload.hashedPassword = hashedValue;

    delete payload.password;

    const newUser = new Users(payload);

    newUser
      .save()
      .then((data) => {
        res.status(201).send({
          message: "User has been registered successfully",
          userId: data._id,
        });
      })
      .catch((error) => {
        return res.status(400).send({
          message: "Error while registering a new user.",
          error: error,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await Users.findOne({ email: email });

    if (existingUser) {
      const isValidUser = await bcrypt.compare(
        password,
        existingUser.hashedPassword
      );

      if (isValidUser) {
        //create session
        const token = await jwt.sign(
          { _id: existingUser._id },
          process.env.SECRET_KEY
        );
        // session is set for 24hrs(86400000 miliseconds)
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 86400000),
        });

        return res.status(200).send({
          message: "User logged-in successfully.",
        });
      }
      return res.status(400).send({
        message: "Invalid credentials.",
      });
    }
    res.status(400).send({
      message: "User doesnt exist with the given email.",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    await res.clearCookie("accessToken");

    return res.status(200).send({
      message: "User logged-out successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({
        message: "Email is required.",
      });
    }
    const user = await Users.findOne({ email: email });

    if (!user) {
      return res.status(400).send({
        message: "User with given email doesn't exist.",
      });
    }

    let token = await Tokens.findOne({ userId: user._id });

    if (token) {
      await token.deleteOne();
      //await Tokens.deleteOne({userId: user._id});
    }

    const newToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = await bcrypt.hash(newToken, 10);

    const tokenPayload = new Tokens({ userId: user._id, token: hashedToken });

    await tokenPayload.save();

    const link = `http://localhost:3000/reset-password/?token=${newToken}&userId=${user._id}`;

    const isMailSent = await sendEmail(user.email, "RESET PASSWORD", {
      resetPasswordLink: link,
    });

    if (isMailSent) {
      return res.status(200).send({
        message: "Password reset link has been sent to your email.",
      });
    }

    return res.status(500).send({
      message: "Error while sending email.",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;
    const resetToken = await Tokens.findOne({ userId: userId });
    if (!resetToken) {
      return res.status(401).send({
        message: "Token doesn't exist",
      });
    }

    const isValidToken = await bcrypt.compare(token, resetToken.token);

    if (!isValidToken) {
      return res.status(400).send({
        message: "Invalid Token.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    Users.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { hashedPassword: hashedPassword } }
    )
      .then((data) => {
        res.status(200).send({
          message: "Password has been reset successfully.",
          userId: data._id,
        });
      })
      .catch((error) => {
        return res.status(400).send({
          message: "Error while resetting user's password.",
          error: error,
        });
      });
  } catch (error) {
    console.log("Error while reseting: ", error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};
