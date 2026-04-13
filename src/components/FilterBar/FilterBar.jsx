import "./FilterBar.css";

const FILTERS = [
  { id: "all",  label: "Tất cả" },
  { id: "new",  label: "Mới" },
];

export default function FilterBar({ activeFilter, onFilterChange }) {
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

      <button className="filter-bar__sort">Giảm giá ↓</button>
    </div>
  );
}
