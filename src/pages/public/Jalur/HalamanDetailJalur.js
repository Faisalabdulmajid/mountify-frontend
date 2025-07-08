import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./HalamanDetailJalur.css";

const API_BASE_URL = "http://localhost:5000/api";
const DEFAULT_FALLBACK_IMAGE =
  "https://placehold.co/600x400/27ae60/FFFFFF?text=Mountify";

function fallback(trail, keys, defaultValue = "-") {
  for (const key of keys) {
    if (trail[key] !== undefined && trail[key] !== null && trail[key] !== "") {
      return trail[key];
    }
  }
  return defaultValue;
}

const createImageSrc = (thumbnail) =>
  thumbnail
    ? `${API_BASE_URL.replace("/api", "")}${thumbnail}`
    : DEFAULT_FALLBACK_IMAGE;

export default function HalamanDetailJalur() {
  const { idJalur } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/jalur/${idJalur}`);
        if (!res.ok) throw new Error("Gagal memuat detail jalur");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [idJalur]);

  if (loading)
    return <div className="detail-loading">Memuat detail jalur...</div>;
  if (error) return <div className="detail-error">{error}</div>;
  if (!data) return <div className="detail-empty">Data tidak ditemukan.</div>;

  // Fallbacks untuk field utama
  const namaJalur = fallback(data, [
    "nama_jalur",
    "nama",
    "namaJalur",
    "nama_jalur_pendakian",
  ]);
  const namaGunung = fallback(data, ["nama_gunung", "gunung", "namaGunung"]);
  const ketinggian = fallback(data, [
    "ketinggian_puncak_mdpl",
    "ketinggian",
    "ketinggian_mdpl",
  ]);
  const lokasiPintuMasuk = fallback(data, ["lokasi_pintu_masuk"]);
  const statusJalur = fallback(data, ["status_jalur", "status"]);
  const estimasiWaktu = fallback(data, [
    "estimasi_waktu_jam",
    "durasi",
    "estimasiWaktu",
  ]);
  const kesulitanSkala = fallback(data, [
    "kesulitan_skala",
    "difficulty",
    "kesulitan",
  ]);
  const keamananSkala = fallback(data, [
    "keamanan_skala",
    "safety",
    "keamanan",
  ]);
  const kualitasFasilitas = fallback(data, ["kualitas_fasilitas_skala"]);
  const kualitasKemah = fallback(data, ["kualitas_kemah_skala"]);
  const keindahanPemandangan = fallback(data, ["keindahan_pemandangan_skala"]);
  const urlThumbnail = fallback(data, ["url_thumbnail", "thumbnail"]);
  const deskripsi = fallback(data, [
    "deskripsi",
    "deskripsi_jalur",
    "keterangan",
  ]);
  const ketersediaanAir = fallback(data, ["ketersediaan_sumber_air_skala"]);
  const variasiLanskap = fallback(data, ["variasi_lanskap_skala"]);
  const perlindunganAngin = fallback(data, ["perlindungan_angin_kemah_skala"]);
  const jaringanKomunikasi = fallback(data, ["jaringan_komunikasi_skala"]);
  const tingkatInsiden = fallback(data, ["tingkat_insiden_skala"]);

  // Penjelasan untuk setiap field skala
  const penjelasan = {
    kesulitanSkala:
      "Tingkat kesulitan jalur (0=sangat mudah, 10=sangat sulit).",
    keamananSkala: "Tingkat keamanan jalur (0=berbahaya, 10=aman).",
    kualitasFasilitas:
      "Kelengkapan fasilitas basecamp & jalur (0=buruk, 10=sangat lengkap).",
    kualitasKemah: "Kualitas area kemah (0=buruk, 10=sangat baik).",
    keindahanPemandangan:
      "Keindahan & variasi pemandangan (0=biasa saja, 10=istimewa).",
    ketersediaanAir:
      "Ketersediaan sumber air di jalur (0=tidak ada, 10=melimpah).",
    variasiLanskap:
      "Variasi lanskap/ekosistem sepanjang jalur (0=monoton, 10=beragam).",
    perlindunganAngin:
      "Perlindungan area kemah dari angin (0=terbuka, 10=terlindungi).",
    jaringanKomunikasi:
      "Ketersediaan sinyal komunikasi (0=tidak ada, 10=baik).",
    tingkatInsiden: "Risiko insiden di jalur (0=sering, 10=jarang).",
  };

  // Fungsi untuk deskripsi sesuai nilai skala (contoh sederhana, bisa disesuaikan)
  function getDeskripsi(field, value) {
    if (value === null || value === undefined || value === "" || value === "-")
      return "";
    value = Number(value);
    if (isNaN(value)) return "";
    switch (field) {
      case "kesulitanSkala":
        if (value <= 2) return "Sangat mudah, jalur landai dan jelas.";
        if (value <= 4) return "Mudah, tanjakan sedang, jalur cukup jelas.";
        if (value <= 6) return "Sedang, tanjakan panjang, butuh tenaga ekstra.";
        if (value <= 8) return "Sulit, curam, butuh keahlian dan stamina.";
        return "Sangat sulit, mendekati vertikal, untuk pendaki berpengalaman.";
      case "keamananSkala":
        if (value <= 2) return "Berbahaya, banyak risiko longsor/jurang.";
        if (value <= 4) return "Cukup berisiko, beberapa titik rawan.";
        if (value <= 7) return "Cukup aman, ada beberapa titik waspada.";
        return "Aman, jalur terawat dan minim risiko.";
      case "kualitasFasilitas":
        if (value <= 3) return "Fasilitas sangat minim atau rusak.";
        if (value <= 6) return "Fasilitas cukup, ada basecamp dan toilet.";
        if (value <= 8) return "Fasilitas lengkap, basecamp terorganisir.";
        return "Fasilitas sangat lengkap dan modern.";
      case "kualitasKemah":
        if (value <= 3) return "Area kemah sempit, miring, atau berbatu.";
        if (value <= 6) return "Area kemah cukup, kapasitas sedang.";
        if (value <= 8) return "Area kemah luas dan nyaman.";
        return "Area kemah sangat luas dan aman.";
      case "keindahanPemandangan":
        if (value <= 3) return "Pemandangan terbatas, hutan rapat.";
        if (value <= 6) return "Ada beberapa titik pemandangan bagus.";
        if (value <= 8) return "Sebagian besar jalur terbuka, panoramik.";
        return "Pemandangan istimewa, fitur ikonik terkenal.";
      case "ketersediaanAir":
        if (value <= 2) return "Sumber air sangat langka/tidak ada.";
        if (value <= 6) return "Ada beberapa sumber air, musiman.";
        return "Sumber air melimpah di banyak titik.";
      case "variasiLanskap":
        if (value <= 3) return "Lanskap monoton, satu ekosistem saja.";
        if (value <= 6) return "Ada 2-3 transisi ekosistem.";
        return "Sangat bervariasi, banyak ekosistem berbeda.";
      case "perlindunganAngin":
        if (value <= 3) return "Area kemah sangat terekspos angin.";
        if (value <= 6) return "Cukup terlindungi, ada pepohonan/lembah.";
        return "Terlindungi, hutan lebat atau lembah dalam.";
      case "jaringanKomunikasi":
        if (value <= 2) return "Tidak ada sinyal setelah basecamp.";
        if (value <= 6) return "Sinyal hanya di titik tertentu.";
        return "Sinyal tersedia di sebagian besar jalur.";
      case "tingkatInsiden":
        if (value <= 3) return "Sering terjadi insiden, risiko tinggi.";
        if (value <= 7) return "Risiko insiden sedang, perlu waspada.";
        return "Risiko insiden sangat rendah/jarang.";
      default:
        return "";
    }
  }

  return (
    <div className="halaman-detail-jalur">
      <div className="detail-header">
        <img
          src={createImageSrc(urlThumbnail)}
          alt={namaJalur}
          className="detail-image"
          onError={(e) => (e.target.src = DEFAULT_FALLBACK_IMAGE)}
        />
        <div className="detail-title-info">
          <h1>{namaJalur}</h1>
          <div className="gunung-info-row">
            <span className="gunung-label">Gunung:</span>
            {namaGunung && data.id_gunung ? (
              <Link
                to={`/gunung/${data.id_gunung}`}
                className="gunung-value gunung-link"
              >
                {namaGunung}
              </Link>
            ) : (
              <span className="gunung-value">{namaGunung}</span>
            )}
          </div>
          <div className="jalur-meta-info">
            <div className="jalur-meta-row">
              <span className="jalur-meta-label">Ketinggian:</span>{" "}
              <span className="jalur-meta-value">
                {ketinggian ? `${ketinggian} mdpl` : "-"}
              </span>
            </div>
            <div className="jalur-meta-row">
              <span className="jalur-meta-label">Lokasi Pintu Masuk:</span>{" "}
              <span className="jalur-meta-value">{lokasiPintuMasuk}</span>
            </div>
            <div className="jalur-meta-row">
              <span className="jalur-meta-label">Status Jalur:</span>{" "}
              <span className="jalur-meta-value">{statusJalur}</span>
            </div>
            <div className="jalur-meta-row">
              <span className="jalur-meta-label">Estimasi Waktu:</span>{" "}
              <span className="jalur-meta-value">
                {estimasiWaktu ? `${estimasiWaktu} jam` : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="detail-info-main detail-info-main-center">
        <div className="detail-info-table-wrapper">
          <table className="detail-info-table detail-info-table-basic">
            <tbody>
              <tr className="field-row">
                <td className="label">Kesulitan</td>
                <td className="value">
                  <span className="skala-badge">{kesulitanSkala}</span>
                  <span className="skala-desc">
                    {getDeskripsi("kesulitanSkala", kesulitanSkala)}
                  </span>
                </td>
              </tr>
              <tr className="field-row">
                <td className="label">Keamanan</td>
                <td className="value">
                  <span className="skala-badge">{keamananSkala}</span>
                  <span className="skala-desc">
                    {getDeskripsi("keamananSkala", keamananSkala)}
                  </span>
                </td>
              </tr>
              <tr className="field-row">
                <td className="label">Kualitas Fasilitas</td>
                <td className="value">
                  <span className="skala-badge">{kualitasFasilitas}</span>
                  <span className="skala-desc">
                    {getDeskripsi("kualitasFasilitas", kualitasFasilitas)}
                  </span>
                </td>
              </tr>
              <tr className="field-row">
                <td className="label">Kualitas Area Kemah</td>
                <td className="value">
                  <span className="skala-badge">{kualitasKemah}</span>
                  <span className="skala-desc">
                    {getDeskripsi("kualitasKemah", kualitasKemah)}
                  </span>
                </td>
              </tr>
              <tr className="field-row">
                <td className="label">Keindahan Pemandangan</td>
                <td className="value">
                  <span className="skala-badge">{keindahanPemandangan}</span>
                  <span className="skala-desc">
                    {getDeskripsi("keindahanPemandangan", keindahanPemandangan)}
                  </span>
                </td>
              </tr>
              <tr className="field-row">
                <td className="label">Variasi Lanskap</td>
                <td className="value">
                  <span className="skala-badge">{variasiLanskap}</span>
                  <span className="skala-desc">
                    {getDeskripsi("variasiLanskap", variasiLanskap)}
                  </span>
                </td>
              </tr>
              <tr className="field-row">
                <td className="label">Perlindungan Angin</td>
                <td className="value">
                  <span className="skala-badge">{perlindunganAngin}</span>
                  <span className="skala-desc">
                    {getDeskripsi("perlindunganAngin", perlindunganAngin)}
                  </span>
                </td>
              </tr>
              <tr className="field-row">
                <td className="label">Ketersediaan Air</td>
                <td className="value">
                  <span className="skala-badge">{ketersediaanAir}</span>
                  <span className="skala-desc">
                    {getDeskripsi("ketersediaanAir", ketersediaanAir)}
                  </span>
                </td>
              </tr>
              <tr className="field-row">
                <td className="label">Jaringan Komunikasi</td>
                <td className="value">
                  <span className="skala-badge">{jaringanKomunikasi}</span>
                  <span className="skala-desc">
                    {getDeskripsi("jaringanKomunikasi", jaringanKomunikasi)}
                  </span>
                </td>
              </tr>
              <tr className="field-row">
                <td className="label">Tingkat Insiden</td>
                <td className="value">
                  <span className="skala-badge">{tingkatInsiden}</span>
                  <span className="skala-desc">
                    {getDeskripsi("tingkatInsiden", tingkatInsiden)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="detail-description">
        <h3>Deskripsi Jalur</h3>
        <p>{deskripsi}</p>
      </div>
      <Link to="/explore" className="back-link">
        &larr; Kembali ke Explore
      </Link>
    </div>
  );
}
