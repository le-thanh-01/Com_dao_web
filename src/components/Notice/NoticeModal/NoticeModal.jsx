import { useEffect } from "react";
import "./NoticeModal.css";

export const TYPE_ICON = { PROMO: "🎁", SYSTEM: "⚙️", ORDER: "📦" };
export const TYPE_LABEL = {
  PROMO: "Khuyến mãi",
  SYSTEM: "Hệ thống",
  ORDER: "Đơn hàng",
};

export const formatDate = (iso) => {
  const datePart = iso.split(" ")[1];
  const [d, m, y] = datePart.split("-");
  return `${d}/${m}/${y}`;
};
/* ─── Detail Modal ─── */
export function NoticeModal({ notice, onClose, onNavigate }) {
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
                {formatDate(notice.created)}
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
          {/* {notice.type === "PROMO" && (
            <button className="notice-modal__btn notice-modal__btn--primary">
              Dùng ngay ↗
            </button>
          )} */}
          {notice.type === "ORDER" && (
            <button
              className="notice-modal__btn notice-modal__btn--primary"
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.("account/history");
              }}
            >
              Xem đơn hàng ↗
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
