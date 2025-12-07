import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import "./register.css";

export default function Register() {
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    no_hp: "",
    password: "",
    password_confirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Validation states
  const [errors, setErrors] = useState({});

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Nama validation
    if (!formData.nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi";
    } else if (formData.nama.trim().length < 3) {
      newErrors.nama = "Nama minimal 3 karakter";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Phone validation
    if (!formData.no_hp.trim()) {
      newErrors.no_hp = "Nomor HP wajib diisi";
    } else if (!/^(\+62|0)[0-9]{9,12}$/.test(formData.no_hp.replace(/\s/g, ""))) {
      newErrors.no_hp = "Format nomor HP tidak valid (08xx atau +62xx)";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    // Password confirm validation
    if (!formData.password_confirm) {
      newErrors.password_confirm = "Konfirmasi password wajib diisi";
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('0')) {
      value = '0' + value.slice(1);
    } else if (value.startsWith('62')) {
      value = '+' + value;
    }
    
    setFormData(prev => ({
      ...prev,
      no_hp: value
    }));
    
    if (errors.no_hp) {
      setErrors(prev => ({
        ...prev,
        no_hp: ""
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nama: formData.nama.trim(),
        email: formData.email.trim(),
        no_hp: formData.no_hp.replace(/\s/g, ''), // Remove spaces only
        password: formData.password,
        password_confirmation: formData.password_confirm,
      };

      console.log("Register payload:", payload);

      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Register response:", result);

      if (!response.ok) {
        // Handle validation errors from backend
        if (result.errors) {
          const backendErrors = Object.entries(result.errors).reduce((acc, [key, messages]) => {
            acc[key] = Array.isArray(messages) ? messages[0] : messages;
            return acc;
          }, {});
          setErrors(backendErrors);
          throw new Error("Validasi gagal. Silakan periksa data Anda.");
        }
        throw new Error(result.message || "Pendaftaran gagal");
      }

      if (result.status === "success") {
        setSuccessMsg("✅ Pendaftaran berhasil! Silakan login dengan akun Anda.");
        
        // Reset form
        setFormData({
          nama: "",
          email: "",
          no_hp: "",
          password: "",
          password_confirm: "",
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setErrorMsg(result.message || "Pendaftaran gagal");
      }
    } catch (error) {
      console.error("Register error:", error);
      setErrorMsg(error.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!formData.password) return null;
    
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)) strength++;
    if (/\d/.test(formData.password)) strength++;
    if (/[!@#$%^&*]/.test(formData.password)) strength++;

    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const getStrengthLabel = (strength) => {
    if (!strength) return "";
    if (strength === 1) return "Lemah";
    if (strength === 2) return "Sedang";
    if (strength === 3) return "Kuat";
    return "Sangat Kuat";
  };

  const getStrengthColor = (strength) => {
    if (!strength) return "";
    if (strength === 1) return "#ef4444";
    if (strength === 2) return "#f59e0b";
    if (strength === 3) return "#10b981";
    return "#059669";
  };

  return (
    <div className="registerContainer">
      <div className="registerWrapper">
        <h2 className="formTitle">Daftar Akun Baru</h2>
        <p className="formSubtitle">Bergabunglah dengan Bank Sampah Digital</p>

        <form className="registerForm" onSubmit={handleRegister}>
          {/* Nama Lengkap */}
          <div className="formGroup">
            <label htmlFor="nama">Nama Lengkap*</label>
            <div className="inputWrap">
              <input
                type="text"
                id="nama"
                name="nama"
                placeholder="Masukkan nama lengkap Anda"
                className={`inputField ${errors.nama ? "inputError" : ""}`}
                value={formData.nama}
                onChange={handleInputChange}
                disabled={loading}
                autoComplete="name"
              />
              <User className="inputIcon" />
            </div>
            {errors.nama && (
              <span className="errorText">
                <AlertCircle size={16} />
                {errors.nama}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="formGroup">
            <label htmlFor="email">Email*</label>
            <div className="inputWrap">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="nama@email.com"
                className={`inputField ${errors.email ? "inputError" : ""}`}
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                autoComplete="email"
              />
              <Mail className="inputIcon" />
            </div>
            {errors.email && (
              <span className="errorText">
                <AlertCircle size={16} />
                {errors.email}
              </span>
            )}
          </div>

          {/* Nomor HP */}
          <div className="formGroup">
            <label htmlFor="no_hp">Nomor HP*</label>
            <div className="inputWrap">
              <input
                type="tel"
                id="no_hp"
                name="no_hp"
                placeholder="08xx xxxx xxxx atau +62xx"
                className={`inputField ${errors.no_hp ? "inputError" : ""}`}
                value={formData.no_hp}
                onChange={handlePhoneChange}
                disabled={loading}
                autoComplete="tel"
              />
              <Phone className="inputIcon" />
            </div>
            {errors.no_hp && (
              <span className="errorText">
                <AlertCircle size={16} />
                {errors.no_hp}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="formGroup">
            <label htmlFor="password">Password*</label>
            <div className="inputWrap">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Minimal 8 karakter"
                className={`inputField ${errors.password ? "inputError" : ""}`}
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="togglePassword"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="errorText">
                <AlertCircle size={16} />
                {errors.password}
              </span>
            )}
            {formData.password && (
              <div className="passwordStrength">
                <div className="strengthBar">
                  <div 
                    className="strengthFill" 
                    style={{
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: getStrengthColor(passwordStrength)
                    }}
                  ></div>
                </div>
                <span className="strengthLabel" style={{ color: getStrengthColor(passwordStrength) }}>
                  Kekuatan: {getStrengthLabel(passwordStrength)}
                </span>
              </div>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div className="formGroup">
            <label htmlFor="password_confirm">Konfirmasi Password*</label>
            <div className="inputWrap">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                id="password_confirm"
                name="password_confirm"
                placeholder="Ulangi password Anda"
                className={`inputField ${errors.password_confirm ? "inputError" : ""}`}
                value={formData.password_confirm}
                onChange={handleInputChange}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="togglePassword"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                tabIndex="-1"
              >
                {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {formData.password_confirm && formData.password === formData.password_confirm && !errors.password_confirm && (
                <CheckCircle size={20} className="checkIcon" style={{ color: '#10b981' }} />
              )}
            </div>
            {errors.password_confirm && (
              <span className="errorText">
                <AlertCircle size={16} />
                {errors.password_confirm}
              </span>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="alertBox alertError">
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="alertBox alertSuccess">
              <CheckCircle size={20} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="termsBox">
            <p>
              Dengan mendaftar, Anda setuju dengan{" "}
              <a href="/terms" className="termsLink">Syarat & Ketentuan</a> dan{" "}
              <a href="/privacy" className="termsLink">Kebijakan Privasi</a> kami.
            </p>
          </div>

          {/* Register Button */}
          <button 
            type="submit" 
            className="registerBtn" 
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading ? "Mendaftar..." : "Daftar Akun"}
          </button>

          {/* Login Link */}
          <p className="loginText">
            Sudah punya akun?{" "}
            <a href="/login" className="loginLink">
              Masuk di sini
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
