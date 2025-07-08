// src/pages/auth/Login.js (KODE FINAL DENGAN NAVIGASI)

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Pastikan useNavigate diimpor
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import { EyeIcon } from "../../components/common/EyeIcon";

// Impor HANYA CSS untuk form
import "./AuthForms.css";

function Login() {
  const navigate = useNavigate(); // Panggil hook useNavigate di sini
  const { login } = useAuth();
  const { closeModal, openModal } = useModal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State untuk show/hide password

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Email atau password salah.");
      }

      // 1. Simpan data login ke context
      login(data.user, data.token);

      // === SIMPAN PERAN USER KE LOCALSTORAGE ===
      // Simpan peran user ke localStorage, update jika user berbeda
      localStorage.setItem("peran", data.user.peran);
      localStorage.setItem("userId", data.user._id || data.user.id || ""); // opsional, jika ingin tracking user

      // 2. Tutup modal
      closeModal();

      // === PERBAIKAN UTAMA ADA DI SINI ===
      // 3. Cek peran pengguna, jika admin, arahkan ke dashboard
      if (data.user.peran === "admin" || data.user.peran === "superadmin") {
        navigate("/admin/dashboard");
      }
      // Untuk pengguna biasa, tidak perlu navigasi, mereka akan tetap di halaman saat ini.
      // Anda bisa menambahkan 'else { navigate("/") }' jika ingin user biasa diarahkan ke Home.
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login Akun</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="auth-message error">{error}</div>}
        <div className="auth-form-group">
          <label htmlFor="email_login">Email</label>
          <input
            type="email"
            id="email_login"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email Anda"
            required
          />
        </div>
        <div className="auth-form-group">
          <label htmlFor="password_login">Password</label>
          <input
            type={showPassword ? "text" : "password"} // Tampilkan password sebagai teks jika showPassword true
            id="password_login"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password Anda"
            required
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              cursor: "pointer",
              marginLeft: "-30px",
              position: "relative",
              zIndex: 2,
            }}
            title={showPassword ? "Sembunyikan Password" : "Lihat Password"}
          >
            <EyeIcon visible={showPassword} />
          </span>
        </div>
        <div className="auth-form-options">
          <button
            type="button"
            onClick={() => openModal("forgotPassword")}
            className="auth-link"
          >
            Lupa Password?
          </button>
        </div>
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Memproses..." : "Login"}
        </button>
      </form>
      <div className="auth-divider">ATAU</div>
      <button
        className="auth-google-button"
        disabled={loading}
        style={{ position: "relative" }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
          alt="Google logo"
        />
        Login dengan Google
        <span
          style={{
            color: "#e67e22",
            fontSize: "0.85em",
            marginLeft: 8,
            fontWeight: 600,
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
          }}
          title="Fitur dalam pengembangan"
        >
          (Beta)
          <svg
            style={{ marginLeft: 2, verticalAlign: "middle" }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e67e22"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="8" />
          </svg>
        </span>
      </button>
      <div className="auth-navigation-prompt">
        Belum punya akun?{" "}
        <button
          type="button"
          onClick={() => openModal("register")}
          className="auth-link"
        >
          Daftar sekarang
        </button>
      </div>
    </div>
  );
}

export default Login;
