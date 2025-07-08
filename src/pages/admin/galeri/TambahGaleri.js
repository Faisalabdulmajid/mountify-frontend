// src/pages/admin/galeri/TambahGaleri.js (VERSI PERBAIKAN FINAL)

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TambahGaleri.css";

const API_BASE_URL = "http://localhost:5000/api/admin";

function TambahGaleri() {
  const navigate = useNavigate();
  const [gunungList, setGunungList] = useState([]);
  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    id_gunung: "",
    file: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchGunung = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/gunung`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Gagal memuat daftar gunung.");
        const data = await response.json();
        setGunungList(data);
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchGunung();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file" && files[0]) {
      setFormData((prev) => ({ ...prev, file: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.judul) {
      toast.warn("Judul dan File Gambar wajib diisi!");
      return;
    }
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    const submissionData = new FormData();
    submissionData.append("judul", formData.judul);
    submissionData.append("deskripsi", formData.deskripsi);
    if (formData.id_gunung) {
      submissionData.append("id_gunung", formData.id_gunung);
    }
    submissionData.append("foto", formData.file);

    try {
      const response = await fetch(`${API_BASE_URL}/gallery`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submissionData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      toast.success(result.message);
      navigate("/admin/gallery");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tambah-galeri-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <header className="page-header-tambah">
        <h1>Unggah Foto Baru</h1>
        <Link to="/admin/gallery" className="btn-kembali">
          <i className="bi bi-arrow-left"></i> Kembali ke Galeri
        </Link>
      </header>

      <div className="form-wrapper-card">
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="judul">Judul Foto*</label>
            <input
              type="text"
              id="judul"
              name="judul"
              value={formData.judul}
              onChange={handleFormChange}
              required
              placeholder="Contoh: Senja di atas Gunung Prau"
            />
          </div>
          <div className="form-group">
            <label htmlFor="deskripsi">Deskripsi (Opsional)</label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleFormChange}
              rows="4"
              placeholder="Deskripsi singkat mengenai foto..."
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="id_gunung">Tautkan ke Gunung (Opsional)</label>
            <select
              name="id_gunung"
              id="id_gunung"
              value={formData.id_gunung}
              onChange={handleFormChange}
            >
              <option value="">-- Tidak Ditautkan --</option>
              {gunungList.map((gunung) => (
                <option key={gunung.id_gunung} value={gunung.id_gunung}>
                  {gunung.nama_gunung}
                </option>
              ))}
            </select>
          </div>

          {/* --- PERBAIKAN DI BLOK INI --- */}
          <div className="form-group">
            <label>Pilih File Gambar*</label>
            <div>
              {/* Label ini berfungsi sebagai tombol yang bisa diklik */}
              <label htmlFor="file" className="custom-file-upload">
                <i className="bi bi-folder2-open"></i> Pilih File
              </label>
              <span className="file-name">
                {formData.file
                  ? formData.file.name
                  : "Tidak ada file yang dipilih"}
              </span>
              {/* Input file yang asli kita sembunyikan dengan CSS, tapi tetap berfungsi */}
              <input
                type="file"
                id="file"
                name="file"
                onChange={handleFormChange}
                accept="image/jpeg, image/png, image/webp"
                required
              />
            </div>
          </div>
          {/* --- AKHIR PERBAIKAN --- */}

          {preview && (
            <div className="image-preview-container">
              <p>Preview:</p>
              <img src={preview} alt="Preview" className="image-preview" />
            </div>
          )}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit-galeri"
              disabled={isSubmitting}
            >
              <i className="bi bi-upload"></i>{" "}
              {isSubmitting ? "Mengunggah..." : "Unggah Foto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TambahGaleri;
