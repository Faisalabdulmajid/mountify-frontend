import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./KelolaGaleri.css";
import { PageHeader } from "../../../components/common/PageHeader";
import "../../../components/common/PageHeader/PageHeader.css";
import { GaleriToolbar } from "./components";

const API_BASE_URL = "http://localhost:5000/api/admin";

function KelolaGaleri() {
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState([]);
  const [gunungList, setGunungList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [gunungFilter, setGunungFilter] = useState("Semua");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [galleryRes, gunungRes] = await Promise.all([
        fetch(`${API_BASE_URL}/gallery`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/gunung`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!galleryRes.ok) throw new Error("Gagal memuat data galeri.");
      if (!gunungRes.ok) throw new Error("Gagal memuat daftar gunung.");

      const galleryData = await galleryRes.json();
      const gunungData = await gunungRes.json();

      setGalleryItems(galleryData);
      setGunungList(gunungData);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    if (gunungFilter === "Semua") {
      return galleryItems;
    }
    return galleryItems.filter((item) => item.nama_gunung === gunungFilter);
  }, [galleryItems, gunungFilter]);

  const handleDelete = (id, judul) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Menghapus foto "${judul}" tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const resJson = await response.json();
          if (!response.ok) throw new Error(resJson.message);

          toast.success(resJson.message);
          setGalleryItems((prev) =>
            prev.filter((item) => item.id_galeri !== id)
          );
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  if (loading)
    return <div className="spinner-container">Memuat data galeri...</div>;
  if (error) return <div className="error-message-full">{error}</div>;

  return (
    <div className="kelola-galeri-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <PageHeader
        title="Kelola Galeri"
        addLabel="Unggah Foto Baru"
        onAddClick={() => navigate("/admin/gallery/new")}
      />

      <GaleriToolbar
        gunungFilter={gunungFilter}
        setGunungFilter={setGunungFilter}
        gunungList={gunungList}
      />

      <div className="galeri-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id_galeri} className="galeri-item-card">
              <img
                src={`http://localhost:5000${item.url_gambar}`}
                alt={item.judul}
                className="galeri-thumbnail"
              />
              <button
                className="btn-delete-icon"
                title="Hapus Foto"
                onClick={() => handleDelete(item.id_galeri, item.judul)}
              >
                <i className="bi bi-trash3-fill"></i>
              </button>
              <div className="galeri-item-info">
                <h4>{item.judul || "Tanpa Judul"}</h4>
                <p>{item.deskripsi || "Tidak ada deskripsi."}</p>
                {/* --- PENAMBAHAN INFO PENULIS DI SINI --- */}
                <div className="author-info">
                  <i className="bi bi-person-circle"></i>
                  <span>{item.penulis || "N/A"}</span>
                </div>
                <div className="meta-info">
                  <span className="meta-gunung">
                    <i className="bi bi-image-alt"></i>
                    {item.nama_gunung || "Umum"}
                  </span>
                  <span className="meta-tanggal">
                    <i className="bi bi-calendar-event"></i>
                    {new Date(item.uploaded_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-gallery-message">
            <p>
              Tidak ada foto yang cocok dengan filter, atau galeri masih kosong.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default KelolaGaleri;
