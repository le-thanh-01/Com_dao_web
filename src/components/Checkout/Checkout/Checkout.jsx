import { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext";
import {
  useAllProducts,
  useOrders,
  useAuth,
} from "../../../context/DataContext";
import { placeOrder, validatePromo } from "../../../../system/api";
import Navbar from "../../Navbar/Navbar";
import Footer from "../../Footer/Footer";
import { Spinner } from "../../Skeleton/Skeleton";
import { QRScannerModal } from "../QRScannerModal/QRScannerModal";
import "./Checkout.css";

/* ─── helpers ─── */
const parsePrice = (str) => {
  if (!str || str === "Miễn phí") return 0;
  return parseInt(str.replace(/[^0-9]/g, ""), 10) || 0;
};

const formatPrice = (num) => num.toLocaleString("vi-VN") + "đ";

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

// const TABLES = [
//   { id: 1, label: "Bàn 1", available: true },
//   { id: 2, label: "Bàn 2", available: true },
//   { id: 3, label: "Bàn 3", available: false },
//   { id: 4, label: "Bàn 4", available: true },
//   { id: 5, label: "Bàn 5", available: false },
//   { id: 6, label: "Bàn 6", available: true },
// ];

/* ─── Toggle switch ─── */
const Toggle = ({ checked, onChange }) => (
  <label className="toggle">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="toggle__slider" />
  </label>
);

/* ─── Qty stepper in table row ─── */
const Stepper = ({ qty, onInc, onDec }) => (
  <div className="co-stepper">
    <button className="co-stepper__btn co-stepper__btn--dec" onClick={onDec}>
      {qty === 1 ? (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      ) : (
        "−"
      )}
    </button>
    <span className="co-stepper__count">{qty}</span>
    <button className="co-stepper__btn co-stepper__btn--inc" onClick={onInc}>
      +
    </button>
  </div>
);

/* ─── Main component ─── */
export default function Checkout({ onNavigate }) {
  const {
    cart,
    handleIncrement,
    handleDecrement,
    handleBedDecrement,
    setQty,
    isBedProduct,
    clearCart,
  } = useCart();
  const products = useAllProducts();
  const { refetch: refetchOrders } = useOrders();
  //check-loginStatus
  const { loginState } = useAuth();
  // Pre-order
  const [note, setNote] = useState("");
  // Payment
  const [payment, setPayment] = useState("bank");
  // Invoice
  const [wantInvoice, setWantInvoice] = useState(false);
  const [invoiceEmail, setInvoiceEmail] = useState("");
  // Promo
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  // Order submission
  const [orderLoading, setOrderLoading] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [QROpen, setQROpen] = useState(false);
  /* ── computed ── */
  const cartItems = products
    .filter((p) => cart[p.id]?.quantity > 0)
    .map((p) => ({
      ...p,
      qty: cart[p.id]?.quantity,
      subtotal: p.price * cart[p.id]?.quantity,
    }));

  const subtotal = cartItems.reduce((s, i) => s + i.subtotal, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const deliveryFee = 0;
  const total = subtotal - discount + deliveryFee;

  const handleApplyPromo = async () => {
    setPromoError("");
    setPromoLoading(true);
    const { data, error } = await validatePromo(promoCode);
    setPromoLoading(false);
    if (error) {
      setPromoError(error);
      return;
    }
    setPromoApplied(true);
  };
  const pushOrder = async (payment_success = false) => {
    setOrderLoading(true);
    const { data, error } = await placeOrder({
      order_items: cartItems.map((i) => ({
        product_id: i.id,
        quantity: i.qty,
      })),
      discount: discount,
      note: note,
    });
    // console.log("CHECKOUTDATA: ", { data: data, error: error });
    setOrderLoading(false);
    //if (!error) {
    if (true) {
      // setOrderId(data.order.id);
      clearCart();
      // refetchOrders();
      setOrdered(true);
    }
  };

  const handleOrder = async () => {
    if (!loginState) {
      onNavigate("login");
      return;
    }
    if (cartItems.length === 0 || orderLoading) return;
    // if (payment == "bank") setQROpen(true);
    else pushOrder(true);
  };

  /* ── success screen ── */
  if (ordered) {
    return (
      <div className="checkout-page">
        <Navbar
          searchValue=""
          onSearchChange={() => {}}
          onNavigate={onNavigate}
          currentPage="checkout"
        />
        <div className="co-success">
          <div className="co-success__icon">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5fdb98"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="co-success__title">Đặt hàng thành công!</h2>
          <p className="co-success__sub">
            Đơn hàng của bạn đã được ghi nhận. Vui lòng vào Tài khoản → Danh
            sách đơn hàng để thực hiện thanh toán
          </p>
          <div className="co-success__order-id">{orderId}</div>
          <button
            className="co-success__btn"
            onClick={() => onNavigate("account/orders")}
          >
            Xem đơn hàng của tôi →
          </button>
          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onClick={() => onNavigate("home")}
          >
            Quay về trang chủ
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── main checkout ── */
  return (
    <div className="checkout-page">
      <Navbar
        searchValue=""
        onSearchChange={() => {}}
        onNavigate={onNavigate}
        currentPage="checkout"
      />

      <div className="checkout-body">
        {/* ══════════ LEFT COLUMN ══════════ */}
        <div>
          {/* 1. Danh sách đơn hàng */}
          <div className="co-card">
            <div className="co-card__head">
              {/* <span className="co-card__head-num">1</span> */}
              <span className="co-card__head-title">Danh sách đơn hàng</span>
            </div>
            <div className="co-card__body">
              {cartItems.length === 0 ? (
                <div className="co-empty">
                  <div className="co-empty__icon">
                    <svg
                      width="52"
                      height="52"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--text-muted)"
                      strokeWidth="1.4"
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                  <div className="co-empty__text">
                    Giỏ hàng của bạn đang trống
                  </div>
                  <button
                    className="co-empty__btn"
                    onClick={() => onNavigate("home")}
                  >
                    Chọn món ngay
                  </button>
                </div>
              ) : (
                <table className="co-table">
                  <thead>
                    <tr>
                      <th>Món ăn</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="co-product">
                            <div className="co-product__emoji">
                              {PRODUCT_EMOJIS[item.id] || "🍽️"}
                            </div>
                            <div>
                              <div className="co-product__name">
                                {item.label}
                                {item.badge && (
                                  <span className="co-product__badge">
                                    {item.badge === "HOT" ? "HOT" : "MỚI"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Stepper
                            qty={item.qty}
                            onInc={(e) => handleIncrement(item.id, e)}
                            onDec={(e) =>
                              isBedProduct(item)
                                ? handleBedDecrement(item.id, e)
                                : handleDecrement(item.id, e)
                            }
                          />
                        </td>
                        <td className="co-price">
                          {item.free ? "Miễn phí" : item.price}
                        </td>
                        <td className="co-subtotal">
                          {item.free ? "—" : formatPrice(item.subtotal)}
                        </td>
                        <td className="co-remove">
                          <button
                            className="co-remove__btn"
                            onClick={() => setQty(item, 0)}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 2. Phương thức thanh toán */}
          <div className="co-card">
            <div className="co-card__head">
              {/* <span className="co-card__head-num">3</span> */}
              <span className="co-card__head-title">
                Phương thức thanh toán
              </span>
            </div>
            <div className="co-card__body">
              <div className="co-payment-options">
                {/* Direct */}
                {/* <div
                  className={`co-payment-opt ${payment === "direct" ? "co-payment-opt--selected" : ""}`}
                  onClick={() => setPayment("direct")}
                >
                  <div className="co-payment-opt__radio">
                    <div className="co-payment-opt__radio-dot" />
                  </div>
                  <div className="co-payment-opt__icon">💵</div>
                  <div className="co-payment-opt__info">
                    <div className="co-payment-opt__title">
                      Thanh toán trực tiếp
                    </div>
                    <div className="co-payment-opt__desc">
                      Thanh toán bằng tiền mặt tại quầy khi nhận món
                    </div>
                  </div>
                </div> */}
                {/* Bank */}
                <div
                  className={`co-payment-opt ${payment === "bank" ? "co-payment-opt--selected" : ""}`}
                  onClick={() => setPayment("bank")}
                >
                  <div className="co-payment-opt__radio">
                    <div className="co-payment-opt__radio-dot" />
                  </div>
                  <div className="co-payment-opt__icon">🏦</div>
                  <div className="co-payment-opt__info">
                    <div className="co-payment-opt__title">
                      Chuyển khoản ngân hàng
                    </div>
                    <div className="co-payment-opt__desc">
                      {`Thực hiện thanh toán trong Tài khoản → Đơn hàng của tôi`}
                    </div>
                  </div>
                </div>
              </div>

              {/* {payment === "bank" && (
                <div className="co-bank-detail">
                  <div className="co-bank-detail__row">
                    <span className="co-bank-detail__label">Ngân hàng</span>
                    <span className="co-bank-detail__value">Vietcombank</span>
                  </div>
                  <div className="co-bank-detail__row">
                    <span className="co-bank-detail__label">Số tài khoản</span>
                    <span className="co-bank-detail__value co-bank-detail__value--accent">
                      1234 5678 9012
                    </span>
                  </div>
                  <div className="co-bank-detail__row">
                    <span className="co-bank-detail__label">Chủ tài khoản</span>
                    <span className="co-bank-detail__value">
                      CONG TY FOOD VN
                    </span>
                  </div>
                  <div className="co-bank-detail__row">
                    <span className="co-bank-detail__label">
                      Nội dung chuyển khoản
                    </span>
                    <span className="co-bank-detail__value co-bank-detail__value--accent">
                      FOOD {Date.now().toString().slice(-6)}
                    </span>
                  </div>
                </div>
              )} */}
            </div>
          </div>

          {/* Ghi chú cho nhà hàng*/}
          <div className="co-field co-field--full">
            <label className="co-field__label">Ghi chú cho nhà hàng</label>
            <input
              className="co-field__input"
              placeholder="VD: cần ghế cho trẻ em, ăn kiêng dị ứng..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* ══════════ RIGHT: Summary ══════════ */}
        <div className="co-summary">
          <div className="co-summary-card">
            <div className="co-summary-card__head">Tổng thanh toán</div>
            <div className="co-summary-card__body">
              {/* Item breakdown */}
              {cartItems.map((item) => (
                <div className="co-summary-row" key={item.id}>
                  <span
                    className="co-summary-row__label"
                    style={{ fontSize: 12 }}
                  >
                    {item.label} × {item.qty}
                  </span>
                  <span
                    className="co-summary-row__value"
                    style={{ fontSize: 12 }}
                  >
                    {item.free ? "—" : formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}

              {cartItems.length > 0 && <div className="co-summary-divider" />}

              <div className="co-summary-row">
                <span className="co-summary-row__label">Tạm tính</span>
                <span className="co-summary-row__value">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="co-summary-row">
                <span className="co-summary-row__label">Phí dịch vụ</span>
                <span className="co-summary-row__value co-summary-row__value--green">
                  Miễn phí
                </span>
              </div>
              {promoApplied && (
                <div className="co-summary-row">
                  <span className="co-summary-row__label">Giảm giá (10%)</span>
                  <span className="co-summary-row__value co-summary-row__value--green">
                    −{formatPrice(discount)}
                  </span>
                </div>
              )}

              {/* Promo */}
              <div className="co-promo">
                <input
                  className="co-promo__input"
                  placeholder="Nhập mã giảm giá..."
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoError("");
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !promoApplied && handleApplyPromo()
                  }
                  disabled={promoApplied}
                />
                <button
                  className="co-promo__btn"
                  onClick={handleApplyPromo}
                  disabled={promoApplied || promoLoading}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  {promoLoading && (
                    <Spinner size={12} color="var(--text-muted)" />
                  )}
                  {promoApplied ? "✓ Áp dụng" : "Áp dụng"}
                </button>
              </div>
              {promoError && (
                <div style={{ fontSize: 11, color: "var(--red)" }}>
                  {promoError}
                </div>
              )}
              {!promoApplied && !promoError && (
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                  Thử mã{" "}
                  <strong style={{ color: "var(--accent)" }}>FOOD10</strong> để
                  giảm 10%
                </div>
              )}

              {/* Total */}
              <div className="co-summary-total">
                <span className="co-summary-total__label">Tổng cộng</span>
                <span className="co-summary-total__value">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                className="co-order-btn"
                onClick={handleOrder}
                disabled={cartItems.length === 0 || orderLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {orderLoading && <Spinner size={16} color="#111" />}
                {orderLoading ? "Đang xử lý..." : "Đặt hàng ngay"}
              </button>

              <p className="co-note">
                Bằng cách đặt hàng, bạn đồng ý với{" "}
                <span style={{ color: "var(--accent)", cursor: "pointer" }}>
                  điều khoản dịch vụ
                </span>{" "}
                của chúng tôi.
              </p>
            </div>
          </div>
        </div>
        {QROpen && (
          <QRScannerModal
            onClose={() => setQROpen(false)}
            pushOrder={pushOrder}
            orderLoading={orderLoading}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}
