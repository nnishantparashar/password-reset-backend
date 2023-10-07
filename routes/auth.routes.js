const express = require("express");
const router = express.Router();
const { register, login, logout,  resetPassword, forgotPassword } = require("../controllers/auth.controllers")

//Register
router.post("/register", register);

//Login
router.post("/login", login);

//Logout
router.get("/logout", logout);

//Forgot-Password
router.post("/forgot-password", forgotPassword);

//Reset Password
router.post("/reset-password", resetPassword);

module.exports = router;