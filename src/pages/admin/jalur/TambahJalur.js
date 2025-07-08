// src/pages/admin/jalur/TambahJalur.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TambahJalur.css";
import PageHeaderBack from "./components/PageHeaderBack";
import { fetchCsrfToken } from "../../../utils/csrf";

const API_BASE_URL = "http://localhost:5000";

const toTitleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Mapping skor berdasarkan standar fuzzy engine yang sesuai dengan laporan
const scoreMappings = {
  // 1. Tingkat Kesulitan & Durasi
  medan: {
    "Belum Diketahui": null,
    "Sangat Mudah (0-2): Jalur landai, setapak jelas": 1,
    "Mudah (3-4): Tanjakan sedang, bebatuan kecil": 3,
    "Sedang (5-6): Tanjakan panjang, butuh bantuan tangan": 5,
    "Sulit (7-8): Sangat curam >45°, scrambling": 7,
    "Sangat Sulit (9-10): Mendekati vertikal, butuh keahlian panjat": 9,
  },

  // 2. Keamanan & Risiko
  navigasi: {
    "Belum Diketahui": null,
    "Aman (7-10): Jalur jelas, terawat, jauh dari risiko": 9,
    "Cukup Aman (4-6): Beberapa titik waspada, jalur aman": 6,
    "Berbahaya (0-3): Riwayat longsor, kawah aktif, jurang tanpa pengaman": 2,
  },
  risiko_tambahan: {
    "Belum Diketahui": null,
    "Rendah/Jarang (8-10): <5 insiden SAR per tahun": 9,
    "Sedang (4-7): 5-10 insiden per tahun": 6,
    "Tinggi/Sering (0-3): >10 insiden SAR per tahun": 2,
  },

  // 3. Kenyamanan & Logistik - Fasilitas
  basecamp: {
    "Belum Diketahui": null,
    "Sangat Lengkap (9-10): Fasilitas modern, penginapan, persewaan alat": 9,
    "Lengkap (6-8): Basecamp terorganisir, pusat info, mushola, warung": 7,
    "Cukup (3-5): Basecamp sederhana, toilet umum, warung kecil": 5,
    "Sangat Minim (0-2): Tidak ada basecamp resmi, pendaftaran di rumah warga": 1,
  },
  sumber_air: {
    "Belum Diketahui": null,
    "Melimpah (7-10): >3 sumber air atau 1 sumber sangat melimpah setiap pos": 9,
    "Terbatas (3-6): 1-3 titik sumber air, mungkin musiman": 5,
    "Langka/Tidak Ada (0-2): Harus bawa seluruh pasokan air dari basecamp": 1,
  },

  // 4. Kenyamanan & Logistik - Area Kemah
  lahan_kemah: {
    "Belum Diketahui": null,
    "Baik (7-10): Lahan luas, datar, bersih, sumber air dekat <5 menit": 9,
    "Cukup (4-6): Lahan untuk 5-10 tenda, sumber air <30 menit": 6,
    "Buruk (0-3): Lahan miring, berbatu, sempit, sumber air >1 jam": 2,
  },
  perlindungan_kemah: {
    "Belum Diketahui": null,
    "Terlindungi (7-10): Dalam hutan lebat atau lembah dalam": 9,
    "Cukup Terlindungi (4-6): Lembah kecil atau di antara pepohonan": 6,
    "Sangat Terekspos (0-3): Punggungan terbuka, puncak, sabana tanpa penghalang": 2,
  },

  // 5. Kualitas Pengalaman & Lingkungan
  lanskap: {
    "Belum Diketahui": null,
    "Sangat Bervariasi (7-10): >3 ekosistem berbeda": 9,
    "Cukup Bervariasi (4-6): 2-3 transisi ekosistem": 6,
    "Monoton (0-3): Satu jenis ekosistem dari awal hingga akhir": 2,
  },
  viewpoint: {
    "Belum Diketahui": null,
    "Istimewa/Ikonik (9-10): Panoramik 360°, fitur ikonik terkenal": 9,
    "Sangat Indah/Panoramik (7-8): Sebagian besar jalur terbuka": 7,
    "Indah/Terbuka Sebagian (4-6): Beberapa titik dengan pemandangan bagus": 5,
    "Biasa/Terbatas (0-3): Hutan rapat, pemandangan hanya di puncak": 2,
  },

  // 6. Logistik & Risiko Tambahan
  jaringan_komunikasi: {
    "Belum Diketahui": null,
    "Baik (7-10): Sinyal tersedia di sebagian besar jalur": 9,
    "Terbatas (3-6): Sinyal hanya di titik tertentu": 5,
    "Tidak Ada (0-2): Tidak ada sinyal setelah meninggalkan basecamp": 1,
  },
};

// Konstanta enum status jalur - harus sama dengan backend
const TRAIL_STATUS_OPTIONS = [
  "Belum Diketahui",
  "Buka",
  "Buka (Wajib menggunakan pemandu/operator tur)",
  "Tutup Sementara",
  "Tutup",
];

// Opsi dropdown deskriptif untuk field fuzzy engine
const fuzzyDropdownOptions = {
  ketersediaan_sumber_air_skala: [
    "Belum Diketahui",
    "Melimpah (7-10): >3 sumber air atau 1 sumber sangat melimpah setiap pos",
    "Terbatas (3-6): 1-3 titik sumber air, mungkin musiman",
    "Langka/Tidak Ada (0-2): Harus bawa seluruh pasokan air dari basecamp",
  ],
  variasi_lanskap_skala: [
    "Belum Diketahui",
    "Sangat Bervariasi (7-10): >3 ekosistem berbeda",
    "Cukup Bervariasi (4-6): 2-3 transisi ekosistem",
    "Monoton (0-3): Satu jenis ekosistem dari awal hingga akhir",
  ],
  perlindungan_angin_kemah_skala: [
    "Belum Diketahui",
    "Terlindungi (7-10): Dalam hutan lebat atau lembah dalam",
    "Cukup Terlindungi (4-6): Lembah kecil atau di antara pepohonan",
    "Sangat Terekspos (0-3): Punggungan terbuka, puncak, sabana tanpa penghalang",
  ],
  jaringan_komunikasi_skala: [
    "Belum Diketahui",
    "Baik (7-10): Sinyal tersedia di sebagian besar jalur",
    "Terbatas (3-6): Sinyal hanya di titik tertentu",
    "Tidak Ada (0-2): Tidak ada sinyal setelah meninggalkan basecamp",
  ],
  tingkat_insiden_skala: [
    "Belum Diketahui",
    "Rendah/Jarang (8-10): <5 insiden SAR per tahun",
    "Sedang (4-7): 5-10 insiden per tahun",
    "Tinggi/Sering (0-3): >10 insiden SAR per tahun",
  ],
};

function TambahJalur() {
  const navigate = useNavigate();
  const [gunungList, setGunungList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  // Tambahkan field fuzzy engine pada state generalData
  const [generalData, setGeneralData] = useState({
    id_gunung: "",
    nama_jalur: "",
    lokasi_pintu_masuk: "",
    estimasi_waktu_jam: "",
    deskripsi_jalur: "",
    status_jalur: "Belum Diketahui",
    ketersediaan_sumber_air_skala: "",
    variasi_lanskap_skala: "",
    perlindungan_angin_kemah_skala: "",
    jaringan_komunikasi_skala: "",
    tingkat_insiden_skala: "",
  });

  const [descriptiveScores, setDescriptiveScores] = useState({
    medan: "Belum Diketahui",
    navigasi: "Belum Diketahui",
    risiko_tambahan: "Belum Diketahui",
    basecamp: "Belum Diketahui",
    sumber_air: "Belum Diketahui",
    lahan_kemah: "Belum Diketahui",
    perlindungan_kemah: "Belum Diketahui",
    lanskap: "Belum Diketahui",
    viewpoint: "Belum Diketahui",
    jaringan_komunikasi: "Belum Diketahui",
  });

  useEffect(() => {
    // Ambil CSRF token saat halaman dimuat
    fetchCsrfToken(API_BASE_URL)
      .then(setCsrfToken)
      .catch(() => toast.error("Gagal mengambil CSRF token"));

    const fetchGunung = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/gunung`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Gagal memuat daftar gunung.");
        const data = await response.json();
        setGunungList(data);
        if (data.length > 0) {
          setGeneralData((prev) => ({ ...prev, id_gunung: data[0].id_gunung }));
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchGunung();
  }, []);

  const handleGeneralChange = (e) => {
    setGeneralData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDescriptiveChange = (e) => {
    setDescriptiveScores((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const calculateFinalScores = () => {
    const calculateAverage = (scoreKeys) => {
      const validScores = scoreKeys
        .map((key) => scoreMappings[key][descriptiveScores[key]])
        .filter((score) => score !== null);
      if (validScores.length === 0) return 0;
      const sum = validScores.reduce((acc, score) => acc + score, 0);
      return Math.round(sum / validScores.length);
    };
    return {
      kesulitan_skala: calculateAverage(["medan"]),
      keamanan_skala: calculateAverage([
        "navigasi",
        "risiko_tambahan",
        "jaringan_komunikasi",
      ]),
      kualitas_fasilitas_skala: calculateAverage(["basecamp", "sumber_air"]),
      kualitas_kemah_skala: calculateAverage([
        "lahan_kemah",
        "perlindungan_kemah",
      ]),
      keindahan_pemandangan_skala: calculateAverage(["lanskap", "viewpoint"]),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !generalData.id_gunung ||
      !generalData.nama_jalur ||
      !generalData.estimasi_waktu_jam
    ) {
      return toast.warn(
        "Mohon pilih gunung, isi nama jalur, dan estimasi waktu."
      );
    }
    setIsLoading(true);

    const finalScores = calculateFinalScores();
    // Konversi field fuzzy engine dropdown ke angka
    const fuzzyFieldToMapping = {
      ketersediaan_sumber_air_skala: "sumber_air",
      variasi_lanskap_skala: "lanskap",
      perlindungan_angin_kemah_skala: "perlindungan_kemah",
      jaringan_komunikasi_skala: "jaringan_komunikasi",
      tingkat_insiden_skala: "risiko_tambahan",
    };
    const fuzzyFields = Object.keys(fuzzyFieldToMapping);
    const fuzzyConverted = {};
    fuzzyFields.forEach((field) => {
      const mappingKey = fuzzyFieldToMapping[field];
      const label = generalData[field];
      fuzzyConverted[field] =
        scoreMappings[mappingKey][label] !== undefined
          ? scoreMappings[mappingKey][label]
          : null;
    });

    const dataToSend = {
      ...generalData,
      ...fuzzyConverted,
      nama_jalur: toTitleCase(generalData.nama_jalur),
      ...finalScores,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/admin/jalur`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      toast.success("Jalur pendakian baru berhasil ditambahkan!");
      setTimeout(() => navigate("/admin/jalur"), 1500);
    } catch (error) {
      toast.error(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelect = (label, name, options) => (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        value={descriptiveScores[name]}
        onChange={handleDescriptiveChange}
        disabled={isLoading}
      >
        {Object.keys(options).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="add-jalur-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <PageHeaderBack
        title="Tambah Data Jalur Baru"
        backText="Kembali ke Daftar"
        backLink="/admin/jalur"
      />

      <form onSubmit={handleSubmit} className="form-widget-jalur">
        {/* Bagian 1: Identitas Jalur */}
        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Identitas Jalur</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="id_gunung">Pilih Gunung</label>
              <select
                id="id_gunung"
                name="id_gunung"
                value={generalData.id_gunung}
                onChange={handleGeneralChange}
                required
              >
                <option value="" disabled>
                  -- Pilih Gunung --
                </option>
                {gunungList.map((g) => (
                  <option key={g.id_gunung} value={g.id_gunung}>
                    {g.nama_gunung}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="nama_jalur">Nama Jalur</label>
              <input
                type="text"
                id="nama_jalur"
                name="nama_jalur"
                value={generalData.nama_jalur}
                onChange={handleGeneralChange}
                required
                placeholder="Contoh: Jalur Cibodas"
              />
            </div>
          </div>

          {/* Field Pintu Masuk */}
          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="lokasi_pintu_masuk">
                Lokasi Pintu Masuk/Gerbang
              </label>
              <input
                type="text"
                id="lokasi_pintu_masuk"
                name="lokasi_pintu_masuk"
                value={generalData.lokasi_pintu_masuk}
                onChange={handleGeneralChange}
                placeholder="Contoh: Desa Kertawangi, Pos Jaga Cibodas"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status_jalur">Status Jalur</label>
              <select
                id="status_jalur"
                name="status_jalur"
                value={generalData.status_jalur}
                onChange={handleGeneralChange}
              >
                {TRAIL_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Bagian 2: Parameter Fuzzy Engine */}
        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Parameter Fuzzy Engine</legend>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimasi_waktu_jam">Estimasi Waktu (Jam)</label>
              <input
                type="number"
                id="estimasi_waktu_jam"
                name="estimasi_waktu_jam"
                value={generalData.estimasi_waktu_jam}
                onChange={handleGeneralChange}
                required
                placeholder="Contoh: 8"
              />
            </div>
            <div className="form-group">
              <label
                htmlFor="ketersediaan_sumber_air_skala"
                style={{ marginBottom: 4 }}
              >
                Ketersediaan Sumber Air
              </label>
              <select
                id="ketersediaan_sumber_air_skala"
                name="ketersediaan_sumber_air_skala"
                value={generalData.ketersediaan_sumber_air_skala}
                onChange={handleGeneralChange}
                required
                style={{ width: "100%" }}
              >
                {fuzzyDropdownOptions.ketersediaan_sumber_air_skala.map(
                  (opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label
                htmlFor="variasi_lanskap_skala"
                style={{ marginBottom: 4 }}
              >
                Variasi Lanskap
              </label>
              <select
                id="variasi_lanskap_skala"
                name="variasi_lanskap_skala"
                value={generalData.variasi_lanskap_skala}
                onChange={handleGeneralChange}
                required
                style={{ width: "100%" }}
              >
                {fuzzyDropdownOptions.variasi_lanskap_skala.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label
                htmlFor="perlindungan_angin_kemah_skala"
                style={{ marginBottom: 4 }}
              >
                Perlindungan Angin Kemah
              </label>
              <select
                id="perlindungan_angin_kemah_skala"
                name="perlindungan_angin_kemah_skala"
                value={generalData.perlindungan_angin_kemah_skala}
                onChange={handleGeneralChange}
                required
                style={{ width: "100%" }}
              >
                {fuzzyDropdownOptions.perlindungan_angin_kemah_skala.map(
                  (opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label
                htmlFor="jaringan_komunikasi_skala"
                style={{ marginBottom: 4 }}
              >
                Jaringan Komunikasi
              </label>
              <select
                id="jaringan_komunikasi_skala"
                name="jaringan_komunikasi_skala"
                value={generalData.jaringan_komunikasi_skala}
                onChange={handleGeneralChange}
                required
                style={{ width: "100%" }}
              >
                {fuzzyDropdownOptions.jaringan_komunikasi_skala.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label
                htmlFor="tingkat_insiden_skala"
                style={{ marginBottom: 4 }}
              >
                Tingkat Insiden
              </label>
              <select
                id="tingkat_insiden_skala"
                name="tingkat_insiden_skala"
                value={generalData.tingkat_insiden_skala}
                onChange={handleGeneralChange}
                required
                style={{ width: "100%" }}
              >
                {fuzzyDropdownOptions.tingkat_insiden_skala.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Bagian 3: Parameter Penilaian */}
        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Parameter Penilaian</legend>
          <div className="descriptive-grid">
            <div className="parameter-group">
              <h4>Tingkat Kesulitan</h4>
              {renderSelect("Medan & Tanjakan", "medan", scoreMappings.medan)}
            </div>
            <div className="parameter-group">
              <h4>Tingkat Keamanan</h4>
              {renderSelect(
                "Navigasi & Petunjuk Arah",
                "navigasi",
                scoreMappings.navigasi
              )}
            </div>
            <div className="parameter-group">
              <h4>Kualitas Fasilitas</h4>
              {renderSelect(
                "Fasilitas Basecamp",
                "basecamp",
                scoreMappings.basecamp
              )}
            </div>
            <div className="parameter-group">
              <h4>Kualitas Area Kemah</h4>
              {renderSelect(
                "Lahan & Kapasitas Kemah",
                "lahan_kemah",
                scoreMappings.lahan_kemah
              )}
            </div>
            <div className="parameter-group">
              <h4>Keindahan Pemandangan</h4>
              {renderSelect(
                "Spot Pemandangan (Viewpoint)",
                "viewpoint",
                scoreMappings.viewpoint
              )}
            </div>
          </div>
        </fieldset>
        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Deskripsi Tambahan</legend>
          <div className="form-group full-width">
            <label htmlFor="deskripsi_jalur">Deskripsi Singkat Jalur</label>
            <textarea
              id="deskripsi_jalur"
              name="deskripsi_jalur"
              rows="5"
              value={generalData.deskripsi_jalur}
              onChange={handleGeneralChange}
              placeholder="Jelaskan karakteristik unik, sumber air, atau hal penting lainnya mengenai jalur ini..."
            ></textarea>
          </div>
        </fieldset>
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/jalur")}
            disabled={isLoading}
          >
            Batal
          </button>
          <button type="submit" className="btn-save" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Data Jalur"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TambahJalur;
