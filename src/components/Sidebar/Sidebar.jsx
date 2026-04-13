import "./Sidebar.css";

export default function Sidebar({
  categories,
  activeCategory,
  onCategoryChange,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar__label">Danh mục</div>

      {categories.map((cat) => (
        <div
          key={cat.id}
          className={`sidebar__item ${activeCategory === cat.id ? "sidebar__item--active" : ""}`}
          onClick={() => onCategoryChange(cat.id)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {cat.label}
        </div>
      ))}
    </aside>
  );
}
