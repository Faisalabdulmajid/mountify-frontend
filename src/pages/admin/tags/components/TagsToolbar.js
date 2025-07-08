import React from "react";

const TagsToolbar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="toolbar">
      <div className="search-container">
        <div className="input-wrapper-icon">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Cari nama tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default TagsToolbar;
