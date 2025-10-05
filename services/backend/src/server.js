import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoute from './routes/authRoute.js';
import studentRoute from './routes/studentRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import adminRoute from './routes/adminRoute.js';

dotenv.config();
const app = express();

// CORS for frontend
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test routes
app.get('/', (req, res) => res.send('ok'));
app.get('/home', (req, res) => res.send('this is home'));

// API routes
app.use("/auth", authRoute);
app.use("/student", studentRoute);
app.use("/payment", paymentRoute);
app.use("/admin", adminRoute);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
