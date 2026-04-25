import "./FilterBar.css";
import { useState } from "react";

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "new", label: "Mới" },
];

export default function FilterBar({
  activeFilter,
  onFilterChange,
  activeSort,
  onSortChange,
}) {
  //false là giảm dần, true là tăng dần
  const [sort_type, setSortType] = useState(false);
  return (
    <div className="filter-bar">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          className={`filter-bar__btn ${activeFilter === f.id ? "filter-bar__btn--active" : ""}`}
          onClick={() => onFilterChange(f.id)}
        >
          {f.label}
        </button>
      ))}

      <div className="filter-bar__divider" />

      <button
        className={`filter-bar__promo ${activeFilter === "promo" ? "filter-bar__promo--active" : ""}`}
        onClick={() => onFilterChange("promo")}
      >
        <span className="filter-bar__promo-dot" />
        Chương trình khuyến mãi
      </button>

      <button
        className="filter-bar__sort"
        onClick={() => {
          setSortType(!sort_type);
          onSortChange(sort_type ? "asc" : "desc");
        }}
      >
        {sort_type ? "↓" : "↑"}
      </button>
    </div>
  );
}
