const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/tokens");

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^[0-9\-]{7,15}$/;

function isStrongPassword(pw) {
  return typeof pw === "string" && pw.length >= 8 && /[0-9]/.test(pw);
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

async function signup(req, res, next) {
  try {
    const { fullName, username, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !username || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include a number",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email or username already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { fullName, username, email, phone, passwordHash },
    });

    return res.status(201).json({ success: true, message: "Account created", user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const payload = { userId: user.id, username: user.username };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    setRefreshCookie(res, refreshToken);

    return res.json({ success: true, accessToken, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "Refresh token missing" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ success: false, message: "Refresh token invalid or expired" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const accessToken = signAccessToken({ userId: decoded.userId, username: decoded.username });
    return res.json({ success: true, accessToken, user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie("refreshToken");
    return res.json({ success: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, refresh, logout };