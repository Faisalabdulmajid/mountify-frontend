// src/pages/admin/jalur/EditJalur.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TambahJalur.css";
import PageHeaderBack from "./components/PageHeaderBack";

const API_BASE_URL = "http://localhost:5000";

// Konstanta enum status jalur - harus sama dengan backend
const TRAIL_STATUS_OPTIONS = [
  "Belum Diketahui",
  "Buka",
  "Tutup Sementara",
  "Tutup",
];

// scoreMappings sesuai standar fuzzy engine dari laporan detail
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

const findClosestKey = (mapping, score) => {
  if (score === 0 || score === null || score === undefined)
    return "Belum Diketahui";
  return Object.keys(mapping).reduce((prev, curr) => {
    if (mapping[curr] === null) return prev;
    if (mapping[prev] === null) return curr;
    return Math.abs(mapping[curr] - score) < Math.abs(mapping[prev] - score)
      ? curr
      : prev;
  });
};

function EditJalur() {
  const navigate = useNavigate();
  const { id_jalur } = useParams();
  const [gunungList, setGunungList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [gunungResponse, jalurResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/gunung`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/jalur/${id_jalur}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!gunungResponse.ok) throw new Error("Gagal memuat daftar gunung.");
        if (!jalurResponse.ok) throw new Error("Gagal memuat data jalur.");

        const gunungData = await gunungResponse.json();
        const jalurData = await jalurResponse.json();

        setGunungList(gunungData);
        setGeneralData({
          id_gunung: jalurData.id_gunung,
          nama_jalur: jalurData.nama_jalur,
          lokasi_pintu_masuk: jalurData.lokasi_pintu_masuk || "",
          estimasi_waktu_jam: jalurData.estimasi_waktu_jam,
          deskripsi_jalur: jalurData.deskripsi_jalur || "",
          status_jalur: jalurData.status_jalur || "Belum Diketahui",
          ketersediaan_sumber_air_skala:
            jalurData.ketersediaan_sumber_air_skala || "",
          variasi_lanskap_skala: jalurData.variasi_lanskap_skala || "",
          perlindungan_angin_kemah_skala:
            jalurData.perlindungan_angin_kemah_skala || "",
          jaringan_komunikasi_skala: jalurData.jaringan_komunikasi_skala || "",
          tingkat_insiden_skala: jalurData.tingkat_insiden_skala || "",
        });

        setDescriptiveScores({
          medan: findClosestKey(scoreMappings.medan, jalurData.kesulitan_skala),
          navigasi: findClosestKey(
            scoreMappings.navigasi,
            jalurData.keamanan_skala
          ),
          risiko_tambahan: findClosestKey(
            scoreMappings.risiko_tambahan,
            jalurData.keamanan_skala
          ),
          basecamp: findClosestKey(
            scoreMappings.basecamp,
            jalurData.kualitas_fasilitas_skala
          ),
          sumber_air: findClosestKey(
            scoreMappings.sumber_air,
            jalurData.kualitas_fasilitas_skala
          ),
          lahan_kemah: findClosestKey(
            scoreMappings.lahan_kemah,
            jalurData.kualitas_kemah_skala
          ),
          perlindungan_kemah: findClosestKey(
            scoreMappings.perlindungan_kemah,
            jalurData.kualitas_kemah_skala
          ),
          lanskap: findClosestKey(
            scoreMappings.lanskap,
            jalurData.keindahan_pemandangan_skala
          ),
          viewpoint: findClosestKey(
            scoreMappings.viewpoint,
            jalurData.keindahan_pemandangan_skala
          ),
          jaringan_komunikasi: findClosestKey(
            scoreMappings.jaringan_komunikasi,
            jalurData.keamanan_skala
          ),
        });
      } catch (error) {
        toast.error(error.message);
        setTimeout(() => navigate("/admin/jalur"), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id_jalur, navigate]);

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
    setIsLoading(true);

    const finalScores = calculateFinalScores();
    const dataToSend = {
      ...generalData,
      ...finalScores,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/admin/jalur/${id_jalur}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      toast.success("Data jalur berhasil diperbarui!");
      setTimeout(() => {
        navigate("/admin/jalur", { replace: true });
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error(error.message || "Terjadi kesalahan saat memperbarui data.");
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
        value={descriptiveScores[name] || "Belum Diketahui"}
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

  if (isLoading)
    return <div className="loading-container">Memuat data jalur...</div>;

  return (
    <div className="add-jalur-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <PageHeaderBack
        title={`Edit Data Jalur: ${generalData.nama_jalur}`}
        backText="Kembali"
        backLink="/admin/jalur"
      />
      <form onSubmit={handleSubmit} className="form-widget-jalur">
        <fieldset className="form-fieldset" disabled={isLoading}>
          <legend>Informasi Dasar</legend>
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
              <label htmlFor="estimasi_waktu_jam">Estimasi Waktu (Jam)</label>
              <input
                type="number"
                id="estimasi_waktu_jam"
                name="estimasi_waktu_jam"
                value={generalData.estimasi_waktu_jam}
                onChange={handleGeneralChange}
                required
              />
            </div>
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

        {/* Tambahkan input field fuzzy engine pada form (setelah estimasi waktu dan status jalur) */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ketersediaan_sumber_air_skala">
              Ketersediaan Sumber Air (0-10)
            </label>
            <input
              type="number"
              id="ketersediaan_sumber_air_skala"
              name="ketersediaan_sumber_air_skala"
              min={0}
              max={10}
              value={generalData.ketersediaan_sumber_air_skala}
              onChange={handleGeneralChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="variasi_lanskap_skala">
              Variasi Lanskap (0-10)
            </label>
            <input
              type="number"
              id="variasi_lanskap_skala"
              name="variasi_lanskap_skala"
              min={0}
              max={10}
              value={generalData.variasi_lanskap_skala}
              onChange={handleGeneralChange}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="perlindungan_angin_kemah_skala">
              Perlindungan Angin Kemah (0-10)
            </label>
            <input
              type="number"
              id="perlindungan_angin_kemah_skala"
              name="perlindungan_angin_kemah_skala"
              min={0}
              max={10}
              value={generalData.perlindungan_angin_kemah_skala}
              onChange={handleGeneralChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="jaringan_komunikasi_skala">
              Jaringan Komunikasi (0-10)
            </label>
            <input
              type="number"
              id="jaringan_komunikasi_skala"
              name="jaringan_komunikasi_skala"
              min={0}
              max={10}
              value={generalData.jaringan_komunikasi_skala}
              onChange={handleGeneralChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="tingkat_insiden_skala">
              Tingkat Insiden (0-10)
            </label>
            <input
              type="number"
              id="tingkat_insiden_skala"
              name="tingkat_insiden_skala"
              min={0}
              max={10}
              value={generalData.tingkat_insiden_skala}
              onChange={handleGeneralChange}
              required
            />
          </div>
        </div>

        {/* ... sisa form tidak berubah ... */}
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
              {renderSelect(
                "Tingkat Insiden & Risiko",
                "risiko_tambahan",
                scoreMappings.risiko_tambahan
              )}
              {renderSelect(
                "Jaringan Komunikasi",
                "jaringan_komunikasi",
                scoreMappings.jaringan_komunikasi
              )}
            </div>
            <div className="parameter-group">
              <h4>Kualitas Fasilitas</h4>
              {renderSelect(
                "Fasilitas Basecamp",
                "basecamp",
                scoreMappings.basecamp
              )}
              {renderSelect(
                "Sumber Air di Jalur",
                "sumber_air",
                scoreMappings.sumber_air
              )}
            </div>
            <div className="parameter-group">
              <h4>Kualitas Area Kemah</h4>
              {renderSelect(
                "Lahan & Kapasitas Kemah",
                "lahan_kemah",
                scoreMappings.lahan_kemah
              )}
              {renderSelect(
                "Perlindungan dari Angin",
                "perlindungan_kemah",
                scoreMappings.perlindungan_kemah
              )}
            </div>
            <div className="parameter-group">
              <h4>Keindahan Pemandangan</h4>
              {renderSelect(
                "Variasi Lanskap",
                "lanskap",
                scoreMappings.lanskap
              )}
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
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditJalur;
