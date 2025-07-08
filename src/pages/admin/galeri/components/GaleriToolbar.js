import React from "react";

const GaleriToolbar = ({ gunungFilter, setGunungFilter, gunungList }) => {
  return (
    <div className="toolbar">
      <div className="filter-container">
        <div className="filter-group">
          <label htmlFor="gunungFilter">Filter Berdasarkan Gunung:</label>
          <select
            id="gunungFilter"
            value={gunungFilter}
            onChange={(e) => setGunungFilter(e.target.value)}
          >
            <option value="Semua">Semua Gunung</option>
            {gunungList.map((g) => (
              <option key={g.id_gunung} value={g.nama_gunung}>
                {g.nama_gunung}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default GaleriToolbar;
