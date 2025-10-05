
import { getConnection } from "../config/db.js";
import bcrypt from "bcryptjs";
export async function findUserByEmail(email) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("email", email)
      .query("SELECT * FROM users WHERE email = @email");

    return result.recordset[0] || null;
  } catch (err) {
    throw new Error("Database error: " + err.message);
  }
}

export async function createUser(name, email, role = "student", password_hash = null) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("name", name)
      .input("email", email)
      .input("role", role)
      .input("password_hash", password_hash)
      .query(`
        INSERT INTO users (name, email, role, password_hash)
        OUTPUT INSERTED.*
        VALUES (@name, @email, @role, @password_hash)
      `);

    return result.recordset[0];
  } catch (err) {
    throw new Error("Database error: " + err.message);
  }
}

export async function setPassword(email, plainPassword) {
  try {
    const hashed = await bcrypt.hash(plainPassword, 10);
    const pool = await getConnection();
    await pool.request()
      .input("email", email)
      .input("password_hash", hashed)
      .query("UPDATE users SET password_hash = @password_hash WHERE email = @email");

    return true;
  } catch (err) {
    throw new Error("Database error: " + err.message);
  }
}

export async function checkPassword(email, plainPassword) {
  try {
    const user = await findUserByEmail(email);
    if (!user || !user.password_hash) return false;

    return await bcrypt.compare(plainPassword, user.password_hash);
  } catch (err) {
    throw new Error("Database error: " + err.message);
  }
}
