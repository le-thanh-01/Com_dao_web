import { useEffect } from "react";
import {
  Skeleton,
  ErrorBlock,
  OrderCardSkeleton,
} from "../../Skeleton/Skeleton";
import { useOrders, useInvoice } from "../../../context/DataContext";
import { OrderCard } from "../OrderCard/OrderCard";
import "../Account/Account.css";
import "./History.css";

export function PanelHistory() {
  const {
    orders: historyOrders,
    loading,
    error,
    fetchOrdersForStatus,
  } = useOrders("history");
  // console.log("historyorder: ", historyOrders);
  const { invoiceRequest } = useInvoice();
  const delivered = historyOrders.filter((o) => o.state === "FINISHED");
  const cancelled = historyOrders.filter((o) => o.state === "CANCELLED");
  useEffect(() => {
    fetchOrdersForStatus("history");
  }, []);
  return (
    <>
      <div className="account-stats">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="account-stat"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Skeleton height="30px" width="60px" />
              <Skeleton height="10px" width="80px" />
            </div>
          ))
        ) : (
          <>
            <div className="account-stat">
              <div className="account-stat__value">{delivered.length}</div>
              <div className="account-stat__label">Đơn thành công</div>
            </div>
            <div className="account-stat">
              <div className="account-stat__value">
                {delivered
                  .reduce((s, o) => s + o.total, 0)
                  .toLocaleString("vi-VN")}
                đ
              </div>
              <div className="account-stat__label">Tổng chi tiêu</div>
            </div>
            <div className="account-stat">
              <div className="account-stat__value">{cancelled.length}</div>
              <div className="account-stat__label">Đơn đã huỷ</div>
            </div>
          </>
        )}
      </div>

      <div className="account-card">
        <div className="account-card__section-title">Lịch sử đơn hàng</div>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)
        ) : error ? (
          <ErrorBlock message={error} />
        ) : historyOrders.length === 0 ? (
          <div className="account-empty">
            <div className="account-empty__text" style={{ padding: "32px 0" }}>
              Chưa có đơn hàng nào
            </div>
          </div>
        ) : (
          historyOrders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onConfirm={invoiceRequest}
              type={"history"}
            />
          ))
        )}
      </div>
    </>
  );
}
