import { useEffect, useState } from "react";

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

export function ProductImage({ imageUrl, onLoad }) {
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
  // console.log("imgSrc =", imgSrc);
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
          // width="100%"
          height="100%"
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
