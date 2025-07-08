// src/pages/admin/ulasan/KelolaUlasan.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./KelolaUlasan.css";
import { PageHeader } from "../../../components/common/PageHeader";
import "../../../components/common/PageHeader/PageHeader.css";

const API_BASE_URL = "http://localhost:5000/api/admin";

function KelolaUlasan() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua"); // Semua, Disetujui, Menunggu

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal memuat data ulasan.");
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = useMemo(() => {
    if (filter === "Disetujui") return reviews.filter((r) => r.is_approved);
    if (filter === "Menunggu") return reviews.filter((r) => !r.is_approved);
    return reviews;
  }, [reviews, filter]);

  const handleApprove = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const resJson = await response.json();
      if (!response.ok) throw new Error(resJson.message);

      toast.success(resJson.message);
      // Update state lokal tanpa fetch ulang
      setReviews((prev) =>
        prev.map((r) => (r.id_ulasan === id ? { ...r, is_approved: true } : r))
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Menghapus ulasan ini tidak dapat dibatalkan.`,
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
          const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const resJson = await response.json();
          if (!response.ok) throw new Error(resJson.message);

          toast.success(resJson.message);
          setReviews((prev) => prev.filter((r) => r.id_ulasan !== id));
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi bi-star-fill ${
            i <= rating ? "star-filled" : "star-empty"
          }`}
        ></i>
      );
    }
    return <div className="rating-stars">{stars}</div>;
  };

  return (
    <div className="kelola-ulasan-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <PageHeader title="Kelola Ulasan">
        <div className="toolbar-ulasan">
          <div className="filter-group-ulasan">
            <label htmlFor="statusFilter">Filter Status:</label>
            <select
              id="statusFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="Semua">Semua Ulasan</option>
              <option value="Menunggu">Menunggu Persetujuan</option>
              <option value="Disetujui">Disetujui</option>
            </select>
          </div>
        </div>
      </PageHeader>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "20%" }}>
                <div className="header-cell-content">
                  <span>Gunung</span>
                </div>
              </th>
              <th style={{ width: "15%" }}>
                <div className="header-cell-content">
                  <span>Penulis</span>
                </div>
              </th>
              <th style={{ width: "12%" }}>
                <div className="header-cell-content">
                  <span>Rating</span>
                </div>
              </th>
              <th style={{ width: "25%" }}>
                <div className="header-cell-content">
                  <span>Komentar</span>
                </div>
              </th>
              <th style={{ width: "12%" }}>
                <div className="header-cell-content">
                  <span>Status</span>
                </div>
              </th>
              <th style={{ width: "16%" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  Memuat data...
                </td>
              </tr>
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <tr key={review.id_ulasan}>
                  <td>{review.nama_gunung}</td>
                  <td>{review.penulis}</td>
                  <td>{renderRatingStars(review.rating)}</td>
                  <td className="komentar-cell">
                    <p>{review.komentar}</p>
                  </td>
                  <td>
                    <span
                      className={`status-badge-ulasan ${
                        review.is_approved
                          ? "status-disetujui"
                          : "status-menunggu"
                      }`}
                    >
                      {review.is_approved ? "Disetujui" : "Menunggu"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!review.is_approved && (
                        <button
                          className="action-btn btn-approve"
                          title="Setujui"
                          onClick={() => handleApprove(review.id_ulasan)}
                        >
                          <i className="bi bi-check-circle-fill"></i>
                        </button>
                      )}
                      <button
                        className="action-btn btn-delete"
                        title="Hapus"
                        onClick={() => handleDelete(review.id_ulasan)}
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  Tidak ada ulasan yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default KelolaUlasan;
