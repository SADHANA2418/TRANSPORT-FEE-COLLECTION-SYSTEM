// test-db.js
// const { getConnection } = require("./config/db.js");

// (async () => {
//   await getConnection();
// })();
const { getConnection } = require("./config/db.js");
const sql = require("mssql");

(async () => {
  try {
    // connect using your existing helper
    let pool = await getConnection();

    // query the users table
    let result = await pool.request().query("SELECT email FROM users");

    console.log("Emails in users table:");
    result.recordset.forEach(row => {
      console.log(row.email);
    });

    // close connection
    sql.close();
  } catch (err) {
    console.error(" Error:", err);
  }
})();
