import { useState } from "react";
import Navbar from "../../Navbar/Navbar";
import Footer from "../../Footer/Footer";
import { UserCardSkeleton } from "../../Skeleton/Skeleton";
import { PanelOrders } from "../Pending/Pending";
import { PanelHistory } from "../History/History";
import { PanelSettings } from "../Settings/Settings";
import { PanelProfile } from "../Profile/Profile";
import { OrderCard } from "../OrderCard/OrderCard";
import { useAuth, useUserProfile } from "../../../context/DataContext";
import "./Account.css";

/* ─── Nav items ─── */
const NAV_ITEMS = [
  {
    id: "profile",
    label: "Thông tin cá nhân",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: "orders",
    label: "Thông tin đơn hàng",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "Lịch sử mua hàng",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <polyline points="12 8 12 12 14 14" />
        <path d="M3.05 11a9 9 0 1 0 .5-4.5" />
        <polyline points="3 3 3 9 9 9" />
      </svg>
    ),
  },
];

const PANEL_TITLES = {
  profile: {
    title: "Tài khoản",
    subtitle: "Quản lý thông tin hồ sơ để bảo mật tài khoản",
  },
  settings: {
    title: "Cài đặt",
    subtitle: "Tuỳ chỉnh thông báo và bảo mật tài khoản",
  },
  orders: {
    title: "Thông tin đơn hàng",
    subtitle: "Theo dõi đơn hàng đang được xử lý",
  },
  history: {
    title: "Lịch sử mua hàng",
    subtitle: "Xem lại toàn bộ lịch sử đặt món của bạn",
  },
};

/* ─── Main ─── */
export default function Account({ onNavigate, initialPanel }) {
  const [panel, setPanel] = useState(initialPanel ?? "profile");

  const { loginState, logout: handleLogout } = useAuth();
  const { user, loading: userLoading } = useUserProfile();

  const logout = async () => {
    handleLogout();
    window.location.reload();
  };

  const { title, subtitle } = PANEL_TITLES[panel];
  const displayName = user ? user.full_name : "—";

  return (
    <div className="account-page">
      <Navbar
        searchValue=""
        onSearchChange={() => {}}
        onNavigate={onNavigate}
        currentPage="account"
      />

      <div className="account-body">
        <aside className="account-sidebar">
          {/* Profile card */}
          {userLoading ? (
            <UserCardSkeleton />
          ) : (
            <div className="account-sidebar__profile-card">
              <div className="account-sidebar__avatar">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <div className="account-sidebar__avatar-edit">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
              </div>
              <div className="account-sidebar__name">{displayName}</div>
              <div className="account-sidebar__phone">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.8"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.06 6.06l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {user?.phone ?? "—"}
              </div>
              <span className="account-sidebar__badge">
                {user?.tier ?? "Thành viên"}
              </span>
            </div>
          )}

          {/* Nav */}
          <nav className="account-sidebar__nav">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`account-sidebar__nav-item ${panel === item.id ? "account-sidebar__nav-item--active" : ""}`}
                onClick={() => setPanel(item.id)}
              >
                <span className="account-sidebar__nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
            <div
              className="account-sidebar__nav-item account-sidebar__nav-item--danger"
              onClick={logout}
            >
              <span className="account-sidebar__nav-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              Đăng xuất
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div className="account-content">
          <div className="account-content__header">
            <div>
              <div className="account-content__title">{title}</div>
              <div className="account-content__subtitle">{subtitle}</div>
            </div>
          </div>

          {panel === "profile" && <PanelProfile />}
          {panel === "settings" && <PanelSettings />}
          {panel === "orders" && <PanelOrders />}
          {panel === "history" && <PanelHistory />}
        </div>
      </div>

      <Footer />
    </div>
  );
}
