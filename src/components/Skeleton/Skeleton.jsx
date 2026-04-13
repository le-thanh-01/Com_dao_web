import "./Skeleton.css";

/** Một block skeleton nhấp nháy */
export function Skeleton({
  width = "100%",
  height = "14px",
  radius = "6px",
  className = "",
}) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
    />
  );
}

/** Skeleton card sản phẩm */
export function ProductCardSkeleton() {
  return (
    <div className="skeleton-product-card">
      <div className="skeleton-product-card__image skeleton" />
      <div className="skeleton-product-card__body">
        <Skeleton height="13px" width="80%" />
        <Skeleton height="11px" width="50%" />
        <div className="skeleton-product-card__footer">
          <Skeleton height="13px" width="55px" />
          <Skeleton height="26px" width="60px" radius="99px" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton dòng thông báo */
export function NoticeRowSkeleton() {
  return (
    <div className="skeleton-notice-row">
      <Skeleton
        width="44px"
        height="44px"
        radius="10px"
        className="flex-shrink-0"
      />
      <div className="skeleton-notice-row__body">
        <Skeleton height="10px" width="90px" />
        <Skeleton height="14px" width="70%" />
        <Skeleton height="11px" width="55%" />
      </div>
    </div>
  );
}

/** Skeleton dòng đơn hàng */
export function OrderCardSkeleton() {
  return (
    <div className="skeleton-order-card">
      <div className="skeleton-order-card__head">
        <Skeleton height="12px" width="120px" />
        <Skeleton height="20px" width="70px" radius="99px" />
      </div>
      <div className="skeleton-order-card__body">
        <div className="skeleton-order-card__item">
          <Skeleton width="42px" height="42px" radius="8px" />
          <Skeleton height="13px" width="60%" />
          <Skeleton height="13px" width="60px" />
        </div>
      </div>
      <div className="skeleton-order-card__footer">
        <Skeleton height="12px" width="80px" />
        <Skeleton height="15px" width="90px" />
      </div>
    </div>
  );
}

/** Skeleton block profile form */
export function ProfileSkeleton() {
  return (
    <div className="skeleton-profile">
      <Skeleton
        height="11px"
        width="30%"
        className="skeleton-profile__section-title"
      />
      <div className="skeleton-profile__grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton-profile__field">
            <Skeleton height="10px" width="40%" />
            <Skeleton height="38px" radius="8px" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton sidebar user card */
export function UserCardSkeleton() {
  return (
    <div className="skeleton-user-card">
      <Skeleton width="72px" height="72px" radius="50%" />
      <Skeleton height="15px" width="120px" />
      <Skeleton height="11px" width="90px" />
      <Skeleton height="20px" width="100px" radius="99px" />
    </div>
  );
}

/** Inline spinner */
export function Spinner({ size = 18, color = "var(--accent)" }) {
  return (
    <svg
      className="spinner"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

/** Full-page centered loading */
export function PageLoader({ text = "Đang tải..." }) {
  return (
    <div className="page-loader">
      <Spinner size={32} />
      <span className="page-loader__text">{text}</span>
    </div>
  );
}

/** Error state block */
export function ErrorBlock({ message = "Không thể tải dữ liệu.", onRetry }) {
  return (
    <div className="error-block">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--red)"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span className="error-block__msg">{message}</span>
      {onRetry && (
        <button className="error-block__btn" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
