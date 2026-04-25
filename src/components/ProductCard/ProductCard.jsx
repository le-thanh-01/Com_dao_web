/**
 * ProductCard.jsx
 * ─────────────────────────────────────────────────────────────────
 * THAY ĐỔI SO VỚI PHIÊN BẢN TRƯỚC:
 *
 * 1. [MỚI] ImagePlaceholder → ProductImage
 *    - Thêm <img> nhận `imageUrl` từ product.imageUrl (trường mới trong api.js)
 *    - Trạng thái `imgLoaded`: ảnh đang tải → ẩn img, hiện shimmer skeleton
 *    - Trạng thái `imgFailed`: ảnh lỗi (onError) → ẩn img, hiện SVG fallback
 *    - Khi ảnh load xong (onLoad): gọi callback `onLoad` lên ProductCard
 *
 * 2. [MỚI] ProductCard nhận prop `onImageLoad(id)`
 *    - Bubble event "ảnh đã load xong" lên ProductGrid để Grid đếm
 *
 * 3. [MỚI] ProductGrid: chờ ảnh load xong trước khi kết thúc skeleton
 *    - Khi prop `loading` (từ DataContext) = true → hiển thị skeleton cards
 *    - Khi `loading` = false nhưng chưa đủ ảnh → vẫn giữ skeleton
 *    - Chỉ ẩn skeleton khi TẤT CẢ ảnh trong grid đã fire onLoad/onError
 *    - Dùng `Set<id>` để đếm: khi size === products.length → reveal grid
 *
 * 4. [GIỮ NGUYÊN] Toàn bộ logic quota, stepper, badge, QuotaBanner
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { ProductCardSkeleton } from "../Skeleton/Skeleton";
import "./ProductCard.css";

/* ═══════════════════════════════════════════
   1. ProductImage — THAY ĐỔI: thay thế ImagePlaceholder tĩnh
      Trước: chỉ render SVG placeholder cố định
      Sau:   render <img> thật + fallback SVG khi lỗi + shimmer khi đang tải
   ═══════════════════════════════════════════ */
const FallbackImg = ({ onShowError }) => {
  // useEffect với mảng rỗng [] đảm bảo hàm chỉ chạy ĐÚNG 1 LẦN
  // ngay khi thẻ SVG này được hiển thị lên giao diện
  useEffect(() => {
    if (onShowError) {
      onShowError();
    }
  }, [onShowError]);
  return (
    <svg
      className="product-card__placeholder"
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
};
function ProductImage({ imageUrl, onLoad }) {
  // THAY ĐỔI: imgLoaded — theo dõi ảnh đã load thành công chưa
  const [imgLoaded, setImgLoaded] = useState(false);
  // THAY ĐỔI: imgFailed — theo dõi ảnh có bị lỗi không (onError)
  const [imgFailed, setImgFailed] = useState(false);

  const handleLoad = () => {
    setImgLoaded(true);
    // THAY ĐỔI: thông báo lên ProductCard (và tiếp tục lên ProductGrid)
    // rằng ảnh này đã load xong — dùng để Grid biết khi nào kết thúc skeleton
    onLoad?.();
  };

  const handleError = () => {
    setImgFailed(true);
    // THAY ĐỔI: kể cả khi lỗi cũng phải gọi onLoad để Grid không bị treo
    // skeleton mãi vì một ảnh không tồn tại
    onLoad?.();
  };

  return (
    <>
      {/* THAY ĐỔI: shimmer overlay hiển thị trong khi ảnh chưa load xong
          Trước: không có, chỉ có SVG tĩnh
          Sau:   shimmer phủ toàn bộ vùng ảnh cho đến khi imgLoaded = true */}
      {!imgLoaded && !imgFailed && (
        <div className="product-card__img-shimmer skeleton" />
      )}

      {/* THAY ĐỔI: thêm <img> thật — hiển thị khi load xong và không lỗi
          opacity transition giúp ảnh fade-in mượt sau khi tải */}
      {!imgFailed && imageUrl && (
        <img
          src={imageUrl}
          alt="Biểu tượng sản phẩm"
          width="11"
          height="11"
          className="product-card__img-real"
          style={{
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* THAY ĐỔI: SVG fallback — chỉ hiện khi ảnh lỗi HOẶC không có imageUrl
          Trước: SVG này luôn hiển thị
          Sau:   chỉ là fallback khi <img> không dùng được */}
      {(imgFailed || !imageUrl) && (
        <FallbackImg onShowError={handleError}></FallbackImg>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════
   Badge — GIỮ NGUYÊN
   ═══════════════════════════════════════════ */
const Badge = ({ type }) => {
  if (!type) return null;
  return (
    <span className={`product-card__badge product-card__badge--${type}`}>
      {type === "hot" ? "HOT" : "MỚI"}
    </span>
  );
};

/* ═══════════════════════════════════════════
   QuotaBanner — GIỮ NGUYÊN
   ═══════════════════════════════════════════ */
function QuotaBanner({ type, quota }) {
  const {
    hasBed,
    totalBeds,
    maxToppings,
    maxDrinks,
    usedToppings,
    usedDrinks,
    toppingFull,
    drinkFull,
  } = quota;

  if (type === "topping") {
    if (!hasBed) {
      return (
        <div className="quota-banner quota-banner--none">
          <span className="quota-banner__icon">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
          <div className="quota-banner__text">
            Chưa có Cơm trong giỏ hàng. Mỗi <strong>Suất</strong> được kèm{" "}
            <strong>2 topping</strong>
            {" (mỗi loại 1 phần)"}.
          </div>
        </div>
      );
    }
    const variant = toppingFull ? "full" : "info";
    const pct = Math.min(100, Math.round((usedToppings / maxToppings) * 100));
    return (
      <div className={`quota-banner quota-banner--${variant}`}>
        <span className="quota-banner__icon">
          {toppingFull ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff7c6e"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <div className="quota-banner__text">
          {toppingFull ? (
            <>
              Đã dùng hết topping. Bạn có <strong>{totalBeds} Suất cơm</strong>{" "}
              → tối đa <strong>{maxToppings} topping</strong>.
            </>
          ) : (
            <>
              Bạn có <strong>{totalBeds} Suất cơm</strong> → được chọn thêm{" "}
              <strong>{maxToppings - usedToppings} topping</strong>
              (còn {maxToppings - usedToppings}/{maxToppings}).
              <br />
              <span style={{ fontSize: "0.9em", opacity: 0.8 }}>
                *Lưu ý: Tối đa <strong>{totalBeds} phần</strong> cho mỗi loại
                topping.
              </span>
            </>
          )}
          <div className="quota-banner__bar">
            <div className="quota-bar">
              <div
                className={`quota-bar__fill ${toppingFull ? "quota-bar__fill--full" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="quota-bar__label">
              {usedToppings}/{maxToppings}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "drink") {
    if (!hasBed) {
      return (
        <div className="quota-banner quota-banner--none">
          <span className="quota-banner__icon">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
          <div className="quota-banner__text">
            Chưa có Cơm trong giỏ hàng. Mỗi <strong>Suất</strong> được kèm{" "}
            <strong>1 đồ uống</strong>.
          </div>
        </div>
      );
    }
    const variant = drinkFull ? "full" : "info";
    const pct = Math.min(100, Math.round((usedDrinks / maxDrinks) * 100));
    return (
      <div className={`quota-banner quota-banner--${variant}`}>
        <span className="quota-banner__icon">
          {drinkFull ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ff7c6e"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
        <div className="quota-banner__text">
          {drinkFull ? (
            <>
              Đã dùng hết đồ uống. Bạn có <strong>{totalBeds} Suất cơm</strong>{" "}
              → tối đa <strong>{maxDrinks} đồ uống</strong>.
            </>
          ) : (
            <>
              Bạn có <strong>{totalBeds} Suất cơm</strong> → được chọn thêm{" "}
              <strong>{maxDrinks - usedDrinks} đồ uống</strong> (còn{" "}
              {maxDrinks - usedDrinks}/{maxDrinks}).
            </>
          )}
          <div className="quota-banner__bar">
            <div className="quota-bar">
              <div
                className={`quota-bar__fill ${drinkFull ? "quota-bar__fill--full" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="quota-bar__label">
              {usedDrinks}/{maxDrinks}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════
   Wrapper helpers — GIỮ NGUYÊN (tránh hook-in-conditional)
   ═══════════════════════════════════════════ */
export function QuotaBannerWrapper({ type }) {
  const { quota } = useCart();
  return <QuotaBanner type={type} quota={quota} />;
}

function EmptyGrid({ showToppingBanner, showDrinkBanner }) {
  const { quota } = useCart();
  return (
    <div className="product-grid">
      {showToppingBanner && <QuotaBanner type="topping" quota={quota} />}
      {showDrinkBanner && <QuotaBanner type="drink" quota={quota} />}
      <div className="product-grid__empty">Không tìm thấy sản phẩm nào</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. ProductCard — THAY ĐỔI: thêm prop `onImageLoad`
      Trước: không có tương tác với trạng thái ảnh
      Sau:   nhận callback onImageLoad(id) để bubble lên ProductGrid
   ═══════════════════════════════════════════ */
export function ProductCard({ product, onImageLoad }) {
  const { getStatus, handleIncrement, handleDecrement, handleBedDecrement } =
    useCart();
  const { blocked, incBlocked, qty } = getStatus(product.id);
  const ImageUrl = `${import.meta.env.BASE_URL}${product.url}`.replace(
    "//",
    "/",
  );

  const isBed = product.cats?.includes("bed");

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
        <div className="product-card__name">{product.name}</div>

        <div className="product-card__bottom">
          <div
            className={`product-card__price ${product.free ? "product-card__price--free" : ""}`}
          >
            {product.price}
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

/* ═══════════════════════════════════════════
   3. ProductGrid — THAY ĐỔI: chờ ảnh load xong trước khi tắt skeleton
      Trước: tắt skeleton ngay khi prop `loading` = false (data đến)
      Sau:   tiếp tục giữ skeleton cho đến khi TẤT CẢ ảnh đã load/fail
   ═══════════════════════════════════════════ */
export function ProductGrid({ products, activeCategory, loading }) {
  const showToppingBanner = activeCategory === "topping";
  const showDrinkBanner = activeCategory === "drink";
  // console.log(products.length);
  // THAY ĐỔI: Set lưu id của các ảnh đã load xong (hoặc lỗi)
  // Dùng useState với Set để trigger re-render khi Set thay đổi
  const [loadedIds, setLoadedIds] = useState(() => new Set());
  // console.log(loadedIds.size);
  // THAY ĐỔI: callback được truyền xuống từng ProductCard
  // Khi một ảnh load xong hoặc fail → thêm id vào Set
  const handleImageLoad = useCallback((id) => {
    setLoadedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const currentLoadedCount = products.filter((p) => loadedIds.has(p.id)).length;
  const showSkeleton =
    loading || (products.length > 0 && currentLoadedCount < products.length);

  // 2. STATE ĐIỀU PHỐI GIAO DIỆN (UI Orchestration)
  // Quản lý việc hiển thị/mờ dần
  const [showReal, setShowReal] = useState(false);
  // Quản lý việc tồn tại trong DOM của Skeleton
  const [mountSkeleton, setMountSkeleton] = useState(true);

  useEffect(() => {
    if (!showSkeleton) {
      // BƯỚC 1: Khi ảnh tải xong, lập tức cho phép Grid thật hiển thị (Opacity lên 1)
      setShowReal(true);

      // BƯỚC 2: Hẹn giờ để gỡ Skeleton khỏi DOM sau khi CSS Transition hoàn tất (300ms)
      const timer = setTimeout(() => {
        setMountSkeleton(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // Khi đổi Tab hoặc đang Loading: Bật lại Skeleton ngay lập tức, Giấu Grid thật đi
      setShowReal(false);
      setMountSkeleton(true);
    }
  }, [showSkeleton]);

  if (!loading && products.length === 0) {
    return (
      <EmptyGrid
        showToppingBanner={showToppingBanner}
        showDrinkBanner={showDrinkBanner}
      />
    );
  }

  return (
    // Wrapper relative để skeleton overlay có thể bám vào
    <div style={{ position: "relative" }}>
      {/* ── LỚP REAL: luôn render để <img> tồn tại trong DOM và load ngầm ──
          visibility: hidden (không display:none) → giữ layout, ảnh vẫn load
          Khi imagesReady → visibility: visible → hiện ra mượt mà            */}
      <div
        className={`product-grid grid-fade-layer ${
          showReal ? "grid-fade-layer--visible" : "grid-fade-layer--hidden"
        }`}
        aria-hidden={showSkeleton}
      >
        {showToppingBanner && <QuotaBannerWrapper type="topping" />}
        {showDrinkBanner && <QuotaBannerWrapper type="drink" />}
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onImageLoad={handleImageLoad}
          />
        ))}
      </div>

      {/* ── LỚP SKELETON: phủ lên trên real grid khi đang chờ ──
          position absolute → không chiếm thêm không gian layout
          pointer-events none → tránh chặn click nếu có race condition
          Unmount hoàn toàn khi showSkeleton = false                          */}
      {showSkeleton && (
        <div
          className={`product-grid grid-fade-layer ${
            showReal ? "grid-fade-layer--hidden" : "grid-fade-layer--visible"
          }`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
          }}
          aria-hidden="true"
        >
          {Array.from({ length: products.length || 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
