import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useUserQR } from "../../../context/DataContext";
import { Spinner } from "../../Skeleton/Skeleton";
import "./QRScannerModal.css";
function QRScanner(orderId = 1) {
  const { loading, fetchQR } = useUserQR();
  const [QRLink, setQRLink] = useState(null);
  useEffect(() => {
    if (!orderId) return;

    const targetId = typeof orderId === "object" ? orderId.id : orderId;
    // console.log("TẢGETID: ", targetId);
    const loadQR = async () => {
      const { data, error } = await fetchQR(targetId);
      if (!error) {
        setQRLink(data.qr_code);
        // console.log("Dữ liệu QRLink: ", { data, error });
      } else {
        // console.error("Lỗi từ QRScanner: ", error);
      }
    };

    loadQR();
  }, [fetchQR]);

  return (
    <>
      <div className="co-bank-qr__box">
        {QRLink ? (
          <QRCodeSVG
            value={QRLink}
            size={250} // Kích thước cạnh của ma trận (pixel)
            bgColor={"#ffffff"} // Mã màu nền (Hex)
            fgColor={"#000000"} // Mã màu của các module (điểm ảnh QR)
            level={"M"} // Mức độ nội suy sửa lỗi (Error Correction)
          />
        ) : (
          !loading && <div className="co-bank-qr__box">🔳</div>
        )}
      </div>

      {loading && (
        <div>
          <Spinner size={14} color="#111" />
          {/* <div className="co-bank-qr__box">🔳</div> */}
        </div>
      )}
    </>
  );
}
export function QRScannerModal({
  onClose,
  pushOrder = onClose,
  orderLoading,
  orderId = 1,
}) {
  // Trả về '/' hoặc '/ten-repo/'
  const baseUrl = import.meta.env.BASE_URL;
  const path = `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}pages/help.html`;
  return (
    <div
      className="acc-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="acc-modal">
        <div className="acc-modal__head ">
          <div className="title-center">
            <div className="acc-modal__title">Thanh toán</div>
            <div className="acc-modal__subtitle">
              Vui lòng quét mã QR dưới đây để thanh toán
            </div>
          </div>
          <button
            className="acc-modal__close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="acc-modal__body">
          <div>
            <div className="co-bank-qr">
              <QRScanner id={orderId} />
            </div>
          </div>
        </div>
        <div className="QR-notices">
          <ul>
            <li>
              <p>
                Đơn hàng sẽ được xử lý sau khoảng 5 phút kể từ khi thanh toán
                thành công.
              </p>
            </li>
            <li>
              <p>
                Nếu trang web chưa cập nhật sau khi thanh toán, vui lòng reload
                lại trang.
              </p>
            </li>
            <li>
              <p>
                Trường hợp gặp sự cố khi thanh toán, vui lòng
                <strong> reload lại trang</strong>,
                <strong> kiểm tra tình trạng mạng </strong>
                hoặc{" "}
                <a href={path} target="_blank" rel="noopener noreferrer">
                  <strong> liên hệ CSKH</strong>
                </a>
                .
              </p>
            </li>
          </ul>
        </div>
        <div className="acc-modal__footer">
          {
            <>
              <button className="account-btn" onClick={onClose}>
                Huỷ
              </button>
              <button
                className="account-btn account-btn--primary"
                onClick={() => pushOrder(false)}
                disabled={orderLoading}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {orderLoading && <Spinner size={14} color="#111" />}
                {orderLoading ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </>
          }
        </div>
      </div>
    </div>
  );
}
