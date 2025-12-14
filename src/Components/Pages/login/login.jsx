import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Leaf } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Login gagal");
      }

      const result = await response.json();

      if (result.status === "success") {
        // Extract login response
        const loginData = result.data;
        const userData = loginData.user;
        
        // Get role from backend response (either as string or object)
        const userRole = userData.role?.nama_role || userData.role || 'nasabah';
        const userPermissions = userData.role?.permissions || [];

        console.log('✅ Login successful!', {
          userId: userData.id,
          email: userData.email,
          role: userRole,
          permissions: userPermissions.length,
          isAdmin: userRole === 'admin' || userRole === 'superadmin'
        });

        // Use context login method (passes entire response)
        login(loginData);

        // Role-based navigation
        if (userRole === 'admin' || userRole === 'superadmin') {
          console.log('🔐 Navigating to admin dashboard');
          navigate("/admin/dashboard", { replace: true });
        } else {
          console.log('👤 Navigating to user dashboard');
          navigate("/dashboard", { replace: true });
        }
      } else {
        setErrorMsg(result.message || "Email atau password salah.");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.message.includes("Failed to fetch") || error.message.includes("ERR_CONNECTION_REFUSED")) {
        setErrorMsg("Tidak dapat terhubung ke server. Pastikan backend berjalan di http://127.0.0.1:8000");
      } else {
        setErrorMsg(error.message || "Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPageWrapper">
      {/* Back Button */}
      <button 
        className="backButton"
        onClick={() => navigate("/landing")}
        aria-label="Kembali"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="loginContainer">
        {/* Logo & Header */}
        <div className="loginHeader">
          <div className="logoIcon">
            <Leaf size={32} strokeWidth={1.5} />
          </div>
          <h1 className="formTitle">Masuk ke Mendaur</h1>
          <p className="formSubtitle">Lanjutkan perjalanan sustainability Anda</p>
        </div>

        <form className="loginForm" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="formGroup">
            <label className="inputLabel">Email</label>
            <div className="inputWrap">
              <input
                type="email"
                placeholder="nama@email.com"
                className="inputField"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
              <Mail className="inputIcon" size={20} />
            </div>
          </div>

          {/* Password Input */}
          <div className="formGroup">
            <label className="inputLabel">Kata Sandi</label>
            <div className="inputWrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi"
                className="inputField"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <Lock className="inputIcon" size={20} />
              <button
                type="button"
                className="togglePassword"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="errorAlert">
              <p className="errorText">{errorMsg}</p>
            </div>
          )}

          {/* Links Row */}
          <div className="linksRow">
            <a href="#" className="forgotLink">Ingat saya</a>
            <a href="/forgot-password" className="forgotLink">Lupa kata sandi?</a>
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            className="loginBtn" 
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}