import { useState, useCallback, useEffect, useRef } from "react";
import { useCart } from "../../../context/CartContext";
import { ProductCardSkeleton } from "../../Skeleton/Skeleton";
import { ProductCard } from "../ProductCard/ProductCard";
import { QuotaBannerWrapper } from "../Quota/Quota";
import "./ProductGrid.css";

function EmptyGrid({ showToppingBanner, showDrinkBanner }) {
  const { quota } = useCart();
  return (
    <div className="product-grid">
      {showToppingBanner && <QuotaBannerWrapper type="topping" quota={quota} />}
      {showDrinkBanner && <QuotaBannerWrapper type="drink" quota={quota} />}
      <div className="product-grid__empty">Không tìm thấy sản phẩm nào</div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. ProductGrid — THAY ĐỔI: chờ ảnh load xong trước khi tắt skeleton
      Trước: tắt skeleton ngay khi prop `loading` = false (data đến)
      Sau:   tiếp tục giữ skeleton cho đến khi TẤT CẢ ảnh đã load/fail
   ═══════════════════════════════════════════ */
export function ProductGrid({
  products,
  activeCategory,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore, // callback khi sentinel visible
}) {
  const showToppingBanner = activeCategory === "topping";
  const showDrinkBanner = activeCategory === "drink";
  // console.log(products.length);
  // Dùng useState với Set để trigger re-render khi Set thay đổi
  const [loadedIds, setLoadedIds] = useState(() => new Set());
  // console.log(loadedIds.size);
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

  /* ── IntersectionObserver sentinel ──
     Khi sentinel cuối grid vào viewport VÀ còn trang → gọi onLoadMore.
     Chỉ observe khi không đang loading và hasMore = true.           */
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!onLoadMore || !hasMore || showSkeleton || loadingMore) return;

    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "120px" }, // bắt đầu fetch trước khi chạm đáy 120px
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, showSkeleton, loadingMore, onLoadMore]);

  if (!loading && products.length === 0) {
    return (
      <EmptyGrid
        showToppingBanner={showToppingBanner}
        showDrinkBanner={showDrinkBanner}
      />
    );
  }

  return (
    <div style={{ position: "relative" }}>
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

      {/* ── LỚP SKELETON:
       */}
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

      {/* Skeleton "load more"  */}
      {loadingMore && (
        <div className="product-grid" style={{ marginTop: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {hasMore && !loadingMore && (
        <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
      )}
    </div>
  );
}
