// db.js
import sql from "mssql";

const config = {
  user: "sqladmin",
  password: "Msazure_1",
  server: "transportserver101.database.windows.net",
  database: "Test1234",
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

export async function getConnection() {
  try {
    const pool = await sql.connect(config);
    console.log("Connected to Azure SQL Database");
    return pool;
  } catch (err) {
    console.error("DB connection failed:", err);
    throw err;
  }
}
