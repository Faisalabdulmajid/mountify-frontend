// src/pages/admin/poi/EditPoi.js (Final - Dengan Kapitalisasi Otomatis)
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditPoi.css";

const API_BASE_URL = "http://localhost:5000";

// --- Fungsi Bantuan untuk Kapitalisasi ---
const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

function EditPoi() {
  const navigate = useNavigate();
  const { id_poi } = useParams();

  const [formData, setFormData] = useState({
    nama_titik: "",
    tipe_titik: "",
    id_jalur: "",
    koordinat: "",
    deskripsi: "",
    ketersediaan_air: false,
    kapasitas_tenda: 0,
  });

  const [idGunung, setIdGunung] = useState("");
  const [gunungList, setGunungList] = useState([]);
  const [jalurList, setJalurList] = useState([]);
  const [jalurTersedia, setJalurTersedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [gunungRes, jalurRes, poiRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/gunung`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/jalur`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/poi/${id_poi}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!gunungRes.ok || !jalurRes.ok || !poiRes.ok)
          throw new Error("Gagal memuat data esensial.");

        const gunungData = await gunungRes.json();
        const jalurData = await jalurRes.json();
        const poiData = await poiRes.json();

        setGunungList(gunungData);
        setJalurList(jalurData);

        const jalurTerkait = jalurData.find(
          (j) => j.id_jalur === poiData.id_jalur
        );
        if (jalurTerkait) {
          setIdGunung(jalurTerkait.id_gunung);
        }

        setFormData({
          nama_titik: poiData.nama_titik || "",
          tipe_titik: poiData.tipe_titik || "Lainnya",
          id_jalur: poiData.id_jalur || "",
          koordinat: poiData.koordinat || "",
          deskripsi: poiData.deskripsi || "",
          ketersediaan_air: poiData.ketersediaan_air || false,
          kapasitas_tenda: poiData.kapasitas_tenda || 0,
        });
      } catch (error) {
        toast.error(error.message);
        navigate("/admin/poi");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id_poi, navigate]);

  useEffect(() => {
    if (idGunung) {
      setJalurTersedia(
        jalurList.filter((jalur) => jalur.id_gunung === parseInt(idGunung))
      );
    } else {
      setJalurTersedia([]);
    }
  }, [idGunung, jalurList]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- FUNGSI BARU ---
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "nama_titik") {
      setFormData((prev) => ({ ...prev, [name]: toTitleCase(value) }));
    }
  };

  const handleGunungChange = (e) => {
    setIdGunung(e.target.value);
    setFormData((prev) => ({ ...prev, id_jalur: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_titik || !formData.id_jalur) {
      toast.warn("Nama POI dan Jalur terkait wajib diisi.");
      return;
    }
    setIsLoading(true);

    // --- PERBAIKAN: Menerapkan toTitleCase sebelum mengirim ---
    const dataToSend = {
      ...formData,
      nama_titik: toTitleCase(formData.nama_titik),
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/admin/poi/${id_poi}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      toast.success(result.message);
      navigate("/admin/poi");
    } catch (error) {
      toast.error(error.message || "Terjadi kesalahan saat memperbarui data.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading-container">Memuat data...</div>;

  return (
    <div className="edit-poi-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="page-header">
        <h1>Edit POI: {formData.nama_titik}</h1>
        <Link to="/admin/poi" className="btn-back">
          <i className="bi bi-arrow-left"></i> Kembali
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="form-widget-poi">
        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Informasi Utama</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nama_titik">Nama Titik Penting (POI)</label>
              <input
                type="text"
                id="nama_titik"
                name="nama_titik"
                value={formData.nama_titik}
                onChange={handleChange}
                onBlur={handleBlur} // Menambahkan onBlur
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="tipe_titik">Kategori Titik Penting</label>
              <select
                id="tipe_titik"
                name="tipe_titik"
                value={formData.tipe_titik}
                onChange={handleChange}
              >
                <option value="Pos">Pos</option>
                <option value="Shelter">Shelter</option>
                <option value="Sumber Air">Sumber Air</option>
                <option value="Area Kemah">Area Kemah</option>
                <option value="Puncak">Puncak</option>
                <option value="Spot Foto">Spot Foto</option>
                <option value="Persimpangan">Persimpangan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="id_gunung">Terletak di Gunung</label>
              <select
                id="id_gunung"
                name="id_gunung"
                value={idGunung}
                onChange={handleGunungChange}
              >
                <option value="">-- Pilih Gunung untuk filter jalur --</option>
                {gunungList.map((g) => (
                  <option key={g.id_gunung} value={g.id_gunung}>
                    {g.nama_gunung}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="id_jalur">Berada di Jalur</label>
              <select
                id="id_jalur"
                name="id_jalur"
                value={formData.id_jalur}
                onChange={handleChange}
                required
                disabled={!idGunung || jalurTersedia.length === 0}
              >
                <option value="">-- Pilih Jalur --</option>
                {jalurTersedia.map((j) => (
                  <option key={j.id_jalur} value={j.id_jalur}>
                    {j.nama_jalur}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group full-width">
            <label htmlFor="koordinat">
              Koordinat Lokasi (Latitude, Longitude)
            </label>
            <input
              type="text"
              id="koordinat"
              name="koordinat"
              value={formData.koordinat}
              onChange={handleChange}
            />
          </div>
        </fieldset>

        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Atribut Tambahan</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="kapasitas_tenda">
                Kapasitas Tenda (jika Area Camp)
              </label>
              <input
                type="number"
                id="kapasitas_tenda"
                name="kapasitas_tenda"
                value={formData.kapasitas_tenda}
                onChange={handleChange}
              />
            </div>
            <div className="form-group toggle-group">
              <label>Ketersediaan Sumber Air</label>
              <div className="toggle-switch-container">
                <span>Tidak</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    id="ketersediaan_air"
                    name="ketersediaan_air"
                    checked={!!formData.ketersediaan_air}
                    onChange={handleChange}
                  />
                  <span className="slider round"></span>
                </label>
                <span>Ya</span>
              </div>
            </div>
          </div>
          <div className="form-group full-width">
            <label htmlFor="deskripsi">
              Deskripsi atau Keterangan Tambahan
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              rows="4"
              value={formData.deskripsi}
              onChange={handleChange}
            ></textarea>
          </div>
        </fieldset>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/poi")}
            disabled={isLoading}
          >
            Batal
          </button>
          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditPoi;
