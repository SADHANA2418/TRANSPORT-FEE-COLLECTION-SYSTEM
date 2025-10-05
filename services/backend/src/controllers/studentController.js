// import { getConnection } from "../config/db.js";

// // export const getDashboard = async (req, res) => {
// //   try {
   
// //     const dashboardInfo = {
// //       welcomeMessage: `Welcome, ${req.user.name}`,
// //       announcements: ["Transport fee due soon", "New routes added"],
// //       currentSemester: "Fall 2025",
// //     };

// //     return res.json(dashboardInfo);
// //   } catch (err) {
// //     console.error("Error in getDashboard:", err);
// //     return res.status(500).json({ error: "Server error" });
// //   }
// // };

// // import { getConnection } from "../config/db.js";

// export const getDashboard = async (req, res) => {
//   try {
//     const studentId = req.user.user_id;
//     const pool = await getConnection();

  
//     const announcementsResult = await pool.request()
//       .query(`
//         SELECT TOP 5 title, message, created_at
//         FROM announcements
//         ORDER BY created_at DESC
//       `);


//     const semesterResult = await pool.request()
//       .query(`
//         SELECT TOP 1 semester_name
//         FROM semesters
//         WHERE GETDATE() BETWEEN start_date AND end_date
//         ORDER BY start_date DESC
//       `);

//     const currentSemester = semesterResult.recordset.length > 0
//       ? semesterResult.recordset[0].semester_name
//       : "No active semester";

//     const feeResult = await pool.request()
//       .input("studentId", studentId)
//       .query(`
//         SELECT 
//           SUM(p.amount) AS total_fee,
//           SUM(COALESCE(th.amount, 0)) AS total_paid,
//           (SUM(p.amount) - SUM(COALESCE(th.amount, 0))) AS pending_fee,
//           SUM(CASE WHEN i.status = 'unpaid' AND i.due_date < GETDATE() THEN i.amount ELSE 0 END) AS overdue_fee
//         FROM payments p
//         LEFT JOIN transaction_history th ON p.payment_id = th.payment_id
//         LEFT JOIN installments i ON p.payment_id = i.payment_id
//         WHERE p.student_id = @studentId
//       `);

//     const feeSummary = feeResult.recordset[0] || {
//       total_fee: 0,
//       total_paid: 0,
//       pending_fee: 0,
//       overdue_fee: 0,
//     };

  
//     const dashboardInfo = {
//       welcomeMessage: `Welcome, ${req.user.name}`,
//       announcements: announcementsResult.recordset,
//       currentSemester,
//       feeSummary,
//     };

//     return res.json(dashboardInfo);
//   } catch (err) {
//     console.error("Error in getDashboard:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };


// export const getFeeInfo = async (req, res) => {
//   try {
//     const studentId = req.user.user_id; 
//     const pool = await getConnection();

//     const feeResult = await pool.request()
//       .input("studentId", studentId)
//       .query(`
//         SELECT p.payment_id, p.amount, p.status, p.due_date
//         FROM payments p
//         WHERE p.student_id = @studentId
//         ORDER BY p.due_date DESC
//       `);

//     const payments = feeResult.recordset;

//     for (const payment of payments) {
//       const installmentsResult = await pool.request()
//         .input("paymentId", payment.payment_id)
//         .query(`SELECT installment_number, amount, due_date, status FROM installments WHERE payment_id = @paymentId ORDER BY installment_number`);

//       payment.installments = installmentsResult.recordset;
//     }

//     return res.json({ payments });
//   } catch (err) {
//     console.error("Error in getFeeInfo:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };

// export const getPaymentHistory = async (req, res) => {
//   try {
//     const studentId = req.user.user_id;
//     const pool = await getConnection();

//     const historyResult = await pool.request()
//       .input("studentId", studentId)
//       .query(`
//         SELECT ph.payment_id, ph.amount, ph.status, th.transaction_id, th.transaction_date, th.method, th.reference_number
//         FROM payments ph
//         LEFT JOIN transaction_history th ON ph.payment_id = th.payment_id
//         WHERE ph.student_id = @studentId
//         ORDER BY th.transaction_date DESC
//       `);

//     return res.json({ history: historyResult.recordset });
//   } catch (err) {
//     console.error("Error in getPaymentHistory:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };

// export const getProfile = async (req, res) => {
//   try {
//     const studentId = req.user.user_id;
//     const pool = await getConnection();

//     const userResult = await pool.request()
//       .input("userId", studentId)
//       .query("SELECT user_id, name, email, role, created_at FROM users WHERE user_id = @userId");

//     if (userResult.recordset.length === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     return res.json(userResult.recordset[0]);
//   } catch (err) {
//     console.error("Error in getProfile:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const studentId = req.user.user_id;
//     const { name } = req.body;

//     if (!name || name.trim() === "") {
//       return res.status(400).json({ error: "Name is required" });
//     }

//     const pool = await getConnection();

//     await pool.request()
//       .input("userId", studentId)
//       .input("name", name)
//       .query("UPDATE users SET name = @name WHERE user_id = @userId");

//     return res.json({ message: "Profile updated successfully" });
//   } catch (err) {
//     console.error("Error in updateProfile:", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// };

import { getConnection } from "../config/db.js";
import Razorpay from "razorpay";

import crypto from "crypto";

import { generateReceiptPDF } from "../pdfGenerator.js";
import { uploadToAzureBlob, generateSasUrl } from "../azureBlob.js"
// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------- existing controllers (unchanged) ----------------
export const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const pool = await getConnection();

    const announcementsResult = await pool.request()
      .query(`
        SELECT TOP 5 title, message, created_at
        FROM announcements
        ORDER BY created_at DESC
      `);

    const semesterResult = await pool.request()
      .query(`
        SELECT TOP 1 semester_name
        FROM semesters
        WHERE GETDATE() BETWEEN start_date AND end_date
        ORDER BY start_date DESC
      `);

    const currentSemester = semesterResult.recordset.length > 0
      ? semesterResult.recordset[0].semester_name
      : "No active semester";

    const feeResult = await pool.request()
      .input("studentId", studentId)
      .query(`
        SELECT 
          SUM(p.amount) AS total_fee,
          SUM(COALESCE(th.amount, 0)) AS total_paid,
          (SUM(p.amount) - SUM(COALESCE(th.amount, 0))) AS pending_fee,
          SUM(CASE WHEN i.status = 'unpaid' AND i.due_date < GETDATE() THEN i.amount ELSE 0 END) AS overdue_fee
        FROM payments p
        LEFT JOIN transaction_history th ON p.payment_id = th.payment_id
        LEFT JOIN installments i ON p.payment_id = i.payment_id
        WHERE p.student_id = @studentId
      `);

    const feeSummary = feeResult.recordset[0] || {
      total_fee: 0,
      total_paid: 0,
      pending_fee: 0,
      overdue_fee: 0,
    };

    const dashboardInfo = {
      welcomeMessage: `Welcome, ${req.user.name}`,
      announcements: announcementsResult.recordset,
      currentSemester,
      feeSummary,
    };

    return res.json(dashboardInfo);
  } catch (err) {
    console.error("Error in getDashboard:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getFeeInfo = async (req, res) => {
  try {
    const studentId = req.user.user_id; 
    const pool = await getConnection();

    const feeResult = await pool.request()
      .input("studentId", studentId)
      .query(`
        SELECT p.payment_id, p.amount, p.status, p.due_date
        FROM payments p
        WHERE p.student_id = @studentId
        ORDER BY p.due_date DESC
      `);

    const payments = feeResult.recordset;

    for (const payment of payments) {
      const installmentsResult = await pool.request()
        .input("paymentId", payment.payment_id)
        .query(`
          SELECT installment_number, amount, due_date, status
          FROM installments
          WHERE payment_id = @paymentId
          ORDER BY installment_number
        `);

      payment.installments = installmentsResult.recordset;
    }

    return res.json({ payments });
  } catch (err) {
    console.error("Error in getFeeInfo:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const pool = await getConnection();

    const historyResult = await pool.request()
      .input("studentId", studentId)
      .query(`
        SELECT ph.payment_id, ph.amount AS payment_total, ph.status AS payment_status,
               th.transaction_id, th.transaction_date, th.amount AS paid_amount, th.method, th.reference_number
        FROM payments ph
        LEFT JOIN transaction_history th ON ph.payment_id = th.payment_id
        WHERE ph.student_id = @studentId
        ORDER BY th.transaction_date DESC
      `);

    return res.json({ history: historyResult.recordset });
  } catch (err) {
    console.error("Error in getPaymentHistory:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const pool = await getConnection();

    const userResult = await pool.request()
      .input("userId", studentId)
      .query("SELECT user_id, name, email, role, created_at FROM users WHERE user_id = @userId");

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(userResult.recordset[0]);
  } catch (err) {
    console.error("Error in getProfile:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Name is required" });
    }

    const pool = await getConnection();

    await pool.request()
      .input("userId", studentId)
      .input("name", name)
      .query("UPDATE users SET name = @name WHERE user_id = @userId");

    return res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error in updateProfile:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ---------------- new fee endpoints ----------------

/**
 * GET /student/fee/options
 * Returns totalFee, totalPaid, pending and the split-up options (1/3, 2/3, full)
 * Note: the frontend will always present all three splits (but we return only valid options too)
 */
export const getFeeOptions = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const pool = await getConnection();

    // Get aggregate total and paid for the student
    const feeResult = await pool.request()
      .input("studentId", studentId)
      .query(`
        SELECT 
          ISNULL(SUM(p.amount), 0) as totalFee,
          ISNULL(SUM(th_paid.paid_amount), 0) as totalPaid
        FROM payments p
        LEFT JOIN (
          SELECT payment_id, SUM(amount) AS paid_amount
          FROM transaction_history
          GROUP BY payment_id
        ) th_paid ON p.payment_id = th_paid.payment_id
        WHERE p.student_id = @studentId
      `);

    const row = feeResult.recordset[0] || { totalFee: 0, totalPaid: 0 };
    const totalFee = Number(row.totalFee || 0);
    const totalPaid = Number(row.totalPaid || 0);
    const pending = Math.max(0, totalFee - totalPaid);

    // fixed split-ups based on totalFee
    const oneThird = Math.floor(totalFee / 3);
    const twoThird = Math.floor((2 * totalFee) / 3);
    const full = totalFee;

    // Options are always shown by frontend; we additionally return which are currently valid (<= pending)
    const allOptions = [
      { key: "one_third", label: "1/3rd", amount: oneThird },
      { key: "two_third", label: "2/3rd", amount: twoThird },
      { key: "full", label: "Full", amount: full },
    ];

    const validOptions = allOptions.filter(o => o.amount <= pending && o.amount > 0);

    return res.json({
      totalFee,
      totalPaid,
      pending,
      options: allOptions,       // frontend can always list these
      validOptions,             // backend-side filtered valid options (optional)
    });
  } catch (err) {
    console.error("Error in getFeeOptions:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


/**
 * POST /student/fee/create-order
 * Body: { option: "one_third" | "two_third" | "full" }
 * Creates a Razorpay order after validating the option <= pending
 */
export const createPaymentOrder = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const { option } = req.body;
    if (!option) return res.status(400).json({ error: "Option is required" });

    const pool = await getConnection();

    // get total and paid
    const feeResult = await pool.request()
      .input("studentId", studentId)
      .query(`
        SELECT 
          ISNULL(SUM(p.amount),0) as totalFee,
          ISNULL(SUM(th_paid.paid_amount),0) as totalPaid
        FROM payments p
        LEFT JOIN (
          SELECT payment_id, SUM(amount) AS paid_amount
          FROM transaction_history
          GROUP BY payment_id
        ) th_paid ON p.payment_id = th_paid.payment_id
        WHERE p.student_id = @studentId
      `);

    const row = feeResult.recordset[0] || { totalFee: 0, totalPaid: 0 };
    const totalFee = Number(row.totalFee || 0);
    const totalPaid = Number(row.totalPaid || 0);
    const pending = Math.max(0, totalFee - totalPaid);

    if (totalFee <= 0) {
      return res.status(400).json({ error: "No fee record found for student" });
    }

    const oneThird = Math.floor(totalFee / 3);
    const twoThird = Math.floor((2 * totalFee) / 3);
    const full = totalFee;

    let amountToPay;
    if (option === "one_third") amountToPay = oneThird;
    else if (option === "two_third") amountToPay = twoThird;
    else if (option === "full") amountToPay = full;
    else return res.status(400).json({ error: "Invalid payment option" });

    // validate against pending (only check this)
    if (amountToPay > pending) {
      return res.status(400).json({ error: "Selected amount exceeds pending fee" });
    }

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: Math.round(amountToPay * 100),
      currency: "INR",
      receipt: `student_${studentId}_amt_${amountToPay}_${Date.now()}`,
      notes: {
        student_id: String(studentId),
        amount_to_pay: String(amountToPay)
      }
    });

    return res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      amountToPay,
      pending,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Error in createPaymentOrder:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


/**
 * POST /student/fee/verify
 * Body from frontend Razorpay handler:
 * { razorpay_payment_id, razorpay_order_id, razorpay_signature, amountPaid }
 *
 * This endpoint:
 *  - verifies Razorpay signature
 *  - finds an appropriate payment row for the student that can accept this amount
 *  - inserts transaction_history
 *  - updates payment status to 'paid' if that payment's remaining becomes zero
 */







export const verifyPayment = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amountPaid } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !amountPaid) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }

    // ✅ Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const pool = await getConnection();

    // ✅ Find payment row for this student
    const findPaymentQuery = `
      SELECT TOP 1
        p.payment_id,
        p.amount AS payment_total,
        ISNULL(th_sum.paid_sum, 0) AS paid_sum,
        (p.amount - ISNULL(th_sum.paid_sum, 0)) AS remaining
      FROM payments p
      LEFT JOIN (
        SELECT payment_id, SUM(amount) AS paid_sum
        FROM transaction_history
        GROUP BY payment_id
      ) th_sum ON p.payment_id = th_sum.payment_id
      WHERE p.student_id = @studentId
        AND (p.amount - ISNULL(th_sum.paid_sum, 0)) >= @amountPaid
      ORDER BY p.payment_id ASC
    `;

    let paymentRowResult = await pool
      .request()
      .input("studentId", studentId)
      .input("amountPaid", amountPaid)
      .query(findPaymentQuery);

    // ✅ Fallback: partially payable payment
    if (!paymentRowResult.recordset || paymentRowResult.recordset.length === 0) {
      const fallbackResult = await pool
        .request()
        .input("studentId", studentId)
        .query(`
          SELECT TOP 1
            p.payment_id,
            p.amount AS payment_total,
            ISNULL(th_sum.paid_sum,0) AS paid_sum,
            (p.amount - ISNULL(th_sum.paid_sum,0)) AS remaining
          FROM payments p
          LEFT JOIN (
            SELECT payment_id, SUM(amount) AS paid_sum
            FROM transaction_history
            GROUP BY payment_id
          ) th_sum ON p.payment_id = th_sum.payment_id
          WHERE p.student_id = @studentId
            AND (p.amount - ISNULL(th_sum.paid_sum,0)) > 0
          ORDER BY p.payment_id ASC
        `);

      if (!fallbackResult.recordset || fallbackResult.recordset.length === 0) {
        return res.status(400).json({ error: "No payable payment record found for this student" });
      }

      paymentRowResult.recordset = fallbackResult.recordset;
    }

    const paymentRow = paymentRowResult.recordset[0];
    const paymentId = paymentRow.payment_id;
    const remainingBefore = Number(paymentRow.remaining || 0);

    // ✅ Insert into transaction_history
    await pool
      .request()
      .input("paymentId", paymentId)
      .input("amount", amountPaid)
      .input("method", "Razorpay")
      .input("reference", razorpay_payment_id)
      .query(`
        INSERT INTO transaction_history (payment_id, amount, method, reference_number)
        VALUES (@paymentId, @amount, @method, @reference)
      `);

    // ✅ Recalculate remaining
    const remainingResult = await pool
      .request()
      .input("paymentId", paymentId)
      .query(`
        SELECT p.payment_id, p.amount AS payment_total,
               ISNULL(th_sum.paid_sum,0) AS paid_sum,
               (p.amount - ISNULL(th_sum.paid_sum,0)) AS remaining
        FROM payments p
        LEFT JOIN (
          SELECT payment_id, SUM(amount) AS paid_sum
          FROM transaction_history
          GROUP BY payment_id
        ) th_sum ON p.payment_id = th_sum.payment_id
        WHERE p.payment_id = @paymentId
      `);

    const remainingRow = remainingResult.recordset[0];
    const remainingAfter = Number(remainingRow.remaining || 0);

    // ✅ Mark as fully paid if remaining = 0
    if (remainingAfter === 0) {
      await pool
        .request()
        .input("paymentId", paymentId)
        .query(`UPDATE payments SET status = 'paid' WHERE payment_id = @paymentId`);
    }

    // ✅ Fetch student details
    const studentResult = await pool
      .request()
      .input("studentId", studentId)
      .query("SELECT name, email FROM users WHERE user_id = @studentId");

    const student = studentResult.recordset[0];

    // ✅ Prepare receipt data
    const receiptData = {
      studentName: student.name,
      paymentId,
      amountPaid,
      paymentDate: new Date().toLocaleString(),
      method: "Razorpay",
      referenceNumber: razorpay_payment_id,
    };

    // ✅ Generate PDF
    const pdfBuffer = await generateReceiptPDF(receiptData);

    // ✅ Upload PDF to Azure (private container)
    const blobName = `receipt_${paymentId}_${Date.now()}.pdf`;
    await uploadToAzureBlob(pdfBuffer, blobName);
await pool
  .request()
  .input("paymentId", paymentId)
  .input("receiptBlobName", blobName)
  .query(`UPDATE payments SET receipt_url = @receiptBlobName WHERE payment_id = @paymentId`);
    // ✅ Generate SAS URL (valid for 1 hour)
    const receiptSasUrl = generateSasUrl(blobName, 60);

    // ✅ Store receipt SAS URL in DB (optional: can store blobName instead)
    await pool
      .request()
      .input("paymentId", paymentId)
      .input("receiptUrl", receiptSasUrl)
      .query(`UPDATE payments SET receipt_url = @receiptUrl WHERE payment_id = @paymentId`);

    // ✅ Return response
    return res.json({
      success: true,
      message: "Payment recorded and receipt generated",
      paymentId,
      creditedAmount: amountPaid,
      remainingBefore,
      remainingAfter,
      receiptUrl: receiptSasUrl
    });

  } catch (err) {
    console.error("Error in verifyPayment:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


export const downloadReceipt = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    const { paymentId } = req.params;

    const pool = await getConnection();

    // 1. Get blob name from DB for this payment
    const result = await pool.request()
      .input("paymentId", paymentId)
      .query("SELECT receipt_url FROM payments WHERE payment_id = @paymentId AND student_id = @studentId");

    if (!result.recordset.length) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    const blobName = result.recordset[0].receipt_url;

    // 2. Generate SAS URL valid for 1 hour
    const sasUrl = generateSasUrl(blobName, 60);

    // 3. Send SAS URL to frontend
    return res.json({ success: true, sasUrl });
  } catch (err) {
    console.error("Error generating SAS link:", err);
    return res.status(500).json({ error: "Server error" });
  }
};




export const testReceiptUpload = async (req, res) => {
  try {
    const receiptData = {
      studentName: "Test Student",
      paymentId: 12345,
      amountPaid: 5000,
      paymentDate: new Date().toLocaleString(),
      method: "Razorpay",
      referenceNumber: "test_ref_98765"
    };

    // Generate PDF
    const pdfBuffer = await generateReceiptPDF(receiptData);

    // Upload to Azure Blob
    const blobName = `receipt_test_${Date.now()}.pdf`;
    await uploadToAzureBlob(pdfBuffer, blobName);

    // Generate SAS URL for download/view
    const sasUrl = generateSasUrl(blobName, 5); // 5 minutes validity

    return res.json({
      success: true,
      message: "Test receipt generated and uploaded",
      receiptSasUrl: sasUrl
    });
  } catch (err) {
    console.error("Test receipt error:", err);
    return res.status(500).json({ error: "Test receipt upload failed" });
  }
};
