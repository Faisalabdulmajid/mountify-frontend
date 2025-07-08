import React, { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./KelolaTags.css";
import { PageHeader } from "../../../components/common/PageHeader";
import "../../../components/common/PageHeader/PageHeader.css";
import { TagsToolbar } from "./components";

const API_BASE_URL = "http://localhost:5000/api/admin";

function KelolaTags() {
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fungsi untuk mengambil data tags dari server
  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data tags.");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const filteredTags = useMemo(() => {
    return tags.filter((tag) =>
      tag.nama_tag.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tags, searchTerm]);

  // Fungsi untuk menangani penambahan tag baru
  const handleAddTag = async () => {
    const { value: nama_tag } = await Swal.fire({
      title: "Tambah Tag Baru",
      input: "text",
      inputLabel: "Nama Tag",
      inputPlaceholder: "Masukkan nama tag baru...",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      inputValidator: (value) => {
        if (!value) {
          return "Nama tag tidak boleh kosong!";
        }
      },
    });

    if (nama_tag) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/tags`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nama_tag }),
        });
        const resJson = await response.json();
        if (!response.ok) throw new Error(resJson.message);

        toast.success(resJson.message);
        fetchTags(); // Ambil ulang data terbaru
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Fungsi untuk menangani edit tag
  const handleEditTag = async (id_tag, currentName) => {
    const { value: nama_tag } = await Swal.fire({
      title: "Edit Nama Tag",
      input: "text",
      inputLabel: "Nama Tag",
      inputValue: currentName,
      showCancelButton: true,
      confirmButtonText: "Update",
      cancelButtonText: "Batal",
      inputValidator: (value) => {
        if (!value) {
          return "Nama tag tidak boleh kosong!";
        }
      },
    });

    if (nama_tag && nama_tag !== currentName) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/tags/${id_tag}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nama_tag }),
        });
        const resJson = await response.json();
        if (!response.ok) throw new Error(resJson.message);

        toast.success(resJson.message);
        fetchTags();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // Fungsi untuk menangani hapus tag
  const handleDeleteTag = (id_tag, nama_tag) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: `Menghapus tag "${nama_tag}" juga akan melepaskan kaitannya dari semua artikel.`,
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
          const response = await fetch(`${API_BASE_URL}/tags/${id_tag}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          const resJson = await response.json();
          if (!response.ok) throw new Error(resJson.message);

          toast.success(resJson.message);
          fetchTags();
        } catch (error) {
          toast.error(error.message);
        }
      }
    });
  };

  return (
    <div className="tags-management-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <PageHeader
        title="Manajemen Tags"
        addLabel="Tambah Tag Baru"
        onAddClick={handleAddTag}
      />

      <TagsToolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "50%" }}>
                <div className="header-cell-content">
                  <span>Nama Tag</span>
                </div>
              </th>
              <th style={{ width: "30%" }}>
                <div className="header-cell-content">
                  <span>Jumlah Artikel</span>
                </div>
              </th>
              <th style={{ width: "20%" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3" className="text-center">
                  Memuat data...
                </td>
              </tr>
            ) : filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <tr key={tag.id_tag}>
                  <td>{tag.nama_tag}</td>
                  <td>{tag.jumlah_artikel} artikel</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        title="Edit"
                        className="action-btn btn-edit"
                        onClick={() => handleEditTag(tag.id_tag, tag.nama_tag)}
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        title="Hapus"
                        className="action-btn btn-delete"
                        onClick={() =>
                          handleDeleteTag(tag.id_tag, tag.nama_tag)
                        }
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  Tidak ada data tags.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default KelolaTags;
