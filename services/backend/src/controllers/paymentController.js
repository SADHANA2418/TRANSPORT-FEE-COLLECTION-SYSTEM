export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    const signature = req.headers["x-razorpay-signature"];

    if (digest !== signature) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload.payment.entity;

    if (event === "payment.captured") {
      const amountPaid = payload.amount / 100;
      const reference = payload.id;
      const method = payload.method;

      // You can map order_id back to student/payment here
      const razorpayOrderId = payload.order_id;

      const pool = await getConnection();
      const paymentIdResult = await pool.request()
        .input("orderId", razorpayOrderId)
        .query(`SELECT payment_id FROM payments WHERE razorpay_order_id = @orderId`);

      if (paymentIdResult.recordset.length > 0) {
        const paymentId = paymentIdResult.recordset[0].payment_id;

        await pool.request()
          .input("paymentId", paymentId)
          .input("amount", amountPaid)
          .input("method", method)
          .input("reference", reference)
          .query(`
            INSERT INTO transaction_history (payment_id, amount, method, reference_number)
            VALUES (@paymentId, @amount, @method, @reference)
          `);

        await pool.request()
          .input("paymentId", paymentId)
          .input("amount", amountPaid)
          .query(`
            UPDATE payments
            SET pending_amount = CASE
                WHEN pending_amount - @amount < 0 THEN 0
                ELSE pending_amount - @amount
            END,
            status = CASE
                WHEN pending_amount - @amount <= 0 THEN 'paid'
                ELSE 'unpaid'
            END
            WHERE payment_id = @paymentId
          `);
      }
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
