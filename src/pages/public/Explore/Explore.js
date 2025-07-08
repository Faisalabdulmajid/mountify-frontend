// src/pages/public/Explore/Explore.js

/*
============================================
MOUNTIFY - HALAMAN EXPLORE
Cara Penggunaan & Info Kriteria Rekomendasi
============================================

Fitur Utama:
- Temukan rekomendasi gunung atau jalur pendakian berdasarkan preferensi Anda.
- Tersedia mode input slider (kontrol) dan dropdown (pilihan deskriptif).
- Fitur pencarian cepat (quick search) dan asisten virtual (chatbot).

Cara Penggunaan:
1. Pilih mode pencarian: "jalur" (jalur pendakian) atau "gunung" (rekomendasi gunung terbaik).
2. Atur preferensi menggunakan slider atau dropdown (klik "Mode Input").
   - Slider: geser untuk memilih nilai numerik.
   - Dropdown: pilih deskripsi kualitas/kriteria.
3. Isi filter sesuai kebutuhan, misal: tingkat kesulitan maksimal, keamanan minimal, estimasi waktu, ketinggian, kualitas fasilitas, air, variasi lanskap, perlindungan angin, jaringan komunikasi, tingkat insiden, dsb.
4. Klik "Cari Rekomendasi" untuk menampilkan hasil.
5. Gunakan pencarian cepat (quick search) untuk mencari nama gunung/jalur secara langsung.
6. Untuk bantuan interaktif, klik ikon chatbot dan ajukan pertanyaan secara natural.

Info Kriteria & Skala Filter:
- max_kesulitan_skala: 1 (sangat mudah) s/d 10 (ekstrem)
- min_keamanan_skala: 1 (sangat berisiko) s/d 10 (maksimal aman)
- max_estimasi_waktu_jam: estimasi waktu tempuh (jam)
- max_ketinggian_mdpl: ketinggian puncak (meter)
- min_kualitas_fasilitas_skala: 1 (sangat minim) s/d 10 (mewah)
- min_kualitas_kemah_skala: 1 (sangat terbatas) s/d 10 (eksklusif)
- min_keindahan_pemandangan_skala: 1 (kurang menarik) s/d 10 (luar biasa)
- min_ketersediaan_air: 1 (sangat langka) s/d 10 (berlimpah ruah)
- min_variasi_lanskap: 1 (sangat monoton) s/d 10 (luar biasa beragam)
- min_perlindungan_angin: 1 (sangat terekspos) s/d 10 (ideal terlindungi)
- min_jaringan_komunikasi: 1 (tidak ada sinyal) s/d 10 (sinyal optimal)
- min_tingkat_keamanan_insiden: 1 (insiden sangat sering) s/d 10 (maksimal aman)

Semakin tinggi nilai minimum pada filter, semakin ketat hasil rekomendasi.
Setiap kriteria dapat diatur sesuai kebutuhan pendaki (pemula, menengah, ahli).

Untuk info detail skala, lihat tooltip atau label pada masing-masing filter di UI.
*/

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./Explore_Simple.css";

// --- Constants ---
const API_BASE_URL = "http://localhost:5000/api";
const DEFAULT_FALLBACK_IMAGE =
  "https://placehold.co/600x400/27ae60/FFFFFF?text=Mountify";

const INITIAL_PREFERENCES = {
  id_gunung: "",
  max_kesulitan_skala: 7,
  min_keamanan_skala: 6,
  max_estimasi_waktu_jam: 48,
  max_ketinggian_mdpl: 5000,
  min_kualitas_fasilitas_skala: 5,
  min_kualitas_kemah_skala: 5,
  min_keindahan_pemandangan_skala: 6,
  min_ketersediaan_air: 5,
  min_variasi_lanskap: 5,
  min_perlindungan_angin: 5,
  min_jaringan_komunikasi: 3,
  min_tingkat_keamanan_insiden: 5,
  ketinggian: "semua",
  lokasi: "semua",
  inputType: "slider", // "slider" atau "dropdown"
  // Simple search feature
  quickSearch: "",
};

const INITIAL_CHATBOT_MESSAGE = {
  id: uuidv4(),
  text: "Halo! Saya Asisten Virtual Mountify. Ada yang bisa saya bantu? Coba ketik 'cari rekomendasi gunung'.",
  sender: "bot",
  timestamp: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};

// --- Utility Functions ---
const createImageSrc = (thumbnail) =>
  thumbnail
    ? `${API_BASE_URL.replace("/api", "")}${thumbnail}`
    : DEFAULT_FALLBACK_IMAGE;

const formatTimestamp = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const createMessage = (text, sender, payload = null) => ({
  id: uuidv4(),
  text,
  sender,
  payload,
  timestamp: formatTimestamp(),
});

const scrollToElement = (ref, delay = 100) => {
  setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth" }), delay);
};

// Scale description utilities based on National & International Standards

// Difficulty scaling based on Indonesian Grade 1-5 & YDS standards
const getDifficultyDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Mudah (1)";
    case 2:
      return "Sangat Mudah+ (2)";
    case 3:
      return "Mudah (3)";
    case 4:
      return "Mudah+ (4)";
    case 5:
      return "Sedang (5)";
    case 6:
      return "Sedang+ (6)";
    case 7:
      return "Sulit (7)";
    case 8:
      return "Sulit+ (8)";
    case 9:
      return "Sangat Sulit (9)";
    case 10:
      return "Ekstrem (10)";
    default:
      return `Level ${v}`;
  }
};

// Safety scaling based on BASARNAS incident data standards
const getSafetyDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Berisiko (1)";
    case 2:
      return "Berisiko Tinggi (2)";
    case 3:
      return "Berisiko Sedang (3)";
    case 4:
      return "Berisiko Rendah (4)";
    case 5:
      return "Cukup Aman (5)";
    case 6:
      return "Aman (6)";
    case 7:
      return "Aman+ (7)";
    case 8:
      return "Sangat Aman (8)";
    case 9:
      return "Sangat Aman+ (9)";
    case 10:
      return "Maksimal Aman (10)";
    default:
      return `Level ${v}`;
  }
};

// Facility quality based on Indonesian mountain basecamp standards
const getFacilityDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Minim (1)";
    case 2:
      return "Minim (2)";
    case 3:
      return "Terbatas (3)";
    case 4:
      return "Cukup (4)";
    case 5:
      return "Standar (5)";
    case 6:
      return "Baik (6)";
    case 7:
      return "Lengkap (7)";
    case 8:
      return "Sangat Lengkap (8)";
    case 9:
      return "Premium (9)";
    case 10:
      return "Mewah (10)";
    default:
      return `Level ${v}`;
  }
};

// Camp quality based on Indonesian camping area standards
const getCampQualityDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Terbatas (1)";
    case 2:
      return "Terbatas (2)";
    case 3:
      return "Kurang Nyaman (3)";
    case 4:
      return "Cukup Nyaman (4)";
    case 5:
      return "Nyaman (5)";
    case 6:
      return "Baik (6)";
    case 7:
      return "Sangat Baik (7)";
    case 8:
      return "Istimewa (8)";
    case 9:
      return "Premium (9)";
    case 10:
      return "Ekslusif (10)";
    default:
      return `Level ${v}`;
  }
};

// Scenery quality based on visual assessment standards
const getSceneryDescription = (v) => {
  switch (v) {
    case 1:
      return "Kurang Menarik (1)";
    case 2:
      return "Biasa Saja (2)";
    case 3:
      return "Cukup Menarik (3)";
    case 4:
      return "Menarik (4)";
    case 5:
      return "Indah (5)";
    case 6:
      return "Sangat Indah (6)";
    case 7:
      return "Menakjubkan (7)";
    case 8:
      return "Spektakuler (8)";
    case 9:
      return "Istimewa (9)";
    case 10:
      return "Luar Biasa (10)";
    default:
      return `Level ${v}`;
  }
};

// Water availability based on logistic management standards
const getWaterAvailabilityDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Langka (1)";
    case 2:
      return "Langka (2)";
    case 3:
      return "Terbatas (3)";
    case 4:
      return "Kurang (4)";
    case 5:
      return "Cukup (5)";
    case 6:
      return "Tersedia (6)";
    case 7:
      return "Banyak (7)";
    case 8:
      return "Melimpah (8)";
    case 9:
      return "Sangat Melimpah (9)";
    case 10:
      return "Berlimpah Ruah (10)";
    default:
      return `Level ${v}`;
  }
};

// Landscape variation based on ecosystem diversity
const getLandscapeVariationDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Monoton (1)";
    case 2:
      return "Monoton (2)";
    case 3:
      return "Kurang Bervariasi (3)";
    case 4:
      return "Cukup Bervariasi (4)";
    case 5:
      return "Bervariasi (5)";
    case 6:
      return "Sangat Bervariasi (6)";
    case 7:
      return "Beragam (7)";
    case 8:
      return "Sangat Beragam (8)";
    case 9:
      return "Spektakuler (9)";
    case 10:
      return "Luar Biasa Beragam (10)";
    default:
      return `Level ${v}`;
  }
};

// Wind protection based on camping comfort standards
const getWindProtectionDescription = (v) => {
  switch (v) {
    case 1:
      return "Sangat Terekspos (1)";
    case 2:
      return "Terekspos (2)";
    case 3:
      return "Kurang Terlindungi (3)";
    case 4:
      return "Cukup Terlindungi (4)";
    case 5:
      return "Terlindungi (5)";
    case 6:
      return "Baik Terlindungi (6)";
    case 7:
      return "Sangat Terlindungi (7)";
    case 8:
      return "Maksimal Terlindungi (8)";
    case 9:
      return "Sempurna Terlindungi (9)";
    case 10:
      return "Ideal Terlindungi (10)";
    default:
      return `Level ${v}`;
  }
};

// Communication network based on cellular coverage
const getCommunicationDescription = (v) => {
  switch (v) {
    case 1:
      return "Tidak Ada Sinyal (1)";
    case 2:
      return "Sinyal Sangat Lemah (2)";
    case 3:
      return "Sinyal Lemah (3)";
    case 4:
      return "Sinyal Terbatas (4)";
    case 5:
      return "Sinyal Cukup (5)";
    case 6:
      return "Sinyal Baik (6)";
    case 7:
      return "Sinyal Sangat Baik (7)";
    case 8:
      return "Sinyal Kuat (8)";
    case 9:
      return "Sinyal Sangat Kuat (9)";
    case 10:
      return "Sinyal Optimal (10)";
    default:
      return `Level ${v}`;
  }
};

// Incident safety level (higher score = safer/fewer incidents)
const getIncidentSafetyDescription = (v) => {
  switch (v) {
    case 1:
      return "Insiden Sangat Sering (1)";
    case 2:
      return "Insiden Sering (2)";
    case 3:
      return "Insiden Cukup Sering (3)";
    case 4:
      return "Insiden Kadang (4)";
    case 5:
      return "Insiden Sedang (5)";
    case 6:
      return "Insiden Jarang (6)";
    case 7:
      return "Insiden Sangat Jarang (7)";
    case 8:
      return "Sangat Aman (8)";
    case 9:
      return "Amat Sangat Aman (9)";
    case 10:
      return "Maksimal Aman (10)";
    default:
      return `Level ${v}`;
  }
};

// Altitude description for max_ketinggian_mdpl
const getAltitudeDescription = (v) => {
  if (v <= 1500) return "Bukit/Pegunungan Rendah";
  if (v <= 2500) return "Gunung Sedang";
  if (v <= 3500) return "Gunung Tinggi";
  if (v <= 4500) return "Gunung Sangat Tinggi";
  return "Puncak Ekstrem";
};

const getDifficultyClass = (difficulty) => {
  if (!difficulty) return "difficulty-default";
  if (difficulty <= 4) return "difficulty-pemula";
  if (difficulty <= 7) return "difficulty-menengah";
  return "difficulty-ahli";
};

const getDifficultyText = (difficulty) => {
  if (!difficulty) return "N/A";
  if (difficulty <= 4) return "Pemula";
  if (difficulty <= 7) return "Menengah";
  return "Ahli";
};

// --- Card Components ---
const CardImage = ({ src, alt, onError }) => (
  <img src={src} alt={alt} className="card-image" onError={onError} />
);

const DifficultyBadge = ({ difficulty }) => {
  if (!difficulty) return null;

  return (
    <span className={`difficulty-badge ${getDifficultyClass(difficulty)}`}>
      {getDifficultyText(difficulty)}
    </span>
  );
};

const ScoreBadge = ({ score, category, label = "Skor" }) => {
  if (!score) return null;

  const getScoreClass = (score) => {
    if (score >= 80) return "score-excellent";
    if (score >= 65) return "score-good";
    if (score >= 50) return "score-fair";
    if (score >= 35) return "score-poor";
    return "score-bad";
  };

  return (
    <div className="score-badge-container">
      <span className={`score-badge ${getScoreClass(score)}`}>
        {label}: {score.toFixed(1)}
      </span>
      {category && (
        <span className={`category-badge ${getScoreClass(score)}`}>
          {category}
        </span>
      )}
    </div>
  );
};

function TrailCard({ trail, index }) {
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/600x400/2c3e50/FFFFFF?text=Error";
  };

  // Fallbacks untuk field yang mungkin berbeda nama
  const namaJalur =
    trail.nama_jalur ||
    trail.nama ||
    trail.namaJalur ||
    trail.nama_jalur_pendakian;
  const namaGunung = trail.nama_gunung || trail.gunung || trail.namaGunung;
  const idJalur = trail.id_jalur || trail.id || trail.idJalur;
  const ketinggian =
    trail.ketinggian_puncak_mdpl || trail.ketinggian || trail.ketinggian_mdpl;
  const estimasiWaktu =
    trail.estimasi_waktu_jam || trail.durasi || trail.estimasiWaktu;
  const keamananSkala = trail.keamanan_skala || trail.safety || trail.keamanan;

  return (
    <div
      className="result-card animate-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardImage
        src={createImageSrc(trail.url_thumbnail)}
        alt={namaJalur}
        onError={handleImageError}
      />
      <div className="card-content">
        <div className="badge-container">
          <DifficultyBadge difficulty={trail.kesulitan_skala} />
          <ScoreBadge
            score={trail.skor_rekomendasi}
            category={trail.kategori_rekomendasi}
          />
        </div>

        <h3 className="card-title">{namaJalur}</h3>
        <p className="card-subtitle">{namaGunung}</p>

        {ketinggian && (
          <p className="card-info">{ketinggian.toLocaleString()} mdpl</p>
        )}

        {estimasiWaktu && <p className="card-info">⏱️ {estimasiWaktu} jam</p>}

        {keamananSkala && (
          <p className="card-info">
            🛡️ Keamanan: {getSafetyDescription(keamananSkala)}
          </p>
        )}

        <Link to={`/jalur/${idJalur}`} className="details-button">
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}

function MountainCard({ mountain, index }) {
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = "https://placehold.co/600x400/2c3e50/FFFFFF?text=Error";
  };

  // Fallbacks untuk field yang mungkin berbeda nama
  const namaGunung =
    mountain.nama_gunung || mountain.nama || mountain.namaGunung;
  const idGunung = mountain.id_gunung || mountain.id || mountain.idGunung;
  const lokasi =
    mountain.lokasi_administratif || mountain.lokasi || mountain.lokasiGunung;
  const ketinggian =
    mountain.ketinggian ||
    mountain.ketinggian_puncak_mdpl ||
    mountain.ketinggian_mdpl;
  const jalurTerbaik = mountain.jalur_terbaik || mountain.jalurTerbaik;
  const jumlahJalur = mountain.jumlah_jalur || mountain.jumlahJalur;
  const skorTertinggi =
    mountain.skor_tertinggi || mountain.skor || mountain.skorTertinggi;

  return (
    <div
      className="result-card animate-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardImage
        src={createImageSrc(mountain.url_thumbnail)}
        alt={namaGunung}
        onError={handleImageError}
      />
      <div className="card-content">
        <div className="badge-container">
          <ScoreBadge
            score={skorTertinggi}
            category={mountain.kategori_rekomendasi}
            label="Skor Terbaik"
          />
        </div>

        <h3 className="card-title">{namaGunung}</h3>
        <p className="card-subtitle">{lokasi}</p>

        {jalurTerbaik && (
          <p className="card-info">🥾 Jalur Terbaik: {jalurTerbaik}</p>
        )}

        {typeof jumlahJalur !== "undefined" && (
          <p className="card-info">📍 {jumlahJalur} jalur tersedia</p>
        )}

        {ketinggian && (
          <p className="card-info">⛰️ {ketinggian.toLocaleString()} mdpl</p>
        )}

        <Link to={`/gunung/${idGunung}`} className="details-button">
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}

// --- Chatbot Components ---
const ChatbotMessage = ({ message, botAvatar, userAvatar, isBot }) => (
  <div className={`message-row ${message.sender}`}>
    {isBot && (
      <img src={botAvatar} alt="bot avatar" className="message-avatar" />
    )}
    <div className="message-content">
      {message.text && (
        <p className={`message-bubble ${message.sender}`}>{message.text}</p>
      )}
      {message.payload && (
        <div className="rich-response-grid">
          {message.payload.map((item, index) => (
            <TrailCard
              key={item.id_jalur || index}
              trail={item}
              index={index}
            />
          ))}
        </div>
      )}
      <div className={`message-timestamp-container ${message.sender}`}>
        <span className="message-timestamp">{message.timestamp}</span>
      </div>
    </div>
    {!isBot && (
      <img src={userAvatar} alt="user avatar" className="message-avatar" />
    )}
  </div>
);

const TypingIndicator = ({ botAvatar }) => (
  <div className="message-row bot">
    <img src={botAvatar} alt="bot avatar" className="message-avatar" />
    <div className="message-bubble">
      <div className="typing-indicator">
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
);

const ChatbotHeader = ({ onClose }) => (
  <div className="chatbot-header">
    Asisten Virtual Mountify
    <button className="chatbot-close-button" onClick={onClose}>
      &times;
    </button>
  </div>
);

const ChatbotInput = ({ inputValue, setInputValue, onSubmit }) => (
  <form className="chatbot-input-form" onSubmit={onSubmit}>
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Ketik pesan Anda..."
    />
    <button type="submit">Kirim</button>
  </form>
);

// Generate unique dropdown options for scale inputs
const generateUniqueScaleOptions = (min = 1, max = 10, getDescription) => {
  const uniqueOptions = new Map();

  // Collect all unique descriptions with their representative values
  for (let i = min; i <= max; i++) {
    const description = getDescription(i);
    // Always use the exact value as key to ensure uniqueness
    const key = `${description}_${i}`;
    if (!uniqueOptions.has(key)) {
      uniqueOptions.set(key, {
        value: i,
        label: description,
        originalValue: i,
      });
    }
  }

  // Convert to array format, sorted by original value
  return Array.from(uniqueOptions.values())
    .sort((a, b) => a.originalValue - b.originalValue)
    .map((item) => ({
      value: item.value,
      label: item.label,
    }));
};

// Generate time duration options
const generateTimeOptions = () => {
  const options = [
    { value: 6, label: "6 jam" },
    { value: 12, label: "12 jam" },
    { value: 18, label: "18 jam" },
    { value: 24, label: "1 hari" },
    { value: 36, label: "1.5 hari" },
    { value: 48, label: "2 hari" },
    { value: 72, label: "3 hari" },
    { value: 96, label: "4 hari" },
    { value: 120, label: "5 hari" },
    { value: 144, label: "6 hari" },
    { value: 168, label: "1 minggu" },
  ];
  return options;
};

// Scale Input Component - renders either slider or dropdown
const ScaleInput = ({
  id,
  name,
  value,
  onChange,
  min = 1,
  max = 10,
  inputType,
  getDescription,
  rangeLabels = { min: "Rendah", max: "Tinggi" },
}) => {
  if (inputType === "dropdown") {
    const options = generateUniqueScaleOptions(min, max, getDescription);
    return (
      <select
        id={id}
        name={name}
        className="scale-dropdown"
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // Default to slider
  return (
    <>
      <input
        type="range"
        id={id}
        name={name}
        className="range-input"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step="1"
      />
      <div className="range-labels">
        <span>{rangeLabels.min}</span>
        <span>{rangeLabels.max}</span>
      </div>
    </>
  );
};

// Time Input Component - renders either number input or dropdown
const TimeInput = ({ id, name, value, onChange, inputType }) => {
  if (inputType === "dropdown") {
    const options = generateTimeOptions();
    return (
      <select
        id={id}
        name={name}
        className="time-dropdown"
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // Default to number input
  return (
    <div className="time-input-container">
      <input
        type="number"
        id={id}
        name={name}
        className="number-input"
        value={value}
        onChange={onChange}
        min="1"
        max="168"
      />
      <span className="unit">Jam</span>
    </div>
  );
};

// Input Type Switcher Component
const InputTypeSwitcher = ({ inputType, onInputTypeChange }) => (
  <div className="input-type-switcher">
    <span className="switcher-label">Mode Input:</span>
    <div className="switcher-buttons">
      <button
        type="button"
        className={`switcher-button ${inputType === "slider" ? "active" : ""}`}
        onClick={() => onInputTypeChange("slider")}
      >
        Kontrol
      </button>
      <button
        type="button"
        className={`switcher-button ${
          inputType === "dropdown" ? "active" : ""
        }`}
        onClick={() => onInputTypeChange("dropdown")}
      >
        Pilihan
      </button>
    </div>
  </div>
);

// --- API Functions ---
const fetchMountainsList = async () => {
  try {
    console.log("🏔️ Fetching mountains list from:", `${API_BASE_URL}/gunung`);

    const response = await fetch(`${API_BASE_URL}/gunung`);

    if (!response.ok) {
      throw new Error(
        `HTTP Error ${response.status}: Gagal memuat daftar gunung`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        "Server mengembalikan response bukan JSON untuk daftar gunung"
      );
    }

    const data = await response.json();
    console.log("✅ Mountains list received:", data.length, "items");
    return data;
  } catch (error) {
    console.error("❌ fetchMountainsList error:", error);
    if (error.message.includes("fetch")) {
      throw new Error(
        "Tidak dapat terhubung ke server untuk memuat daftar gunung"
      );
    }
    throw error;
  }
};

const fetchRecommendations = async (preferences, searchMode) => {
  const endpoint =
    searchMode === "jalur"
      ? `${API_BASE_URL}/rekomendasi/jalur`
      : `${API_BASE_URL}/rekomendasi/gunung`;

  // Map frontend preferences to backend parameters
  const backendPreferences = {
    max_kesulitan_skala: preferences.max_kesulitan_skala,
    min_keamanan_skala: preferences.min_keamanan_skala,
    max_estimasi_waktu_jam: preferences.max_estimasi_waktu_jam,
    max_ketinggian_mdpl: preferences.max_ketinggian_mdpl,
    min_keindahan_pemandangan_skala:
      preferences.min_keindahan_pemandangan_skala,
    min_ketersediaan_air: preferences.min_ketersediaan_air,
    min_kualitas_fasilitas_skala: preferences.min_kualitas_fasilitas_skala,
    min_kualitas_kemah_skala: preferences.min_kualitas_kemah_skala,
    min_variasi_lanskap: preferences.min_variasi_lanskap,
    min_perlindungan_angin: preferences.min_perlindungan_angin,
    min_jaringan_komunikasi: preferences.min_jaringan_komunikasi,
    min_tingkat_keamanan_insiden: preferences.min_tingkat_keamanan_insiden,
    id_gunung: preferences.id_gunung || undefined,
    search_term: preferences.quickSearch || undefined,
  };

  // Remove undefined values
  Object.keys(backendPreferences).forEach((key) => {
    if (
      backendPreferences[key] === undefined ||
      backendPreferences[key] === ""
    ) {
      delete backendPreferences[key];
    }
  });

  try {
    console.log("🔍 Fetching recommendations from:", endpoint);
    console.log("📝 Request data:", backendPreferences);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(backendPreferences),
    });

    console.log("📡 Response status:", response.status);
    console.log("📡 Response URL:", response.url);

    // Check if response is HTML (error page)
    const contentType = response.headers.get("content-type");
    console.log("📄 Content-Type:", contentType);

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP Error ${response.status}`;

      try {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          const errorText = await response.text();
          console.error("❌ HTML Error Response:", errorText.substring(0, 200));

          // Check if it's a 404 or server error
          if (response.status === 404) {
            errorMessage = `Endpoint tidak ditemukan: ${endpoint}. Pastikan backend sudah berjalan.`;
          } else if (response.status >= 500) {
            errorMessage = `Server error (${response.status}). Cek console backend untuk detail.`;
          } else {
            errorMessage = `Request gagal (${response.status}). Response bukan JSON.`;
          }
        }
      } catch (parseError) {
        console.error("❌ Error parsing response:", parseError);
        errorMessage = `Request gagal (${response.status}). Cannot parse response.`;
      }

      throw new Error(errorMessage);
    }

    // Validate content type before parsing JSON
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text();
      console.error(
        "❌ Unexpected response type:",
        responseText.substring(0, 200)
      );
      throw new Error(
        `Server mengembalikan HTML bukan JSON. Pastikan endpoint backend benar: ${endpoint}`
      );
    }

    const data = await response.json();
    console.log("✅ Recommendations received:", data);
    return data;
  } catch (error) {
    console.error("❌ fetchRecommendations error:", error);

    // Provide specific error messages for common issues
    if (error.message.includes("fetch")) {
      throw new Error(
        "Tidak dapat terhubung ke server. Pastikan backend sudah berjalan di http://localhost:5000"
      );
    }

    throw error;
  }
};

const fetchAllData = async (searchMode) => {
  const endpoint =
    searchMode === "jalur" ? `${API_BASE_URL}/jalur` : `${API_BASE_URL}/gunung`;

  try {
    console.log("📊 Fetching all data from:", endpoint);

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(
        `HTTP Error ${response.status}: Gagal memuat daftar ${searchMode}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        `Server mengembalikan response bukan JSON untuk daftar ${searchMode}`
      );
    }

    const data = await response.json();
    console.log(
      `✅ All ${searchMode} data received:`,
      Array.isArray(data) ? data.length : "object",
      "items"
    );
    return data;
  } catch (error) {
    console.error("❌ fetchAllData error:", error);
    if (error.message.includes("fetch")) {
      throw new Error(
        `Tidak dapat terhubung ke server untuk memuat daftar ${searchMode}`
      );
    }
    throw error;
  }
};

const sendChatMessage = async (inputValue, sessionId) => {
  const response = await fetch(`${API_BASE_URL}/dialogflow-proxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: inputValue, sessionId }),
  });

  if (!response.ok) {
    throw new Error("Gagal berkomunikasi dengan asisten.");
  }

  return response.json();
};

const processChatbotResponse = (data) => {
  return (data.fulfillmentMessages || [])
    .map((msg) => {
      if (msg.text && msg.text.text[0]) {
        return createMessage(msg.text.text[0], "bot");
      }

      if (
        msg.payload &&
        msg.payload.fields?.type?.stringValue === "recommendation_card"
      ) {
        const recommendationData = msg.payload.fields.data.listValue.values.map(
          (val) => {
            const item = {};
            Object.keys(val.structValue.fields).forEach((key) => {
              const field = val.structValue.fields[key];
              item[key] = field.stringValue || field.numberValue;
            });
            return item;
          }
        );

        return createMessage(null, "bot", recommendationData);
      }

      return null;
    })
    .filter(Boolean);
};

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(uuidv4());
  const messagesEndRef = useRef(null);

  const botAvatarUrl =
    "https://cdn-icons-png.flaticon.com/512/8649/8649595.png";
  const userAvatarUrl =
    "https://cdn-icons-png.flaticon.com/512/1144/1144760.png";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  useEffect(() => {
    setMessages([INITIAL_CHATBOT_MESSAGE]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;

    const userMessage = createMessage(inputValue, "user");
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const data = await sendChatMessage(inputValue, sessionId);
      const botResponses = processChatbotResponse(data);
      setMessages((prev) => [...prev, ...botResponses]);
    } catch (error) {
      const errorMessage = createMessage(
        "Maaf, terjadi gangguan. Coba beberapa saat lagi.",
        "bot"
      );
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      <ChatbotHeader onClose={onClose} />

      <div className="chatbot-messages">
        {messages.map((msg) => (
          <ChatbotMessage
            key={msg.id}
            message={msg}
            botAvatar={botAvatarUrl}
            userAvatar={userAvatarUrl}
            isBot={msg.sender === "bot"}
          />
        ))}

        {isTyping && <TypingIndicator botAvatar={botAvatarUrl} />}
        <div ref={messagesEndRef} />
      </div>

      <ChatbotInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSubmit={handleSendMessage}
      />
    </div>
  );
};

const ChatbotWelcome = ({ onStartChat }) => {
  return (
    <div className="chatbot-welcome-container">
      <div className="welcome-content">
        <img
          src="https://cdn-icons-png.flaticon.com/512/8649/8649595.png"
          alt="Asisten Virtual"
          className="chatbot-welcome-icon"
        />
        <h2 className="chatbot-welcome-title">Asisten Virtual Mountify</h2>
        <p className="chatbot-welcome-description">
          Dapatkan rekomendasi gunung dengan percakapan yang natural dan
          interaktif
        </p>
        <button className="chatbot-start-button" onClick={onStartChat}>
          Mulai Percakapan
        </button>
      </div>
    </div>
  );
};

// --- Loading and Error Components ---
const SpinnerIcon = () => (
  <svg className="spinner" viewBox="0 0 50 50">
    <circle
      className="path"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      strokeWidth="5"
    ></circle>
  </svg>
);

const NoResultsIllustration = () => (
  <svg
    className="no-results-illustration"
    width="120"
    height="120"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.5 17.5L22 22"
      stroke="#bdc3c7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 11C20 15.9706 15.9706 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11Z"
      stroke="#bdc3c7"
      strokeWidth="2"
    />
    <path
      d="M13.2963 8.70371C12.9361 8.34351 12.4335 8.14844 11.9082 8.14844C11.3829 8.14844 10.8803 8.34351 10.5201 8.70371C10.1599 9.06391 9.96484 9.56651 9.96484 10.0918"
      stroke="#bdc3c7"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M10.5 15.5C10.5 15.5 11.25 14.5 12 14.5C12.75 14.5 13.5 15.5 13.5 15.5"
      stroke="#bdc3c7"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// --- Error Display Component ---
const ErrorDisplay = ({ error, onRetry, context = "operasi" }) => {
  const getErrorIcon = () => {
    if (error.includes("terhubung") || error.includes("fetch")) {
      return "🔌"; // Connection error
    } else if (error.includes("404") || error.includes("tidak ditemukan")) {
      return "🔍"; // Not found
    } else if (error.includes("500") || error.includes("server error")) {
      return "⚠️"; // Server error
    } else if (error.includes("JSON") || error.includes("HTML")) {
      return "📄"; // Format error
    }
    return "❌"; // Generic error
  };

  const getErrorHelp = () => {
    if (error.includes("terhubung") || error.includes("fetch")) {
      return "Pastikan backend server sudah berjalan di http://localhost:5000";
    } else if (error.includes("404") || error.includes("tidak ditemukan")) {
      return "Endpoint API mungkin belum tersedia atau URL salah";
    } else if (error.includes("500") || error.includes("server error")) {
      return "Cek console backend untuk error detail";
    } else if (error.includes("JSON") || error.includes("HTML")) {
      return "Server mengembalikan format response yang tidak sesuai";
    }
    return "Coba refresh halaman atau hubungi administrator";
  };

  return (
    <div className="error-display">
      <div className="error-icon">{getErrorIcon()}</div>
      <h3>Gagal memuat {context}</h3>
      <p className="error-message">{error}</p>
      <p className="error-help">{getErrorHelp()}</p>
      {onRetry && (
        <button
          className="retry-button"
          onClick={onRetry}
          style={{
            background: "#e74c3c",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "12px",
          }}
        >
          🔄 Coba Lagi
        </button>
      )}
    </div>
  );
};

// --- Debug Helper ---
const debugAPIConnection = async () => {
  console.log("🔧 Debug: Testing API Connection...");

  // Test basic server connection
  try {
    const response = await fetch("http://localhost:5000");
    console.log("✅ Server responds:", response.status);
  } catch (error) {
    console.error("❌ Server not reachable:", error.message);
    return false;
  }

  // Test API endpoints
  const endpoints = [
    "/api/gunung",
    "/api/jalur",
    "/api/rekomendasi-jalur",
    "/api/rekomendasi-gunung",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: endpoint.includes("rekomendasi") ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        body: endpoint.includes("rekomendasi")
          ? JSON.stringify({
              max_kesulitan_skala: 5,
              min_keamanan_skala: 5,
            })
          : undefined,
      });

      console.log(
        `${response.ok ? "✅" : "❌"} ${endpoint}: ${response.status}`
      );

      if (!response.ok) {
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint}: ${error.message}`);
    }
  }

  return true;
};

// Call debug function when in development
if (process.env.NODE_ENV === "development") {
  window.debugExploreAPI = debugAPIConnection;
  console.log("🔧 Debug function available: window.debugExploreAPI()");
}

// --- Custom Hooks ---
const useMountainsList = () => {
  const [mountainsList, setMountainsList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMountainsList = async () => {
      try {
        const data = await fetchMountainsList();
        setMountainsList(data);
      } catch (err) {
        console.error("Error fetching mountains list:", err);
        setError("Gagal memuat daftar gunung. Silakan refresh halaman.");
      }
    };

    loadMountainsList();
  }, []);

  return { mountainsList, error };
};

const useExploreHandlers = (
  preferences,
  setPreferences,
  setResults,
  setHasSearched,
  setIsCalculating,
  setError,
  resultsRef,
  searchMode
) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    const isDropdown = [
      "id_gunung",
      "ketinggian",
      "lokasi",
      "inputType",
      "provinsi",
      "musim",
      "tipe_pendakian",
    ].includes(name);
    const processedValue = isDropdown ? value : Number(value);
    setPreferences((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleInputTypeChange = (newInputType) => {
    setPreferences((prev) => ({ ...prev, inputType: newInputType }));
  };

  const handleReset = () => {
    setPreferences(INITIAL_PREFERENCES);
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    setIsCalculating(true);
    setHasSearched(true);
    setError(null);
    setResults([]);

    try {
      const data = await fetchRecommendations(preferences, searchMode);

      // Extract recommendations from fuzzy engine response
      let recommendations = [];
      let metadata = null;

      if (data.rekomendasi_jalur && searchMode === "jalur") {
        recommendations = data.rekomendasi_jalur;
        metadata = data.metadata;
      } else if (data.rekomendasi_gunung && searchMode === "gunung") {
        recommendations = data.rekomendasi_gunung;
        metadata = data.metadata;
      } else if (data.recommendations) {
        // Fallback for old API format
        recommendations = data.recommendations;
      } else if (Array.isArray(data)) {
        recommendations = data;
      }

      // Add metadata to first result for display purposes
      if (metadata && recommendations.length > 0) {
        recommendations[0].metadata = metadata;
      }

      setResults(recommendations);
      scrollToElement(resultsRef);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleShowAll = async () => {
    setIsCalculating(true);
    setHasSearched(true);
    setError(null);
    setResults([]);

    try {
      const data = await fetchAllData(searchMode);

      // Extract data from response
      let recommendations = [];
      let metadata = null;

      if (data.rekomendasi_jalur && searchMode === "jalur") {
        recommendations = data.rekomendasi_jalur;
        metadata = data.metadata;
      } else if (data.rekomendasi_gunung && searchMode === "gunung") {
        recommendations = data.rekomendasi_gunung;
        metadata = data.metadata;
      } else if (Array.isArray(data)) {
        recommendations = data;
      } else {
        recommendations = data.data || [];
      }

      // Add metadata to first result for display purposes
      if (metadata && recommendations.length > 0) {
        recommendations[0].metadata = metadata;
      }

      setResults(recommendations);
      scrollToElement(resultsRef);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    handleChange,
    handleInputTypeChange,
    handleReset,
    handleRecommendationSubmit,
    handleShowAll,
  };
};

// Simple Search Component
const SimpleSearchBar = ({ value, onChange, onSearch, isCalculating }) => (
  <div className="simple-search-container">
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Cari nama gunung atau jalur..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && onSearch()}
      />
      <button
        type="button"
        className="search-btn"
        onClick={onSearch}
        disabled={isCalculating}
      >
        {isCalculating ? "..." : "Cari"}
      </button>
    </div>
  </div>
);

// Share functionality component
const ShareButton = ({ results, searchMode }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const generateShareText = () => {
    const count = results.length;
    const type = searchMode === "jalur" ? "jalur pendakian" : "gunung";
    return `Saya menemukan ${count} rekomendasi ${type} terbaik di Mountify! 🏔️ 
    
Lihat rekomendasi lengkap di: ${window.location.href}

#Mountify #Pendakian #Gunung #Indonesia`;
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Rekomendasi Pendakian dari Mountify");
    const body = encodeURIComponent(generateShareText());
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      alert("Link berhasil disalin!");
    } catch (err) {
      console.error("Gagal menyalin link:", err);
    }
  };

  if (!results.length) return null;

  return (
    <div className="share-container">
      <button
        className="share-toggle-btn"
        onClick={() => setShowShareMenu(!showShareMenu)}
      >
        <i className="icon">📤</i>
        Bagikan Hasil
      </button>

      {showShareMenu && (
        <div className="share-menu">
          <button className="share-option whatsapp" onClick={shareViaWhatsApp}>
            <i className="icon">📱</i>
            WhatsApp
          </button>
          <button className="share-option email" onClick={shareViaEmail}>
            <i className="icon">✉️</i>
            Email
          </button>
          <button className="share-option copy" onClick={copyToClipboard}>
            <i className="icon">📋</i>
            Salin Link
          </button>
        </div>
      )}
    </div>
  );
};

// Modal Panduan Penggunaan & Kriteria
function UsageGuideModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="usage-modal-backdrop"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="usage-modal-content"
        style={{
          background: "#fff",
          borderRadius: 8,
          maxWidth: 600,
          width: "90%",
          padding: 32,
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "sticky",
            top: 0,
            right: 0,
            alignSelf: "flex-end",
            fontSize: 22,
            background: "none",
            border: "none",
            cursor: "pointer",
            zIndex: 10,
          }}
          aria-label="Tutup"
        >
          &times;
        </button>
        <h2 style={{ marginTop: 0 }}>Panduan Penggunaan & Info Kriteria</h2>
        <h3>Cara Penggunaan</h3>
        <ol style={{ paddingLeft: 20 }}>
          <li>
            Pilih mode pencarian: <b>jalur</b> (jalur pendakian) atau{" "}
            <b>gunung</b> (rekomendasi gunung terbaik).
          </li>
          <li>
            Atur preferensi menggunakan <b>slider</b> (kontrol) atau{" "}
            <b>dropdown</b> (pilihan deskriptif) dengan klik "Mode Input".
          </li>
          <li>
            Isi filter sesuai kebutuhan: tingkat kesulitan, keamanan, estimasi
            waktu, ketinggian, fasilitas, air, variasi lanskap, perlindungan
            angin, jaringan komunikasi, tingkat insiden, dsb.
          </li>
          <li>
            Klik <b>Cari Rekomendasi</b> untuk menampilkan hasil.
          </li>
          <li>
            Gunakan <b>pencarian cepat</b> (quick search) untuk mencari nama
            gunung/jalur secara langsung.
          </li>
          <li>
            Untuk bantuan interaktif, klik ikon <b>chatbot</b> dan ajukan
            pertanyaan secara natural.
          </li>
        </ol>
        <h3 style={{ marginTop: 24 }}>Info Kriteria & Skala Filter</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
            marginBottom: 12,
          }}
        >
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ border: "1px solid #ddd", padding: "6px" }}>
                Kriteria
              </th>
              <th style={{ border: "1px solid #ddd", padding: "6px" }}>
                Rentang & Arti
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                max_kesulitan_skala
              </td>
              <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                1 (sangat mudah) - 10 (ekstrem)
              </td>
            </tr>
            <tr>
              <td>min_keamanan_skala</td>
              <td>1 (sangat berisiko) - 10 (maksimal aman)</td>
            </tr>
            <tr>
              <td>max_estimasi_waktu_jam</td>
              <td>Estimasi waktu tempuh (jam)</td>
            </tr>
            <tr>
              <td>max_ketinggian_mdpl</td>
              <td>Ketinggian puncak (meter)</td>
            </tr>
            <tr>
              <td>min_kualitas_fasilitas_skala</td>
              <td>1 (sangat minim) - 10 (mewah)</td>
            </tr>
            <tr>
              <td>min_kualitas_kemah_skala</td>
              <td>1 (sangat terbatas) - 10 (eksklusif)</td>
            </tr>
            <tr>
              <td>min_keindahan_pemandangan_skala</td>
              <td>1 (kurang menarik) - 10 (luar biasa)</td>
            </tr>
            <tr>
              <td>min_ketersediaan_air</td>
              <td>1 (sangat langka) - 10 (berlimpah ruah)</td>
            </tr>
            <tr>
              <td>min_variasi_lanskap</td>
              <td>1 (sangat monoton) - 10 (luar biasa beragam)</td>
            </tr>
            <tr>
              <td>min_perlindungan_angin</td>
              <td>1 (sangat terekspos) - 10 (ideal terlindungi)</td>
            </tr>
            <tr>
              <td>min_jaringan_komunikasi</td>
              <td>1 (tidak ada sinyal) - 10 (sinyal optimal)</td>
            </tr>
            <tr>
              <td>min_tingkat_keamanan_insiden</td>
              <td>1 (insiden sangat sering) - 10 (maksimal aman)</td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
          Semakin tinggi nilai minimum pada filter, semakin ketat hasil
          rekomendasi.
          <br />
          Setiap kriteria dapat diatur sesuai kebutuhan pendaki (pemula,
          menengah, ahli).
          <br />
          Untuk info detail skala, lihat tooltip atau label pada masing-masing
          filter di UI.
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 8,
            background: "#27ae60",
            color: "#fff",
            border: "none",
            padding: "8px 20px",
            borderRadius: 4,
            cursor: "pointer",
            alignSelf: "flex-end",
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function Explore() {
  const [searchMode, setSearchMode] = useState("jalur");
  const [chatStarted, setChatStarted] = useState(false);
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showUsage, setShowUsage] = useState(false); // New state for usage guide
  const resultsRef = useRef(null);

  // Use custom hooks
  const { mountainsList, error: mountainsError } = useMountainsList();
  const {
    handleChange,
    handleInputTypeChange,
    handleReset,
    handleRecommendationSubmit,
    handleShowAll,
  } = useExploreHandlers(
    preferences,
    setPreferences,
    setResults,
    setHasSearched,
    setIsCalculating,
    setError,
    resultsRef,
    searchMode
  );

  // Set initial mode to virtual assistant
  useEffect(() => {
    setSearchMode("virtual");
    setChatStarted(false);
  }, []);

  // Handle mode changes
  const handleModeChange = (mode) => {
    setSearchMode(mode);
    if (mode === "virtual") {
      setChatStarted(false);
    } else {
      handleReset();
    }
  };

  // Handle quick search
  const handleQuickSearch = async () => {
    if (!preferences.quickSearch.trim()) return;

    setIsCalculating(true);
    setHasSearched(true);
    setError(null);
    setResults([]);

    try {
      // Use the regular recommendation API with search term
      const searchPreferences = {
        ...preferences,
        search_term: preferences.quickSearch,
      };

      const data = await fetchRecommendations(searchPreferences, searchMode);

      // Extract recommendations from fuzzy engine response
      let recommendations = [];
      let metadata = null;

      if (data.rekomendasi_jalur && searchMode === "jalur") {
        recommendations = data.rekomendasi_jalur;
        metadata = data.metadata;
      } else if (data.rekomendasi_gunung && searchMode === "gunung") {
        recommendations = data.rekomendasi_gunung;
        metadata = data.metadata;
      } else if (data.recommendations) {
        recommendations = data.recommendations;
      } else if (Array.isArray(data)) {
        recommendations = data;
      }

      // Add metadata to first result for display purposes
      if (metadata && recommendations.length > 0) {
        recommendations[0].metadata = metadata;
      }

      setResults(recommendations);
      scrollToElement(resultsRef);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  // Update error state if mountains loading fails
  useEffect(() => {
    if (mountainsError) {
      setError(mountainsError);
    }
  }, [mountainsError]);

  return (
    <div className="explore-page-container">
      {/* Tombol Panduan Penggunaan */}
      <button
        className="usage-guide-btn"
        style={{
          position: "fixed",
          top: 90,
          right: 24,
          zIndex: 1100,
          background: "#27ae60",
          color: "#fff",
          border: "none",
          borderRadius: 20,
          padding: "8px 18px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
        onClick={() => setShowUsage(true)}
      >
        ?
      </button>
      <UsageGuideModal open={showUsage} onClose={() => setShowUsage(false)} />
      <header className="explore-header">
        <div className="header-content">
          <h1>Rekomendasi Pendakian</h1>
          <p>Temukan gunung dan jalur yang sesuai dengan preferensi Anda</p>
        </div>
        <div className="mode-switcher">
          <button
            onClick={() => handleModeChange("virtual")}
            className={`mode-btn ${searchMode === "virtual" ? "active" : ""}`}
          >
            <span className="mode-icon">🤖</span>
            Asisten Virtual
          </button>
          <button
            onClick={() => handleModeChange("gunung")}
            className={`mode-btn ${searchMode === "gunung" ? "active" : ""}`}
          >
            <span className="mode-icon">🏔️</span>
            Gunung
          </button>
          <button
            onClick={() => handleModeChange("jalur")}
            className={`mode-btn ${searchMode === "jalur" ? "active" : ""}`}
          >
            <span className="mode-icon">🥾</span>
            Jalur
          </button>
        </div>
      </header>

      {searchMode !== "virtual" && (
        <>
          {/* Simple Search Section */}
          <SimpleSearchBar
            value={preferences.quickSearch}
            onChange={(value) =>
              setPreferences((prev) => ({ ...prev, quickSearch: value }))
            }
            onSearch={handleQuickSearch}
            isCalculating={isCalculating}
          />

          <form
            className="recommendation-form"
            onSubmit={handleRecommendationSubmit}
          >
            <div className="form-header">
              <h3>Preferensi Pendakian</h3>
              <div className="header-controls">
                <InputTypeSwitcher
                  inputType={preferences.inputType}
                  onInputTypeChange={handleInputTypeChange}
                />
                {/* <div className="help-buttons-group">
                  <button
                    type="button"
                    className="help-toggle-btn"
                    onClick={() => setShowUsage(!showUsage)}
                    title={
                      showUsage
                        ? "Sembunyikan cara penggunaan"
                        : "Tampilkan cara penggunaan"
                    }
                  >
                    {showUsage ? "Sembunyikan Panduan" : "Cara Penggunaan"}
                  </button>
                  <button
                    type="button"
                    className="help-toggle-btn"
                    onClick={() => setShowHelp(!showHelp)}
                    title={
                      showHelp
                        ? "Sembunyikan info kriteria"
                        : "Tampilkan info kriteria"
                    }
                  >
                    {showHelp ? "Sembunyikan Info" : "Info Kriteria"}
                  </button>
                </div> */}
              </div>
            </div>

            {/* Usage Guide Section */}
            {showUsage && (
              <div className="help-section">
                <h4 className="help-title">
                  📖 Panduan Penggunaan Sistem Rekomendasi
                </h4>
                <div className="usage-content">
                  <div className="usage-step">
                    <h5>🎯 1. Pilih Mode Pencarian</h5>
                    <ul>
                      <li>
                        <strong>Gunung:</strong> Mencari rekomendasi gunung
                        terbaik berdasarkan preferensi
                      </li>
                      <li>
                        <strong>Jalur:</strong> Mencari jalur pendakian spesifik
                        dengan kriteria detail
                      </li>
                      <li>
                        <strong>Asisten Virtual:</strong> Gunakan chatbot untuk
                        pencarian interaktif
                      </li>
                    </ul>
                  </div>

                  <div className="usage-step">
                    <h5>⚙️ 2. Atur Mode Input</h5>
                    <ul>
                      <li>
                        <strong>Kontrol:</strong> Gunakan slider untuk mengatur
                        nilai secara kontinu
                      </li>
                      <li>
                        <strong>Pilihan:</strong> Pilih dari dropdown dengan
                        deskripsi yang jelas
                      </li>
                    </ul>
                  </div>

                  <div className="usage-step">
                    <h5>🔍 3. Pencarian Cepat</h5>
                    <p>
                      Gunakan kolom pencarian untuk menemukan gunung atau jalur
                      berdasarkan nama secara langsung.
                    </p>
                  </div>

                  <div className="usage-step">
                    <h5>📊 4. Atur Preferensi</h5>
                    <ul>
                      <li>
                        Sesuaikan setiap kriteria berdasarkan kemampuan dan
                        preferensi Anda
                      </li>
                      <li>
                        Nilai lebih tinggi = kriteria lebih ketat/spesifik
                      </li>
                      <li>Gunakan tooltip untuk memahami setiap kriteria</li>
                    </ul>
                  </div>

                  <div className="usage-step">
                    <h5>🎯 5. Dapatkan Rekomendasi</h5>
                    <ul>
                      <li>
                        <strong>Dapatkan Rekomendasi:</strong> Sistem akan
                        menganalisis preferensi Anda
                      </li>
                      <li>
                        <strong>Lihat Semua:</strong> Tampilkan semua data tanpa
                        filter
                      </li>
                      <li>
                        <strong>Reset:</strong> Kembalikan ke pengaturan default
                      </li>
                    </ul>
                  </div>

                  <div className="usage-tip">
                    <h5>💡 Tips Penggunaan:</h5>
                    <ul>
                      <li>
                        Mulai dengan kriteria keamanan tinggi untuk pemula
                      </li>
                      <li>Sesuaikan durasi dengan kemampuan fisik Anda</li>
                      <li>Pertimbangkan musim dan cuaca saat memilih</li>
                      <li>
                        Gunakan filter gunung spesifik untuk jalur tertentu
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Help Section - Conditional Rendering */}
            {showHelp && (
              <div className="help-section">
                <h4 className="help-title">📋 Info Kriteria Penilaian</h4>

                <div className="criteria-section">
                  <div className="help-grid">
                    <div className="help-item">
                      <strong>🧗 Kesulitan:</strong> Tingkat tantangan teknis
                      dan fisik jalur berdasarkan standar nasional &
                      internasional (Grade 1-5, YDS)
                    </div>
                    <div className="help-item">
                      <strong>🛡️ Keamanan:</strong> Berdasarkan data insiden
                      BASARNAS & evaluasi SAR
                    </div>
                    <div className="help-item">
                      <strong>🏗️ Fasilitas:</strong> Kelengkapan basecamp,
                      shelter, toilet, dan fasilitas pendukung
                    </div>
                    <div className="help-item">
                      <strong>🏕️ Area Kemah:</strong> Kualitas lokasi bermalam,
                      ground datar, dan perlindungan cuaca
                    </div>
                    <div className="help-item">
                      <strong>🌅 Pemandangan:</strong> Keindahan panorama,
                      sunrise/sunset, dan daya tarik visual
                    </div>
                    <div className="help-item">
                      <strong>⏱️ Durasi:</strong> Estimasi waktu naik-turun
                      berdasarkan pengalaman rata-rata pendaki
                    </div>
                    <div className="help-item">
                      <strong>⛰️ Ketinggian:</strong> Maksimal ketinggian puncak
                      (mdpl)
                    </div>
                    <div className="help-item">
                      <strong>💧 Ketersediaan Air:</strong> Akses sumber air
                      bersih sepanjang jalur & area kemah
                    </div>
                    <div className="help-item">
                      <strong>🌿 Variasi Lanskap:</strong> Keragaman ekosistem,
                      flora-fauna, dan formasi geologis
                    </div>
                    <div className="help-item">
                      <strong>🌪️ Perlindungan Angin:</strong> Tingkat
                      keterlindungan area kemah dari angin kencang
                    </div>
                    <div className="help-item">
                      <strong>📱 Jaringan Komunikasi:</strong> Kualitas sinyal
                      seluler untuk komunikasi darurat
                    </div>
                    <div className="help-item">
                      <strong>🚨 Tingkat Insiden:</strong> Riwayat keamanan
                      berdasarkan data SAR & kejadian kecelakaan
                    </div>
                  </div>
                </div>

                <div className="help-note">
                  <strong>📚 Referensi:</strong> BASARNAS Indonesia, WANADRI,
                  UIAA, Database Gunung Indonesia.
                </div>
              </div>
            )}

            {searchMode === "jalur" && (
              <div className="filter-section">
                <h4 className="section-title">Filter Spesifik</h4>
                <div className="form-group">
                  <label htmlFor="id_gunung">Pilih Gunung Tertentu</label>
                  <select
                    id="id_gunung"
                    name="id_gunung"
                    className="filter-select"
                    value={preferences.id_gunung}
                    onChange={handleChange}
                  >
                    <option value="">Semua Gunung</option>
                    {mountainsList.map((g) => (
                      <option key={g.id_gunung} value={g.id_gunung}>
                        {g.nama_gunung}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="filter-section">
              <h4 className="section-title">Kesulitan & Keamanan</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="max_kesulitan_skala">
                    <span>Tingkat Kesulitan Maksimal</span>
                    <span className="preference-value">
                      {getDifficultyDescription(
                        preferences.max_kesulitan_skala
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="max_kesulitan_skala"
                    name="max_kesulitan_skala"
                    value={preferences.max_kesulitan_skala}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getDifficultyDescription}
                    rangeLabels={{ min: "Mudah", max: "Sulit" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="min_keamanan_skala">
                    <span>Tingkat Keamanan Minimal</span>
                    <span className="preference-value">
                      {getSafetyDescription(preferences.min_keamanan_skala)}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_keamanan_skala"
                    name="min_keamanan_skala"
                    value={preferences.min_keamanan_skala}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getSafetyDescription}
                    rangeLabels={{ min: "Berisiko", max: "Sangat Aman" }}
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4 className="section-title">Durasi & Ketinggian</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="max_estimasi_waktu_jam">
                    Maksimal Durasi Pendakian
                  </label>
                  <TimeInput
                    id="max_estimasi_waktu_jam"
                    name="max_estimasi_waktu_jam"
                    value={preferences.max_estimasi_waktu_jam}
                    onChange={handleChange}
                    inputType={preferences.inputType}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="max_ketinggian_mdpl">
                    <span>Ketinggian Maksimal</span>
                    <span className="preference-value">
                      {getAltitudeDescription(preferences.max_ketinggian_mdpl)}
                    </span>
                  </label>
                  <input
                    type="number"
                    id="max_ketinggian_mdpl"
                    name="max_ketinggian_mdpl"
                    className="number-input"
                    value={preferences.max_ketinggian_mdpl}
                    onChange={handleChange}
                    min="0"
                    max="6000"
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4 className="section-title">Fasilitas & Kenyamanan</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="min_kualitas_fasilitas_skala">
                    <span>Kualitas Fasilitas Minimal</span>
                    <span className="preference-value">
                      {getFacilityDescription(
                        preferences.min_kualitas_fasilitas_skala
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_kualitas_fasilitas_skala"
                    name="min_kualitas_fasilitas_skala"
                    value={preferences.min_kualitas_fasilitas_skala}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getFacilityDescription}
                    rangeLabels={{ min: "Minim", max: "Lengkap" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="min_kualitas_kemah_skala">
                    <span>Kualitas Area Kemah Minimal</span>
                    <span className="preference-value">
                      {getCampQualityDescription(
                        preferences.min_kualitas_kemah_skala
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_kualitas_kemah_skala"
                    name="min_kualitas_kemah_skala"
                    value={preferences.min_kualitas_kemah_skala}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getCampQualityDescription}
                    rangeLabels={{ min: "Terbatas", max: "Sangat Baik" }}
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4 className="section-title">Pemandangan & Lingkungan</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="min_keindahan_pemandangan_skala">
                    <span>Keindahan Pemandangan Minimal</span>
                    <span className="preference-value">
                      {getSceneryDescription(
                        preferences.min_keindahan_pemandangan_skala
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_keindahan_pemandangan_skala"
                    name="min_keindahan_pemandangan_skala"
                    value={preferences.min_keindahan_pemandangan_skala}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getSceneryDescription}
                    rangeLabels={{ min: "Biasa", max: "Istimewa" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="min_ketersediaan_air">
                    <span>Ketersediaan Air Minimal</span>
                    <span className="preference-value">
                      {getWaterAvailabilityDescription(
                        preferences.min_ketersediaan_air
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_ketersediaan_air"
                    name="min_ketersediaan_air"
                    value={preferences.min_ketersediaan_air}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getWaterAvailabilityDescription}
                    rangeLabels={{ min: "Langka", max: "Melimpah" }}
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4 className="section-title">Lanskap & Perlindungan</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="min_variasi_lanskap">
                    <span>Variasi Lanskap Minimal</span>
                    <span className="preference-value">
                      {getLandscapeVariationDescription(
                        preferences.min_variasi_lanskap
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_variasi_lanskap"
                    name="min_variasi_lanskap"
                    value={preferences.min_variasi_lanskap}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getLandscapeVariationDescription}
                    rangeLabels={{ min: "Monoton", max: "Sangat Bervariasi" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="min_perlindungan_angin">
                    <span>Perlindungan Angin Minimal</span>
                    <span className="preference-value">
                      {getWindProtectionDescription(
                        preferences.min_perlindungan_angin
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_perlindungan_angin"
                    name="min_perlindungan_angin"
                    value={preferences.min_perlindungan_angin}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getWindProtectionDescription}
                    rangeLabels={{
                      min: "Terekspos",
                      max: "Sangat Terlindungi",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="filter-section">
              <h4 className="section-title">Komunikasi & Keamanan Insiden</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="min_jaringan_komunikasi">
                    <span>Sinyal Minimal</span>
                    <span className="preference-value">
                      {getCommunicationDescription(
                        preferences.min_jaringan_komunikasi
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_jaringan_komunikasi"
                    name="min_jaringan_komunikasi"
                    value={preferences.min_jaringan_komunikasi}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getCommunicationDescription}
                    rangeLabels={{
                      min: "Tidak Ada Sinyal",
                      max: "Sinyal Sangat Baik",
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="min_tingkat_keamanan_insiden">
                    <span>Insiden Minimal</span>
                    <span className="preference-value">
                      {getIncidentSafetyDescription(
                        preferences.min_tingkat_keamanan_insiden
                      )}
                    </span>
                  </label>
                  <ScaleInput
                    id="min_tingkat_keamanan_insiden"
                    name="min_tingkat_keamanan_insiden"
                    value={preferences.min_tingkat_keamanan_insiden}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    inputType={preferences.inputType}
                    getDescription={getIncidentSafetyDescription}
                    rangeLabels={{ min: "Sering", max: "Sangat Aman" }}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="action-button secondary"
                onClick={handleShowAll}
                disabled={isCalculating}
              >
                Lihat Semua
              </button>
              <button
                type="button"
                className="action-button tertiary"
                onClick={handleReset}
                disabled={isCalculating}
              >
                Reset
              </button>
              <button
                type="submit"
                className="action-button primary"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <SpinnerIcon /> Menganalisis...
                  </>
                ) : (
                  "Dapatkan Rekomendasi"
                )}
              </button>
            </div>
          </form>

          <section className="results-section" ref={resultsRef}>
            {hasSearched && (
              <header className="results-header">
                <h2>Hasil Rekomendasi</h2>
                <ShareButton results={results} searchMode={searchMode} />
              </header>
            )}

            {/* Display fuzzy engine metadata if available */}
            {hasSearched && results.length > 0 && results[0].metadata && (
              <div className="engine-info">
                <div className="engine-stats">
                  <span className="stat-item">
                    📊 Engine:{" "}
                    {results[0].metadata.engine_info?.versi || "v5.0"}
                  </span>
                  <span className="stat-item">
                    🎯 {results[0].metadata.engine_info?.total_variabel || 13}{" "}
                    variabel input
                  </span>
                  {results[0].metadata.statistik_skor && (
                    <span className="stat-item">
                      ⭐ Skor tertinggi:{" "}
                      {results[0].metadata.statistik_skor.tertinggi?.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="results-grid">
              {isCalculating && (
                <div className="explore-page-status">
                  <SpinnerIcon /> Memuat data...
                </div>
              )}
              {error && (
                <ErrorDisplay
                  error={error}
                  context={`rekomendasi ${searchMode}`}
                  onRetry={() => {
                    setError(null);
                    setHasSearched(false);
                  }}
                />
              )}
              {!isCalculating &&
                hasSearched &&
                !error &&
                (results.length > 0 ? (
                  results.map((item, index) =>
                    searchMode === "jalur" ? (
                      <TrailCard
                        key={item.id_jalur || index}
                        trail={item}
                        index={index}
                      />
                    ) : (
                      <MountainCard
                        key={item.id_gunung || index}
                        mountain={item}
                        index={index}
                      />
                    )
                  )
                ) : (
                  <div className="no-results-message">
                    <NoResultsIllustration />
                    <h4>Tidak ada hasil yang cocok</h4>
                    <p>
                      Coba ubah preferensi Anda atau lihat semua data yang
                      tersedia.
                    </p>
                  </div>
                ))}
              {!hasSearched && !isCalculating && !error && (
                <div className="no-results-message">
                  <h4>Hasil akan muncul di sini</h4>
                  <p>
                    Atur preferensi untuk mendapat rekomendasi, atau klik "Lihat
                    Semua" untuk menjelajah.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Share Results Section - Conditional Rendering */}
          {hasSearched && results.length > 0 && (
            <div className="share-results-section">
              <h4 className="share-title">Bagikan Rekomendasi</h4>
              <ShareButton results={results} searchMode={searchMode} />
            </div>
          )}
        </>
      )}

      {/* Bagian ini menampilkan Welcome Screen atau tidak sama sekali */}
      {searchMode === "virtual" && !chatStarted && (
        <ChatbotWelcome onStartChat={() => setChatStarted(true)} />
      )}

      {/* BAGIAN BARU: Render overlay chatbot secara terpisah */}
      {searchMode === "virtual" && chatStarted && (
        <div className="chatbot-overlay" onClick={() => setChatStarted(false)}>
          <div
            className="chatbot-container"
            onClick={(e) => e.stopPropagation()}
          >
            <Chatbot onClose={() => setChatStarted(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Explore;
