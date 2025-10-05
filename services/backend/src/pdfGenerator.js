// utils/pdfGenerator.js
import puppeteer from "puppeteer";

export const generateReceiptPDF = async (paymentData) => {
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          td, th { padding: 10px; border: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <h1>Payment Receipt</h1>
        <p><strong>Student:</strong> ${paymentData.studentName}</p>
        <p><strong>Payment ID:</strong> ${paymentData.paymentId}</p>
        <p><strong>Amount Paid:</strong> ₹${paymentData.amountPaid}</p>
        <p><strong>Payment Date:</strong> ${paymentData.paymentDate}</p>
        <p><strong>Payment Method:</strong> ${paymentData.method}</p>
        <p><strong>Reference Number:</strong> ${paymentData.referenceNumber}</p>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  return pdfBuffer;
};
