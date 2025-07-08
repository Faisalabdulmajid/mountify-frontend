// src/pages/admin/poi/TambahPoi.js (Final - Dengan Kapitalisasi Otomatis)
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TambahPoi.css";

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

function TambahPoi() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama_titik: "",
    tipe_titik: "Pos",
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDataForDropdowns = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        console.log("🔄 Fetching data for dropdowns...");

        const [gunungRes, jalurRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/gunung`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/jalur-for-poi`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log(
          "📊 Response status - Gunung:",
          gunungRes.status,
          "Jalur:",
          jalurRes.status
        );

        // Jika endpoint jalur gagal, coba endpoint alternatif
        let jalurData = [];
        if (jalurRes.ok) {
          jalurData = await jalurRes.json();
          console.log("✅ Endpoint /api/admin/jalur-for-poi berhasil");
        } else {
          console.warn(
            "⚠️ Endpoint /api/admin/jalur-for-poi gagal, status:",
            jalurRes.status
          );
          const errorText = await jalurRes.text();
          console.log("❌ Error response:", errorText);

          console.log("🔄 Mencoba endpoint standar admin jalur...");
          try {
            const jalurResStandard = await fetch(
              `${API_BASE_URL}/api/admin/jalur`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (jalurResStandard.ok) {
              jalurData = await jalurResStandard.json();
              console.log(
                "✅ Berhasil menggunakan endpoint standar /api/admin/jalur"
              );
            } else {
              console.log("🔄 Mencoba endpoint alternatif /api/jalur...");
              const jalurResAlt = await fetch(`${API_BASE_URL}/api/jalur`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (jalurResAlt.ok) {
                jalurData = await jalurResAlt.json();
                console.log(
                  "✅ Berhasil menggunakan endpoint alternatif /api/jalur"
                );
              } else {
                const altErrorText = await jalurResAlt.text();
                console.error(
                  "❌ Endpoint alternatif juga gagal:",
                  jalurResAlt.status,
                  altErrorText
                );
              }
            }
          } catch (altError) {
            console.error("❌ Endpoint alternatif juga gagal:", altError);
          }
        }

        if (!gunungRes.ok && jalurData.length === 0)
          throw new Error("Gagal memuat data untuk dropdown.");

        const gunungData = await gunungRes.json();

        console.log("📈 Data loaded:");
        console.log("- Gunung:", gunungData);
        console.log("- Jalur:", jalurData);

        // Validasi struktur data jalur
        if (jalurData.length > 0) {
          const sampleJalur = jalurData[0];
          console.log("🔍 Sample jalur structure:", sampleJalur);
          if (!sampleJalur.hasOwnProperty("id_gunung")) {
            console.warn("⚠️ Data jalur tidak memiliki field id_gunung!");
          }
        }

        setGunungList(gunungData);
        setJalurList(jalurData);
      } catch (error) {
        console.error("❌ Error fetching dropdown data:", error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDataForDropdowns();
  }, []);

  useEffect(() => {
    console.log("🔍 Debug Filter Jalur:");
    console.log("- idGunung:", idGunung, "type:", typeof idGunung);
    console.log("- jalurList:", jalurList);

    if (idGunung) {
      // Coba beberapa cara filter untuk mengatasi masalah tipe data
      const filteredJalur = jalurList.filter((jalur) => {
        const match1 = jalur.id_gunung === parseInt(idGunung);
        const match2 = String(jalur.id_gunung) === String(idGunung);
        // eslint-disable-next-line eqeqeq
        const match3 = jalur.id_gunung == idGunung; // loose equality untuk backup

        console.log(
          `- Jalur "${jalur.nama_jalur}": id_gunung=${
            jalur.id_gunung
          } (${typeof jalur.id_gunung}), match=${match1 || match2 || match3}`
        );

        return match1 || match2 || match3;
      });

      console.log("- Jalur tersedia:", filteredJalur);
      setJalurTersedia(filteredJalur);
    } else {
      setJalurTersedia([]);
    }
    setFormData((prev) => ({ ...prev, id_jalur: "" }));
  }, [idGunung, jalurList]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- FUNGSI BARU ---
  // Menerapkan kapitalisasi saat pengguna selesai mengisi input nama
  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "nama_titik") {
      setFormData((prev) => ({ ...prev, [name]: toTitleCase(value) }));
    }
  };

  const handleGunungChange = (e) => {
    setIdGunung(e.target.value);
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
      const response = await fetch(`${API_BASE_URL}/api/admin/poi`, {
        method: "POST",
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
      toast.error(error.message || "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-poi-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="page-header">
        <h1>Tambah Titik Penting (POI) Baru</h1>
        <Link to="/admin/poi" className="btn-back">
          <i className="bi bi-arrow-left"></i> Kembali ke Daftar POI
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
                placeholder="Contoh: Pos 3 Kandang Badak"
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
              {/* Debug info */}
              {process.env.NODE_ENV === "development" && (
                <small style={{ color: "#666", fontSize: "0.8em" }}>
                  Debug: Jalur tersedia: {jalurTersedia.length} | Gunung
                  dipilih: {idGunung || "Belum"}
                </small>
              )}
              <select
                id="id_jalur"
                name="id_jalur"
                value={formData.id_jalur}
                onChange={handleChange}
                required
                disabled={!idGunung || jalurTersedia.length === 0}
              >
                <option value="">
                  {!idGunung
                    ? "-- Pilih Gunung dulu --"
                    : jalurTersedia.length === 0
                    ? "-- Tidak ada jalur tersedia --"
                    : "-- Pilih Jalur --"}
                </option>
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
              placeholder="Contoh: -6.7821, 106.9875"
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
                placeholder="0"
              />
            </div>
            <div className="form-group toggle-group">
              <label>Ketersediaan Sumber Air</label>
              <div className="toggle-switch-container">
                <span>Tidak</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="ketersediaan_air"
                    checked={formData.ketersediaan_air}
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
              placeholder="Jelaskan hal penting tentang lokasi ini..."
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
            {isLoading ? "Menyimpan..." : "Simpan POI"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TambahPoi;
