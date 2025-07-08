// src/pages/admin/poi/KelolaPoi.js (Final - Lengkap dengan Semua Fitur)
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./KelolaPoi.css";
import PageHeader from "../../../components/common/PageHeader/PageHeader";
import "../../../components/common/PageHeader/PageHeader.css";
import Pagination from "../../../components/common/Pagination";
import { PoiToolbar } from "./components";

const API_BASE_URL = "http://localhost:5000";

function KelolaPoi() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterJalurId = searchParams.get("jalurId");

  const [poiList, setPoiList] = useState([]);
  const [jalurList, setJalurList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk filter
  const [searchTerm, setSearchTerm] = useState("");
  const [tipeFilter, setTipeFilter] = useState("Semua");
  const [jalurFilter, setJalurFilter] = useState("Semua");
  const [airFilter, setAirFilter] = useState("Semua");

  // State untuk paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [poiRes, jalurRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/poi`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/admin/jalur`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!poiRes.ok) throw new Error("Gagal mengambil data POI dari server");
      if (!jalurRes.ok)
        throw new Error("Gagal mengambil data jalur dari server");

      const poiData = await poiRes.json();
      const jalurData = await jalurRes.json();

      setPoiList(poiData);
      setJalurList(jalurData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchTerm, tipeFilter, jalurFilter, airFilter]);

  const uniqueTipeList = useMemo(
    () => [...new Set(poiList.map((poi) => poi.tipe_titik).filter(Boolean))],
    [poiList]
  );

  const filteredPoi = useMemo(() => {
    let items = [...poiList];

    if (filterJalurId) {
      items = items.filter(
        (poi) => poi.id_jalur === parseInt(filterJalurId, 10)
      );
    }
    if (tipeFilter !== "Semua") {
      items = items.filter((poi) => poi.tipe_titik === tipeFilter);
    }
    if (jalurFilter !== "Semua") {
      items = items.filter((poi) => poi.id_jalur === parseInt(jalurFilter));
    }
    if (airFilter === "Tersedia") {
      items = items.filter((poi) => poi.ketersediaan_air === true);
    } else if (airFilter === "Tidak Ada") {
      items = items.filter((poi) => !poi.ketersediaan_air);
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      items = items.filter(
        (poi) =>
          poi.nama_titik.toLowerCase().includes(searchLower) ||
          (poi.nama_gunung &&
            poi.nama_gunung.toLowerCase().includes(searchLower)) ||
          (poi.nama_jalur && poi.nama_jalur.toLowerCase().includes(searchLower))
      );
    }
    return items;
  }, [poiList, searchTerm, filterJalurId, tipeFilter, jalurFilter, airFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPoi.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPoi.length / itemsPerPage);

  const handleDeletePoi = async (id_titik) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data POI yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${API_BASE_URL}/api/admin/poi/${id_titik}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const resJson = await response.json();
          if (!response.ok) throw new Error(resJson.message);

          Swal.fire("Dihapus!", resJson.message, "success");
          fetchInitialData();
        } catch (error) {
          toast.error(error.message);
        }
      }
    });
  };

  if (isLoading)
    return <div className="loading-container">Memuat data POI...</div>;

  return (
    <div className="poi-management-page">
      <ToastContainer position="top-right" autoClose={3000} />

      <PageHeader
        title="Manajemen Titik Penting (POI)"
        addLabel="Tambah POI Baru"
        onAddClick={() => navigate("/admin/poi/new")}
      />

      <PoiToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        tipeFilter={tipeFilter}
        setTipeFilter={setTipeFilter}
        jalurFilter={jalurFilter}
        setJalurFilter={setJalurFilter}
        airFilter={airFilter}
        setAirFilter={setAirFilter}
        uniqueTipeList={uniqueTipeList}
        jalurList={jalurList}
        filterJalurId={filterJalurId}
        onShowAllPoi={() => navigate("/admin/poi")}
      />

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "8%" }}>No</th>
              <th style={{ width: "18%" }}>
                <div className="header-cell-content">
                  <span>Nama POI</span>
                </div>
              </th>
              <th style={{ width: "12%" }}>
                <div className="header-cell-content">
                  <span>Tipe</span>
                </div>
              </th>
              <th style={{ width: "12%" }}>
                <div className="header-cell-content">
                  <span>Sumber Air</span>
                </div>
              </th>
              <th style={{ width: "20%" }}>
                <div className="header-cell-content">
                  <span>Gunung & Jalur</span>
                </div>
              </th>
              <th style={{ width: "12%" }}>
                <div className="header-cell-content">
                  <span>Koordinat</span>
                </div>
              </th>
              <th style={{ width: "18%" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((poi, index) => (
                <tr key={poi.id_titik}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{poi.nama_titik}</td>
                  <td>{poi.tipe_titik}</td>
                  <td>
                    <span
                      className={`water-badge ${
                        poi.ketersediaan_air ? "available" : "unavailable"
                      }`}
                    >
                      {poi.ketersediaan_air ? "Tersedia" : "Tidak Ada"}
                    </span>
                  </td>
                  <td>
                    <div className="poi-location">
                      <span className="poi-gunung">
                        {poi.nama_gunung || "N/A"}
                      </span>
                      <span className="poi-jalur">
                        {poi.nama_jalur || "Tidak terikat"}
                      </span>
                    </div>
                  </td>
                  <td>{poi.koordinat || "-"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn btn-edit"
                        title="Edit POI"
                        onClick={() =>
                          navigate(`/admin/poi/edit/${poi.id_titik}`)
                        }
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        className="action-btn btn-delete"
                        title="Hapus POI"
                        onClick={() => handleDeletePoi(poi.id_titik)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Tidak ada data POI yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredPoi.length}
        onPageChange={(pageNumber) => setCurrentPage(pageNumber)}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        indexOfFirstItem={indexOfFirstItem}
        currentItemsLength={currentItems.length}
      />
    </div>
  );
}

export default KelolaPoi;
