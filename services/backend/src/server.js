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
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://white-pond-0c14daf0f.1.azurestaticapps.net", // Azure frontend
      "http://localhost:5173" // Local dev
    ];

    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ Handle preflight requests properly
app.options("*", cors(corsOptions));


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
