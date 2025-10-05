import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

// helper function
export const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Project Manager Tool" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent to", to);
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
};
