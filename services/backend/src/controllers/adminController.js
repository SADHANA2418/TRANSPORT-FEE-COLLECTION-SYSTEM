import { getConnection } from "../config/db.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const pool = await getConnection();

    const [studentsResult, totalPaymentResult, pendingResult, overdueResult] = await Promise.all([
   
      pool.request().query(`
        SELECT COUNT(*) AS total_students 
        FROM users 
        WHERE role = 'student'
      `),

   
      pool.request().query(`
        SELECT ISNULL(SUM(amount), 0) AS total_payment 
        FROM payments
      `),

    
      pool.request().query(`
        SELECT COUNT(*) AS pending_payments 
        FROM payments 
        WHERE status = 'unpaid'
      `),

      
      pool.request().query(`
        SELECT COUNT(*) AS overdue_payments 
        FROM payments 
        WHERE status = 'unpaid' 
        AND due_date < CAST(GETDATE() AS DATE)
      `)
    ]);

    return res.json({
      totalStudents: studentsResult.recordset[0].total_students,
      totalPayment: totalPaymentResult.recordset[0].total_payment,
      pendingPayments: pendingResult.recordset[0].pending_payments,
      overduePayments: overdueResult.recordset[0].overdue_payments
    });
  } catch (err) {
    console.error("Error in getAdminDashboard:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


export const listUsers = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT user_id, name, email, role, created_at
      FROM users
      WHERE role IN ('student', 'staff')
      ORDER BY created_at DESC
    `);

    return res.json(result.recordset);
  } catch (err) {
    console.error("Error in listUsers:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

import bcrypt from "bcryptjs";

export const addUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!["student", "staff"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const pool = await getConnection();

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input("name", name)
      .input("email", email)
      .input("password_hash", hashedPassword)
      .input("role", role)
      .query(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (@name, @email, @password_hash, @role)
      `);

    return res.json({ message: "User added successfully" });
  } catch (err) {
    console.error("Error in addUser:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const editUser = async (req, res) => {
  const { user_id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    const pool = await getConnection();

    let query = `UPDATE users SET `;
    let inputs = [];

    if (name) {
      query += `name = @name, `;
      inputs.push({ key: "name", value: name });
    }

    if (email) {
      query += `email = @email, `;
      inputs.push({ key: "email", value: email });
    }

    if (role && ["student", "staff"].includes(role)) {
      query += `role = @role, `;
      inputs.push({ key: "role", value: role });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `password_hash = @password_hash, `;
      inputs.push({ key: "password_hash", value: hashedPassword });
    }

    // Remove trailing comma
    query = query.slice(0, -2);
    query += ` WHERE user_id = @user_id`;

    const request = pool.request().input("user_id", user_id);
    inputs.forEach(i => request.input(i.key, i.value));

    await request.query(query);

    return res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error in editUser:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// DELETE USER (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("userId", req.params.id)
      .query(`DELETE FROM users WHERE user_id = @userId`);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};
// ========== ROUTES MANAGEMENT ==========

export const getAllRoutes = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`SELECT * FROM routes`);
    res.json({ routes: result.recordset });
  } catch (err) {
    console.error("Error in getAllRoutes:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getRouteById = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("routeId", req.params.route_id)
      .query(`SELECT * FROM routes WHERE route_id = @routeId`);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json({ route: result.recordset[0] });
  } catch (err) {
    console.error("Error in getRouteById:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const addRoute = async (req, res) => {
  const { route_name, start_location, end_location, price } = req.body;

  try {
    const pool = await getConnection();
    await pool
      .request()
      .input("route_name", route_name)
      .input("start_location", start_location)
      .input("end_location", end_location)
      .input("price", price)
      .query(`
        INSERT INTO routes (route_name, start_location, end_location, price)
        VALUES (@route_name, @start_location, @end_location, @price)
      `);

    res.status(201).json({ message: "Route added successfully" });
  } catch (err) {
    console.error("Error in addRoute:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateRoute = async (req, res) => {
  const { route_name, start_location, end_location, price } = req.body;

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("routeId", req.params.route_id)
      .input("route_name", route_name)
      .input("start_location", start_location)
      .input("end_location", end_location)
      .input("price", price)
      .query(`
        UPDATE routes
        SET route_name = @route_name,
            start_location = @start_location,
            end_location = @end_location,
            price = @price
        WHERE route_id = @routeId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json({ message: "Route updated successfully" });
  } catch (err) {
    console.error("Error in updateRoute:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteRoute = async (req, res) => {
  try {
    const pool = await getConnection();

    const assigned = await pool
      .request()
      .input("routeId", req.params.route_id)
      .query(`SELECT COUNT(*) AS count FROM student_routes WHERE route_id = @routeId`);

    if (assigned.recordset[0].count > 0) {
      return res.status(400).json({ error: "Cannot delete route. Students are assigned to this route." });
    }

    const result = await pool
      .request()
      .input("routeId", req.params.id)
      .query(`DELETE FROM routes WHERE route_id = @routeId`);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Route not found" });
    }

    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    console.error("Error in deleteRoute:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getStudentRoute = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("studentId", studentId)
      .query(`
        SELECT sr.student_route_id, r.route_name, r.start_location, r.end_location, r.price, sr.assigned_at
        FROM student_routes sr
        INNER JOIN routes r ON sr.route_id = r.route_id
        WHERE sr.student_id = @studentId
      `);

    if (result.recordset.length === 0) {
      return res.json({ message: "No route assigned yet" });
    }

    res.json({ route: result.recordset[0] });
  } catch (err) {
    console.error("Error in getStudentRoute:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const assignRouteToStudent = async (req, res) => {
  const { studentId, routeId, semesterId } = req.body;

  try {
    const pool = await getConnection();

    const exists = await pool
      .request()
      .input("studentId", studentId)
      .input("semesterId", semesterId)
      .query(`SELECT * FROM student_routes WHERE student_id = @studentId AND semester_id = @semesterId`);

    if (exists.recordset.length > 0) {
    
      await pool
        .request()
        .input("studentId", studentId)
        .input("semesterId", semesterId)
        .input("routeId", routeId)
        .query(`
          UPDATE student_routes
          SET route_id = @routeId, assigned_at = GETDATE()
          WHERE student_id = @studentId AND semester_id = @semesterId
        `);

      return res.json({ message: "Student route updated successfully" });
    } else {
      
      await pool
        .request()
        .input("studentId", studentId)
        .input("semesterId", semesterId)
        .input("routeId", routeId)
        .query(`
          INSERT INTO student_routes (student_id, semester_id, route_id)
          VALUES (@studentId, @semesterId, @routeId)
        `);

      return res.status(201).json({ message: "Student route assigned successfully" });
    }
  } catch (err) {
    console.error("Error in assignRouteToStudent:", err);
    res.status(500).json({ error: "Server error" });
  }
};
