// src/pages/admin/poi/components/PoiToolbar.js
import React from "react";

const PoiToolbar = ({
  searchTerm,
  setSearchTerm,
  tipeFilter,
  setTipeFilter,
  jalurFilter,
  setJalurFilter,
  airFilter,
  setAirFilter,
  uniqueTipeList,
  jalurList,
  filterJalurId,
  onShowAllPoi,
}) => {
  return (
    <div className="toolbar">
      <div className="search-container">
        <div className="input-wrapper-icon">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Cari POI (nama, gunung, jalur)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-container">
        <div className="filter-group">
          <label>Tipe:</label>
          <select
            value={tipeFilter}
            onChange={(e) => setTipeFilter(e.target.value)}
          >
            <option value="Semua">Semua Tipe</option>
            {uniqueTipeList.map((tipe) => (
              <option key={tipe} value={tipe}>
                {tipe}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Jalur:</label>
          <select
            value={jalurFilter}
            onChange={(e) => setJalurFilter(e.target.value)}
            disabled={!!filterJalurId}
          >
            <option value="Semua">Semua Jalur</option>
            {jalurList.map((jalur) => (
              <option key={jalur.id_jalur} value={jalur.id_jalur}>
                {jalur.nama_jalur} ({jalur.nama_gunung})
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sumber Air:</label>
          <select
            value={airFilter}
            onChange={(e) => setAirFilter(e.target.value)}
          >
            <option value="Semua">Semua</option>
            <option value="Tersedia">Tersedia</option>
            <option value="Tidak Ada">Tidak Ada</option>
          </select>
        </div>

        {filterJalurId && (
          <button className="btn-secondary" onClick={onShowAllPoi}>
            Tampilkan Semua POI
          </button>
        )}
      </div>
    </div>
  );
};

export default PoiToolbar;
