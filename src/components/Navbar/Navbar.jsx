import { useCart } from "../../context/CartContext";
import UserMenu from "../UserMenu/UserMenu";
import { useNotices } from "../../context/DataContext";
import { useState } from "react";
import "./Navbar.css";

const NAV_LINKS = ["Trang chủ", "Thông báo", "CSKH"];

export default function Navbar({
  searchValue,
  onSearchChange,
  onNavigate,
  currentPage,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const { totalItems } = useCart();

  const { unreadCount } = useNotices();

  return (
    <nav className="navbar">
      <span className="navbar__logo" onClick={() => onNavigate?.("home")}>
        𝔽++
      </span>
      <div className="desktop-menu">
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
                  if (link === "CSKH") {
                    // Trả về '/' hoặc '/ten-repo/'
                    const baseUrl = import.meta.env.BASE_URL;
                    const path = `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}help.html`;
                    window.open(path, "_blank");
                  }
                }}
              >
                {link === "Thông báo" ? (
                  <span className="notice-trigger">
                    {link}
                    {unreadCount > 0 && (
                      <span className="notice-trigger__dot" />
                    )}
                  </span>
                ) : (
                  link
                )}
              </a>
            </li>
          ))}
        </ul>

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
      </div>

      <div className="Navbar-icon navbar__right">
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

        <button
          className="mobile-menu-btn navbar__cart-btn"
          onClick={toggleMobileMenu}
        >
          <i className="fa-solid fa-list"></i>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-dropdown">
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
                    if (link === "CSKH") {
                      // Trả về '/' hoặc '/ten-repo/'
                      const baseUrl = import.meta.env.BASE_URL;
                      const path = `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}help.html`;
                      window.open(path, "_blank");
                    }
                  }}
                >
                  {link === "Thông báo" ? (
                    <span className="notice-trigger">
                      {link}
                      {unreadCount > 0 && (
                        <span className="notice-trigger__dot" />
                      )}
                    </span>
                  ) : (
                    link
                  )}
                </a>
              </li>
            ))}
            <li>
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
              </div>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
