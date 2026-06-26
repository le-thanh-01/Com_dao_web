import { useState } from "react";
import { OrderCardSkeleton, Spinner } from "../../Skeleton/Skeleton";
import { QRScannerModal } from "../../Checkout/QRScannerModal/QRScannerModal";
import "./OrderCard.css";
/* ─── helpers ─── */
const STATUS_MAP = {
  FINISHED: { label: "Đã giao", cls: "order-card__status--delivered" },
  CONFIRMED: { label: "Đã nhận đơn", cls: "order-card__status--pending" },
  DELIVERING: { label: "Đang giao", cls: "order-card__status--pending" },
  CANCELLED: { label: "Đã huỷ", cls: "order-card__status--cancelled" },
  PAYING: { label: "Chờ thanh toán", cls: "order-card__status--pending" },
};

const PRODUCT_EMOJIS = {
  1: "🍲",
  2: "🍱",
  3: "🥣",
  4: "🍜",
  5: "✨",
  6: "🥯",
  7: "🍮",
  8: "🥘",
};

/* ─── OrderCard ─── */
export const OrderCard = ({ order, onCancel, onConfirm, type }) => {
  const [QROpen, setQROpen] = useState(false);
  const st = STATUS_MAP[order.state];
  // console.log("type: ", type, "\nonConfirm: ", onConfirm);
  // console.log(order);
  // id của action đang loading trên card này: "cancel" | "confirm" | null
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState("");

  const handleCancel = async () => {
    setActionError("");
    setActionLoading("cancel");
    const { error } = await onCancel(order.id);
    setActionLoading(null);
    if (
      error &&
      error !=
        "Lỗi kết nối: Failed to execute 'json' on 'Response': Unexpected end of JSON input"
    )
      setActionError(error);
  };

  const handleConfirm = async () => {
    setActionError("");
    //confirm này là của khách, không phải trạng thái đã nhận đơn CONFIRMED
    setActionLoading("confirm");
    const result =
      type == "history" ? onConfirm(order.id) : await onConfirm(order.id);
    setActionLoading(null);
    if (result?.error) setActionError(result?.error);
  };

  const canContact =
    order.state === "CONFIRMED" ||
    order.state === "PAYING" ||
    order.state === "DELIVERING" ||
    order.state === "FINISHED";

  return (
    <div className="order-card">
      <div className="order-card__header">
        <div>
          <div className="order-card__id">{order.id}</div>
          <div className="order-card__date">{order.date}</div>
        </div>
        <span className={`order-card__status ${st?.cls}`}>{st?.label}</span>
      </div>

      <div className="order-card__body">
        {order.items.map((item, i) => (
          <div className="order-card__item" key={i}>
            <div className="order-card__item-img">
              {PRODUCT_EMOJIS[item.product.id] || "🍽️"}
            </div>
            <div className="order-card__item-name">
              {item.product.label}
              {item.product.badge && (
                <span className="co-product__badge">
                  {item.product.badge === "HOT" ? "HOT" : "MỚI"}
                </span>
              )}
            </div>
            <div className="order-card__item-qty">x{item.quantity}</div>
            <div className="order-card__item-price">{`${item.product.price} ${item.product.currency}`}</div>
          </div>
        ))}
      </div>

      <div className="order-card__footer">
        <span className="order-card__total-label">Tổng cộng</span>
        <span className="order-card__total">{`${order.total} ${order.currency}`}</span>
      </div>

      {/* Hành động — chỉ hiện khi đơn đang pending và có handler được truyền vào */}
      {canContact && (onCancel || onConfirm) && (
        <div className="order-card__actions">
          {actionError && (
            <div className="order-card__action-error">{actionError}</div>
          )}
          <div className="order-card__action-btns">
            {onCancel && (
              <button
                className="order-card__action-btn order-card__action-btn--cancel"
                onClick={handleCancel}
                disabled={!!actionLoading || order.state === "DELIVERING"}
              >
                {actionLoading === "cancel" ? (
                  <Spinner size={13} color="var(--red)" />
                ) : (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                )}
                Huỷ đơn hàng
              </button>
            )}
            {onConfirm && (
              <button
                className="order-card__action-btn order-card__action-btn--confirm"
                onClick={
                  order.state == "PAYING"
                    ? () => setQROpen(true)
                    : handleConfirm
                }
                disabled={!!actionLoading || order.state == "CONFIRMED"}
              >
                {actionLoading === "confirm" ? (
                  <Spinner size={13} color="#111" />
                ) : (
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
                )}
                {type === "orders"
                  ? order.state == "PAYING"
                    ? "Thanh toán"
                    : "Đã nhận được hàng"
                  : "Nhận hoá đơn qua email"}
              </button>
            )}
          </div>
          {QROpen && (
            <QRScannerModal
              onClose={() => setQROpen(false)}
              orderLoading={false}
              orderId={order.id}
            />
          )}
        </div>
      )}
    </div>
  );
};
