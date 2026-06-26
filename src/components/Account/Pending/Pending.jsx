import { useEffect } from "react";
import { useOrders } from "../../../context/DataContext";
import { OrderCard } from "../OrderCard/OrderCard";
import {
  ErrorBlock,
  Skeleton,
  OrderCardSkeleton,
} from "../../Skeleton/Skeleton";
import "../Account/Account.css";

export function PanelOrders() {
  const {
    orders: pendingOrders,
    loading,
    error,
    cancelOrder,
    confirmDelivery,
    fetchOrdersForStatus,
  } = useOrders("pending");
  useEffect(() => {
    fetchOrdersForStatus("pending");
  }, []);

  return (
    <div className="account-card">
      <div className="account-card__section-title">Đơn hàng hiện tại</div>

      {loading ? (
        <>
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </>
      ) : error ? (
        <ErrorBlock message={error} />
      ) : pendingOrders.length > 0 ? (
        pendingOrders.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            onCancel={cancelOrder}
            onConfirm={confirmDelivery}
            type={"orders"}
          />
        ))
      ) : (
        <div className="account-empty">
          <div className="account-empty__icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="account-empty__text">
            Không có đơn hàng nào đang xử lý
          </div>
        </div>
      )}
    </div>
  );
}
