import { useCallback } from "react";
import { useCart } from "../../../context/CartContext";
import { QuotaBannerWrapper } from "../Quota/Quota";
import { ProductImage } from "../ProductImage/ProductImage";
import "./ProductCard.css";

/* ═══════════════════════════════════════════
   Badge
   ═══════════════════════════════════════════ */
const Badge = ({ type }) => {
  if (!type) return null;
  return (
    <span className={`product-card__badge product-card__badge--${type}`}>
      {type === "HOT" ? "HOT" : "MỚI"}
    </span>
  );
};

export function ProductCard({ product, onImageLoad }) {
  const {
    getStatus,
    handleIncrement,
    handleDecrement,
    handleBedDecrement,
    isBedProduct,
  } = useCart();
  const { blocked, incBlocked, qty } = getStatus(product.id);
  const ImageUrl = product.image_url;
  // console.log("IMAGEURRLLLL");
  // console.log(ImageUrl);

  const isBed = isBedProduct(product);

  // THAY ĐỔI: dùng handleBedDecrement nếu là sản phẩm set,
  // handleDecrement thông thường cho các loại khác
  const onDecrement = (e) =>
    isBed ? handleBedDecrement(product.id, e) : handleDecrement(product.id, e);

  // THAY ĐỔI: khi ProductImage báo load xong, bubble id lên Grid
  const handleImgLoad = useCallback(() => {
    onImageLoad?.(product.id);
  }, [product.id, onImageLoad]);

  return (
    <div className={`product-card ${blocked ? "product-card--locked" : ""}`}>
      <div className="product-card__image">
        {/* THAY ĐỔI: dùng ProductImage thay vì ImagePlaceholder tĩnh
            Truyền imageUrl từ product data (thêm mới trong api.js)
            Truyền onLoad callback để Grid theo dõi tiến độ ảnh */}
        <ProductImage imageUrl={ImageUrl} onLoad={handleImgLoad} />
        <Badge type={product.badge} />
      </div>

      <div className="product-card__info">
        <div className="product-card__name">{product.label}</div>

        <div className="product-card__bottom">
          <div
            className={`product-card__price ${product.free ? "product-card__price--free" : ""}`}
          >
            {`${product.price} ${product.currency}`}
          </div>

          {qty === 0 ? (
            <button
              className={`product-card__add-btn ${blocked ? "product-card__add-btn--full" : ""}`}
              onClick={(e) => handleIncrement(product.id, e)}
              title={blocked ? "Đã đủ số lượng được phép" : "Thêm vào giỏ"}
            >
              {blocked ? (
                <>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </>
              ) : (
                <>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Thêm
                </>
              )}
            </button>
          ) : (
            <div className="product-card__qty">
              <button
                className="product-card__qty-btn product-card__qty-btn--dec"
                onClick={(e) => onDecrement(e)}
                aria-label="Giảm số lượng"
              >
                {qty === 1 ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                ) : (
                  "−"
                )}
              </button>
              <span className="product-card__qty-count">{qty}</span>
              <button
                className="product-card__qty-btn product-card__qty-btn--inc"
                onClick={(e) => handleIncrement(product.id, e)}
                disabled={incBlocked}
                style={
                  incBlocked ? { opacity: 0.35, cursor: "not-allowed" } : {}
                }
                aria-label="Tăng số lượng"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
