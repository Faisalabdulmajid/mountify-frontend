import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./HalamanDetailGunung.css"; // Kita akan buat file CSS ini

const API_BASE_URL = "http://localhost:5000/api";

function HalamanDetailGunung() {
  const { id_gunung } = useParams(); // Mengambil ID dari URL
  const [gunung, setGunung] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // Fetch data detail gunung dari backend
    fetch(`${API_BASE_URL}/gunung/${id_gunung}`)
      .then(async (res) => {
        if (!res.ok) {
          let msg = `Gagal memuat data gunung (status ${res.status})`;
          try {
            const data = await res.json();
            msg = data.message || msg;
          } catch {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then((data) => {
        // Setelah data gunung didapat, fetch jalur pendakian
        fetch(`${API_BASE_URL}/gunung/${id_gunung}/jalur`)
          .then(async (res) => {
            if (!res.ok) return [];
            try {
              return await res.json();
            } catch {
              return [];
            }
          })
          .then((trails) => {
            setGunung({ ...data, trails });
            setIsLoading(false);
          })
          .catch(() => {
            setGunung({ ...data, trails: [] });
            setIsLoading(false);
          });
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [id_gunung]);

  // Tambahkan kembali fungsi utilitas deskripsi jika hilang
  const getDifficultyDescription = (v) => {
    if (v === undefined || v === null) return "-";
    v = Number(v);
    if (v <= 2) return "Sangat Mudah (1-2)";
    if (v <= 4) return "Mudah (3-4)";
    if (v <= 6) return "Sedang (5-6)";
    if (v <= 8) return "Sulit (7-8)";
    if (v <= 10) return "Ekstrem (9-10)";
    return `Level ${v}`;
  };
  const getEstimationDescription = (v) => {
    if (v === undefined || v === null) return "-";
    v = Number(v);
    if (v <= 8) return "Pendakian Singkat (<8 jam)";
    if (v <= 16) return "1 Hari (8-16 jam)";
    if (v <= 30) return "2 Hari 1 Malam (17-30 jam)";
    if (v <= 48) return "2-3 Hari (31-48 jam)";
    if (v <= 72) return "Ekspedisi (>48 jam)";
    return `${v} jam`;
  };

  if (isLoading) {
    return <div className="loading-container">Memuat informasi gunung...</div>;
  }

  if (error) {
    return <div className="loading-container">{error}</div>;
  }

  if (!gunung) {
    return (
      <div className="loading-container">Informasi gunung tidak ditemukan.</div>
    );
  }

  // Fallback untuk field utama agar robust jika data dari API
  const namaGunung =
    gunung.name || gunung.nama_gunung || gunung.nama || gunung.namaGunung;
  const lokasi =
    gunung.location ||
    gunung.lokasi_administratif ||
    gunung.lokasi ||
    gunung.lokasiGunung;
  const ketinggian =
    gunung.elevation ||
    gunung.ketinggian ||
    gunung.ketinggian_puncak_mdpl ||
    gunung.ketinggian_mdpl;
  const headerImage =
    gunung.headerImageUrl ||
    gunung.url_thumbnail ||
    gunung.thumbnail ||
    gunung.gambar;
  const deskripsi = gunung.description || gunung.deskripsi || gunung.ringkasan;
  const trails = gunung.trails || gunung.jalur || gunung.jalur_terbaik || [];
  const gallery = gunung.gallery || gunung.galeri || gunung.foto || [];

  // Fungsi untuk menampilkan lokasi administratif tanpa pengulangan provinsi
  function formatLokasiUnik(lokasi) {
    if (!lokasi) return "-";
    // Pisahkan berdasarkan ;
    const parts = lokasi
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    // Ambil nama kabupaten/kota saja jika provinsi sama
    const provinsiSet = new Set();
    const kabupatenList = [];
    parts.forEach((item) => {
      // Contoh: KABUPATEN WONOSOBO, JAWA TENGAH
      const [kab, prov] = item.split(",").map((s) => s.trim());
      if (prov && !provinsiSet.has(prov)) {
        provinsiSet.add(prov);
        kabupatenList.push(item); // tampilkan kabupaten + provinsi pertama
      } else if (prov && provinsiSet.has(prov)) {
        kabupatenList.push(kab); // hanya tampilkan kabupaten/kota saja
      } else {
        kabupatenList.push(item); // fallback
      }
    });
    return kabupatenList.join(", ");
  }

  return (
    <div className="detail-gunung-page">
      <header
        className="gunung-header"
        style={{ backgroundImage: `url(${headerImage})` }}
      >
        <div className="header-overlay">
          <h1>{namaGunung}</h1>
          <p>{formatLokasiUnik(lokasi)}</p>
        </div>
      </header>
      <main className="gunung-content-container">
        {/* Info Cepat */}
        <section className="info-cepat-panel">
          <div className="info-item">
            <i className="bi bi-geo-alt-fill"></i>
            <span>LOKASI</span>
            <p>{formatLokasiUnik(lokasi)}</p>
          </div>
          <div className="info-item">
            <i className="bi bi-graph-up"></i>
            <span>KETINGGIAN</span>
            <p>{ketinggian ? ketinggian.toLocaleString() : "-"} mdpl</p>
          </div>
          {/* Hilangkan info kesulitan gunung */}
        </section>

        {/* Deskripsi */}
        <section className="content-section">
          <h2>Tentang {namaGunung}</h2>
          <p className="gunung-description">{deskripsi}</p>
        </section>

        {/* Jalur Pendakian */}
        <section className="content-section">
          <h2>Jalur Pendakian</h2>
          <div className="jalur-list">
            {Array.isArray(trails) && trails.length > 0 ? (
              trails.map((jalur, index) => (
                <div
                  key={index}
                  className="jalur-card clickable"
                  onClick={() => navigate(`/jalur/${jalur.id_jalur}`)}
                  style={{ cursor: "pointer" }}
                  title="Lihat detail jalur"
                >
                  <h3>{jalur.name || jalur.nama || jalur.nama_jalur}</h3>
                  <p>
                    <strong>Estimasi:</strong>{" "}
                    {getEstimationDescription(
                      jalur.estimasi_waktu_jam ||
                        jalur.duration ||
                        jalur.estimasi ||
                        jalur.durasi
                    )}
                  </p>
                  <p>
                    <strong>Kesulitan:</strong>{" "}
                    {getDifficultyDescription(
                      jalur.kesulitan_skala ||
                        jalur.difficulty ||
                        jalur.kesulitan
                    )}
                  </p>
                </div>
              ))
            ) : (
              <p>Tidak ada data jalur pendakian.</p>
            )}
          </div>
        </section>

        {/* Galeri */}
        <section className="content-section">
          <h2>Galeri Foto</h2>
          <div className="galeri-grid">
            {Array.isArray(gallery) && gallery.length > 0 ? (
              gallery.map((url, index) => (
                <div key={index} className="galeri-item">
                  <img src={url} alt={`Galeri ${namaGunung} ${index + 1}`} />
                </div>
              ))
            ) : (
              <p>Tidak ada foto galeri.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HalamanDetailGunung;
