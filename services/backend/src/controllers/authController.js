import * as User from "../models/Usermodel.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
export const checkUser = async (req, res) => {
  const { email } = req.body;
  try {
    console.log("Checking email:", email); 
    const user = await User.findUserByEmail(email);
    console.log("DB result:", user);  

    if (!user) return res.json({ exists: false });

    const passwordSet = user.password_hash != null;
    return res.json({ exists: true, passwordSet });
  } catch (err) {
    console.error(" Error in checkUser:", err); 
    return res.status(500).json({ error: "Server error" });
  }
};
export const setPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  try {
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.",
      });
    }
    await User.setPassword(email, password);

    return res.json({ message: "Password set successfully" });
  } catch (err) {
    console.error("Error in setPassword:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
import crypto from "crypto";
import { getConnection } from "../config/db.js";
import { sendMail } from "../mailer.js";

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("email", email)
      .query("SELECT * FROM users WHERE email = @email");

    if (result.recordset.length === 0) {
      return res.status(200).json({ message: "If that email exists, a reset link has been sent" }); 
    }

    // Delete old tokens
    await pool.request()
      .input("email", email)
      .query("DELETE FROM password_resets WHERE email = @email");

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token
    await pool.request()
      .input("email", email)
      .input("token", token)
      .input("expires_at", expires)
      .query(`
        INSERT INTO password_resets (email, token, expires_at)
        VALUES (@email, @token, @expires_at)
      `);

    // Send email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendMail(
      email,
      "Password Reset Request",
      `<p>You requested a password reset.</p>
       <p>Click the link below (valid 1 hour):</p>
       <a href="${resetLink}">${resetLink}</a>`
    );

    return res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.error("Error in requestPasswordReset:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const pool = await getConnection();
    const result = await pool.request()
      .input("token", token)
      .query("SELECT * FROM password_resets WHERE token = @token");

    const resetRequest = result.recordset[0];
    if (!resetRequest || new Date() > resetRequest.expires_at) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Update password (hashed inside setPassword)
    await User.setPassword(resetRequest.email, newPassword);

    // Delete used token
    await pool.request()
      .input("token", token)
      .query("DELETE FROM password_resets WHERE token = @token");

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
// export const login = async (req, res) => {
//   let { email, password } = req.body;
//   try {
//     const user = await User.findUserByEmail(email);

//     if (!user) {
//       return res.status(400).json({ error: "User not found" });
//     }
//   console.log(user.email);
//     console.log("Password from request (trimmed):", JSON.stringify(password));
//     const hashed = await bcrypt.hash(password, 10);
//     console.log("Password hash from DB:", user.password_hash);
//     console.log("Password length:", password.length);
//     console.log("Hash length:", user.password_hash.length);
//  console.log(hashed);
//     const isMatch = await bcrypt.compare(password, user.password_hash);
   
//     console.log("Passwords match?", isMatch);

//     if (!isMatch) {
//       return res.status(400).json({ error: "Invalid credentials" });
//     }
//     return res.json({ message: "Login successful", user });
//   } catch (err) {
//     console.error("Error in login:", err);
//     return res.status(500).json({ error: "Server error" });
//   }

// };
import jwt from "jsonwebtoken";
export const login = async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await User.findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    const tokenPayload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return token and basic info (not password hash)
    return res.json({
      message: "Login successful",
      token,
      user: tokenPayload
    });
  } catch (err) {
    console.error("Error in login:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
// routes/auth.js or admin/student routes


export const logout=(req, res) => {
  // Frontend should remove the token
  res.json({ message: "Logged out successfully" });
};


