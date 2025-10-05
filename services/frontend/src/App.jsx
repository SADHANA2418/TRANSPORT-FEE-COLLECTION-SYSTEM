import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import PasswordReset from "./pages/PasswordReset.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import RouteManagement from "./pages/RouteManagement.jsx";
import PaymentsManagement from "./pages/PaymentsManagement.jsx";
import UserDashboardIndex from "./pages/UserDashboardIndex";
import FeePayment from "./pages/FeePayment";
import HistoryReceipts from "./pages/HistoryReceipts";

function App() {
  return (

    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/reset-password" element={<PasswordReset />} />



      {/* Admin Dashboard with Nested Routes */}
      <Route path="/admin/*" element={<AdminDashboard />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="routes" element={<RouteManagement />} />
        <Route path="payments" element={<PaymentsManagement />} />
      </Route>

      <Route path="/user/*" element={<UserDashboard />}>
        <Route index element={<UserDashboardIndex />} />
        <Route path="fee-payment" element={<FeePayment />} />
        <Route path="history" element={<HistoryReceipts />} />
      </Route>

    </Routes>

  );
}

export default App;
