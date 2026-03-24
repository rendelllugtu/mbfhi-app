// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Requirements from "./pages/Requirements";
import PIMAM from "./pages/PIMAM";
import AdminDashboard from "./pages/AdminDashboard";
import AssessorDashboard from "./pages/AssessorDashboard";
import MBFHIApply from "./pages/MBFHIApply";
import RoleRedirect from "./components/RoleRedirect";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RoleRedirect />
        <Routes>

          {/* 🔓 LOGIN (NO LAYOUT) */}
          <Route path="/login" element={<Login />} />

          {/* 🌐 PUBLIC WITH LAYOUT */}
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />

          <Route path="/about" element={
            <Layout>
              <About />
            </Layout>
          } />

          <Route path="/pimam" element={
            <Layout>
              <PIMAM />
            </Layout>
          } />

          <Route path="/contact" element={
            <Layout>
              <Contact />
            </Layout>
          } />

          <Route path="/requirements" element={
            <Layout>
              <Requirements />
            </Layout>
          } />

          <Route path="/apply" element={
            <Layout>
              <MBFHIApply />
            </Layout>
          } />

          {/* 🔐 ADMIN */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* 🔐 ASSESSOR */}
          <Route path="/assessor" element={
            <ProtectedRoute role="assessor">
              <Layout>
                <AssessorDashboard />
              </Layout>
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}