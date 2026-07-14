const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PHONE_REGEX = /^[0-9\-]{7,15}$/;

function isStrongPassword(pw) {
  return typeof pw === "string" && pw.length >= 8 && /[0-9]/.test(pw);
}

function sanitizeUser(user) {
  const { passwordHash, tokenVersion, ...safe } = user;
  return safe;
}

// PUT /api/settings/profile
// Body: { username, email, phone }
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.userId;
    const { username, email, phone } = req.body;

    if (email && !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
    if (phone && !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    if (username || email) {
      const conflict = await prisma.user.findFirst({
        where: {
          id: { not: userId },
          OR: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])],
        },
      });
      if (conflict) {
        return res.status(409).json({ success: false, message: "Username or email already in use" });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username !== undefined && { username }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
      },
    });

    return res.json({ success: true, message: "Profile updated", user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/settings/password
// Body: { currentPassword, newPassword, confirmPassword }
async function updatePassword(req, res, next) {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters and include a number",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Bumping tokenVersion invalidates every refresh token issued before this
    // point (including the current session's) — forces re-login everywhere,
    // which is the security best practice called out in the spec.
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });

    res.clearCookie("refreshToken");

    return res.json({
      success: true,
      message: "Password updated. Please log in again.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateProfile, updatePassword };