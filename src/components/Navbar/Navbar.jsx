import { useCart } from "../../context/CartContext";
import UserMenu from "../UserMenu/UserMenu";
import { useNotices } from "../../context/DataContext";
import "./Navbar.css";

const NAV_LINKS = ["Trang chủ", "Thông báo", "CSKH"];

export default function Navbar({
  searchValue,
  onSearchChange,
  onNavigate,
  currentPage,
}) {
  const { totalItems } = useCart();

  const { unreadCount } = useNotices();

  return (
    <nav className="navbar">
      <span className="navbar__logo" onClick={() => onNavigate?.("home")}>
        𝔽++
      </span>

      <ul className="navbar__links">
        {NAV_LINKS.map((link) => (
          <li key={link}>
            <a
              href="#"
              className={
                (link === "Trang chủ" && currentPage === "home") ||
                (link === "Thông báo" && currentPage === "notices")
                  ? "active"
                  : ""
              }
              onClick={(e) => {
                e.preventDefault();
                if (link === "Trang chủ") onNavigate?.("home");
                if (link === "Thông báo") onNavigate?.("notices");
                if (link === "CSKH")
                  window.open(
                    "https://le-thanh-01.github.io/game_of_life/",
                    "_blank",
                  );
              }}
            >
              {link === "Thông báo" ? (
                <span className="notice-trigger">
                  {link}
                  {unreadCount > 0 && <span className="notice-trigger__dot" />}
                </span>
              ) : (
                link
              )}
            </a>
          </li>
        ))}
      </ul>

      <div className="navbar__right">
        {onSearchChange && (
          <div className="navbar__search">
            <span className="navbar__search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        {/* Cart icon */}
        <button
          className="navbar__cart-btn"
          onClick={() => onNavigate?.("checkout")}
          aria-label="Giỏ hàng"
        >
          <i className="fa-solid fa-cart-shopping"></i>
          {totalItems > 0 && (
            <span className="navbar__cart-badge">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </button>

        <UserMenu onNavigate={onNavigate} />
      </div>
    </nav>
  );
}
