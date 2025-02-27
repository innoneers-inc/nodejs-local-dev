const { badRequest, unauthorized } = require("boom");
const jwt = require("jsonwebtoken");
const express = require("express");

const router = express.Router({ mergeParams: true });

// Mock login route to issue a JWT token
router.post("/login", (req, res, next) => {
  const { username, password } = req.body; // Example user

  if (password !== process.env.TEST_PASSWORD) {
    return next(badRequest("Invalid password"));
  }

  // Generate a JWT token
  const token = jwt.sign({ username }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });

  // Set the token as a cookie
  res.cookie("token", token, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === "production", // Enable only in HTTPS
    sameSite: "lax", // Helps prevent CSRF
    maxAge: 3600000, // 1 hour
  });

  res.json({ data: "Logged in successfully!" });
});

// Protected route example
router.get("/currentUser", (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next(unauthorized("Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.json({
      message: "Access granted",
      user: decoded,
    });
  } catch (err) {
    next(unauthorized("Invalid token"));
  }
});

module.exports = router;
