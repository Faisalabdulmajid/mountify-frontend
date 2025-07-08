// src/pages/admin/gunung/components/GunungTable.js (Updated to match JalurTable structure)
import React from "react";
import { useNavigate } from "react-router-dom";

const GunungTable = ({
  gunungList,
  onDelete,
  onSort,
  sortConfig,
  indexOfFirstItem,
  onViewDetails,
  apiBaseUrl,
  deletingIds = new Set(),
}) => {
  const navigate = useNavigate();

  // Fungsi helper untuk format lokasi administratif
  const formatLokasiAdministratif = (lokasi) => {
    if (!lokasi) return "-";
    // Jika lokasi berupa string dengan separator "; ", pecah dan ambil maksimal 2 pertama
    const lokasiArray = lokasi.split("; ");
    if (lokasiArray.length <= 2) {
      return lokasi;
    }
    // Jika lebih dari 2, tampilkan 2 pertama + "..."
    return `${lokasiArray.slice(0, 2).join("; ")}...`;
  };

  // Fungsi helper untuk format variasi jalur berdasarkan jumlah_jalur
  const formatVariasiJalurByJumlah = (jumlah) => {
    if (jumlah === undefined || jumlah === null) return "-";
    if (jumlah <= 3) return "Jalur Tunggal";
    if (jumlah <= 7) return "Beberapa Jalur";
    if (jumlah > 7) return "Banyak Jalur";
    return "-";
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === "ascending") {
      return <i className="bi bi-sort-up-alt sort-icon-active"></i>;
    }
    return <i className="bi bi-sort-down sort-icon-active"></i>;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: "6%" }}>No</th>
            <th style={{ width: "18%" }} onClick={() => onSort("nama_gunung")}>
              <div className="header-cell-content">
                <span>Nama Gunung</span>
                {getSortIcon("nama_gunung")}
              </div>
            </th>
            <th
              style={{ width: "16%" }}
              className="col-lokasi"
              onClick={() => onSort("lokasi_administratif")}
            >
              <div className="header-cell-content">
                <span>Lokasi</span>
                {getSortIcon("lokasi_administratif")}
              </div>
            </th>
            <th
              style={{ width: "10%" }}
              className="col-ketinggian"
              onClick={() => onSort("ketinggian_puncak_mdpl")}
            >
              <div className="header-cell-content">
                <span>Ketinggian</span>
                {getSortIcon("ketinggian_puncak_mdpl")}
              </div>
            </th>
            <th
              style={{ width: "10%" }}
              className="col-jalur"
              onClick={() => onSort("jumlah_jalur")}
            >
              <div className="header-cell-content">
                <span>Jalur</span>
                {getSortIcon("jumlah_jalur")}
              </div>
            </th>
            <th
              style={{ width: "9%" }}
              className="col-rating"
              onClick={() => onSort("rating_rata_rata")}
            >
              <div className="header-cell-content">
                <span>Rating</span>
                {getSortIcon("rating_rata_rata")}
              </div>
            </th>
            <th
              style={{ width: "8%" }}
              className="col-ulasan"
              onClick={() => onSort("jumlah_ulasan")}
            >
              <div className="header-cell-content">
                <span>Ulasan</span>
                {getSortIcon("jumlah_ulasan")}
              </div>
            </th>
            <th style={{ width: "23%" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {gunungList.length > 0 ? (
            gunungList.map((gunung, index) => (
              <tr key={gunung.id_gunung}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <span title={gunung.nama_gunung}>{gunung.nama_gunung}</span>
                </td>
                <td className="col-lokasi">
                  <span
                    title={
                      gunung.lokasi_administratif || "Lokasi tidak diketahui"
                    }
                    style={{ fontSize: "0.9em", color: "#64748b" }}
                  >
                    {formatLokasiAdministratif(gunung.lokasi_administratif)}
                  </span>
                </td>
                <td className="col-ketinggian">
                  <span
                    title={`Ketinggian: ${gunung.ketinggian_puncak_mdpl} MDPL`}
                  >
                    {gunung.ketinggian_puncak_mdpl} MDPL
                  </span>
                </td>
                <td className="col-jalur">
                  <span
                    title={`Variasi Jalur: ${formatVariasiJalurByJumlah(
                      gunung.jumlah_jalur
                    )}`}
                  >
                    {formatVariasiJalurByJumlah(gunung.jumlah_jalur)}
                  </span>
                </td>
                <td className="col-rating">
                  <span
                    title={`Rating rata-rata: ${parseFloat(
                      gunung.rating_rata_rata
                    ).toFixed(1)}`}
                  >
                    <i
                      className="bi bi-star-fill"
                      style={{ color: "#fbbf24", marginRight: "4px" }}
                    ></i>
                    {parseFloat(gunung.rating_rata_rata).toFixed(1)}
                  </span>
                </td>
                <td className="col-ulasan">
                  <span title={`Total ${gunung.jumlah_ulasan} ulasan`}>
                    {gunung.jumlah_ulasan} ulasan
                  </span>
                </td>
                <td
                  className="col-aksi"
                  style={{ textAlign: "center", verticalAlign: "middle" }}
                >
                  <div className="action-buttons">
                    <button
                      className="action-btn btn-view-details"
                      title="Detail Cepat"
                      onClick={() => onViewDetails(gunung)}
                    >
                      <i className="bi bi-eye-fill"></i>
                    </button>
                    <button
                      className="action-btn btn-view-paths"
                      title="Lihat Jalur"
                      onClick={() =>
                        navigate(`/admin/jalur?gunungId=${gunung.id_gunung}`)
                      }
                    >
                      <i className="bi bi-signpost-split-fill"></i>
                    </button>
                    <button
                      className="action-btn btn-edit"
                      title="Edit Gunung"
                      onClick={() =>
                        navigate(`/admin/gunung/edit/${gunung.id_gunung}`)
                      }
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      className="action-btn btn-delete"
                      title="Hapus Gunung"
                      onClick={() => onDelete(gunung.id_gunung)}
                      disabled={deletingIds.has(gunung.id_gunung)}
                    >
                      {deletingIds.has(gunung.id_gunung) ? (
                        <i
                          className="bi bi-arrow-repeat"
                          style={{ animation: "spin 1s linear infinite" }}
                        ></i>
                      ) : (
                        <i className="bi bi-trash-fill"></i>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                Tidak ada data gunung yang cocok dengan filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GunungTable;
