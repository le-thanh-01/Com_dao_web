import { useState, useEffect } from "react";
import { useNotices } from "../../context/DataContext";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { NoticeRowSkeleton, ErrorBlock } from "../Skeleton/Skeleton";
import "./Notice.css";

const TYPE_ICON = { promo: "🎁", system: "⚙️", order: "📦" };
const TYPE_LABEL = {
  promo: "Khuyến mãi",
  system: "Hệ thống",
  order: "Đơn hàng",
};

const formatDate = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const groupByMonth = (items) => {
  const groups = {};
  items.forEach((n) => {
    const [y, m] = n.date.split("-");
    const key = `${m}/${y}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  return Object.entries(groups);
};

/* ─── Detail Modal ─── */
function NoticeModal({ notice, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="notice-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="notice-modal">
        <div className="notice-modal__head">
          <div
            className={`notice-modal__icon notice-modal__icon--${notice.type}`}
          >
            {TYPE_ICON[notice.type]}
          </div>
          <div className="notice-modal__meta">
            <div className="notice-modal__title">{notice.title}</div>
            <div className="notice-modal__info">
              <span className="notice-modal__date">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDate(notice.date)}
              </span>
              <span
                className={`notice-modal__type-badge notice-modal__type-badge--${notice.type}`}
              >
                {TYPE_LABEL[notice.type]}
              </span>
            </div>
          </div>
          <button className="notice-modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="notice-modal__body">
          <div className="notice-modal__content">{notice.content}</div>
        </div>
        <div className="notice-modal__footer">
          <button className="notice-modal__btn" onClick={onClose}>
            Đóng
          </button>
          {notice.type === "promo" && (
            <button className="notice-modal__btn notice-modal__btn--primary">
              Dùng ngay ↗
            </button>
          )}
          {notice.type === "order" && (
            <button className="notice-modal__btn notice-modal__btn--primary">
              Xem đơn hàng ↗
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Full-page Notice ─── */
export default function NoticePage({ onNavigate }) {
  const { notices, loading, error, markRead, markAllRead, unreadCount } =
    useNotices();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = notices.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "all") return true;
    return n.type === filter;
  });

  const grouped = groupByMonth(filtered);

  const handleItemClick = async (notice) => {
    await markRead(notice.id);
    setSelected(notice);
  };

  const TABS = [
    { id: "all", label: "Tất cả" },
    {
      id: "unread",
      label: `Chưa đọc${unreadCount > 0 ? ` (${unreadCount})` : ""}`,
    },
    { id: "promo", label: "Khuyến mãi" },
    { id: "order", label: "Đơn hàng" },
    { id: "system", label: "Hệ thống" },
  ];

  return (
    <div className="notice-page">
      <Navbar
        searchValue=""
        onSearchChange={() => {}}
        onNavigate={onNavigate}
        currentPage="notices"
      />

      <div className="notice-body">
        <div className="notice-page__header">
          <div>
            <h1 className="notice-page__title">Thông báo</h1>
            <p className="notice-page__subtitle">
              Tất cả thông báo trong 3 tháng gần nhất
            </p>
          </div>
          {!loading && unreadCount > 0 && (
            <button className="notice-page__mark-all" onClick={markAllRead}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div className="notice-layout">
          {/* Sidebar */}
          <aside className="notice-sidebar">
            <div className="notice-sidebar__label">Lọc theo loại</div>
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`notice-sidebar__item ${filter === t.id ? "notice-sidebar__item--active" : ""}`}
                onClick={() => setFilter(t.id)}
              >
                <span className="notice-sidebar__item-icon">
                  {t.id === "all" && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  )}
                  {t.id === "unread" && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                  {t.id === "promo" && <span>🎁</span>}
                  {t.id === "order" && <span>📦</span>}
                  {t.id === "system" && <span>⚙️</span>}
                </span>
                {t.label}
              </button>
            ))}
          </aside>

          {/* List */}
          <div className="notice-list-col">
            {error ? (
              <ErrorBlock message={error} />
            ) : loading ? (
              <div className="notice-group">
                <div className="notice-group__label">Đang tải...</div>
                <div className="notice-group__items">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <NoticeRowSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : grouped.length === 0 ? (
              <div className="notice-list-empty">
                <svg
                  width="52"
                  height="52"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-muted)"
                  strokeWidth="1.3"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>Không có thông báo nào</span>
              </div>
            ) : (
              grouped.map(([month, items]) => (
                <div key={month} className="notice-group">
                  <div className="notice-group__label">Tháng {month}</div>
                  <div className="notice-group__items">
                    {items.map((notice) => (
                      <div
                        key={notice.id}
                        className={`notice-row ${!notice.read ? "notice-row--unread" : ""}`}
                        onClick={() => handleItemClick(notice)}
                      >
                        <div
                          className={`notice-row__icon notice-row__icon--${notice.type}`}
                        >
                          {TYPE_ICON[notice.type]}
                        </div>
                        <div className="notice-row__body">
                          <div className="notice-row__top">
                            <span
                              className={`notice-row__type-badge notice-row__type-badge--${notice.type}`}
                            >
                              {TYPE_LABEL[notice.type]}
                            </span>
                            <span className="notice-row__date">
                              {formatDate(notice.date)}
                            </span>
                          </div>
                          <div className="notice-row__title">
                            {notice.title}
                          </div>
                          <div className="notice-row__summary">
                            {notice.summary}
                          </div>
                        </div>
                        <div className="notice-row__right">
                          {!notice.read && <span className="notice-row__dot" />}
                          <svg
                            className="notice-row__arrow"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
      {selected && (
        <NoticeModal notice={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
