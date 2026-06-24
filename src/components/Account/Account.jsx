import { useState, useEffect } from "react";
import {
  useUserProfile,
  useOrders,
  useUserSettings,
  useAuth,
  useInvoice,
} from "../../context/DataContext";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import {
  ProfileSkeleton,
  UserCardSkeleton,
  OrderCardSkeleton,
  Skeleton,
  Spinner,
  ErrorBlock,
  PageLoader,
} from "../Skeleton/Skeleton";
import { QRScannerModal } from "../Checkout/Checkout";
import "./Account.css";

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

const Toggle = ({ checked, onChange }) => (
  <label className="toggle">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="toggle__slider" />
  </label>
);

/* ─── OrderCard ─── */

const OrderCard = ({ order, onCancel, onConfirm, type }) => {
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

/* ─── Panels ─── */
function PanelProfile({ onSave }) {
  const { user, loading, error, updateUserProfile } = useUserProfile();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user)
      setForm({ ...user, date_of_birth: deformatDate(user.date_of_birth) });
  }, [user]);

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (k === "phone")
      setForm((p) => ({ ...p, username: "user_" + e.target.value }));
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };
  const deformatDate = (dateStr) => {
    if (!dateStr) return "";

    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  };
  const handleSave = async () => {
    setSaving(true);
    const body = { ...form, date_of_birth: formatDate(form.date_of_birth) };
    const { error } = await updateUserProfile(body);
    setSaving(false);
    if (!error) onSave();
  };

  if (loading) return <ProfileSkeleton />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div className="account-card">
      <div className="account-card__section-title">Thông tin cá nhân</div>
      <div className="account-profile__grid">
        {[
          { label: "Họ Tên", key: "full_name", type: "text" },
          { label: "Email", key: "email", type: "email" },
          {
            label: "Số điện thoại",
            key: "phone",
            type: "tel",
            hint: "Dùng để đăng nhập tài khoản",
          },
          { label: "Ngày sinh", key: "date_of_birth", type: "date" },
        ].map(({ label, key, type, hint }) => (
          <div className="account-field" key={key}>
            <label className="account-field__label">{label}</label>
            <input
              className="account-field__input"
              type={type}
              value={form?.[key] ?? ""}
              onChange={set(key)}
            />
            {hint && <span className="account-field__hint">{hint}</span>}
          </div>
        ))}
        <div className="account-field account-field--full">
          <label className="account-field__label">Địa chỉ giao hàng</label>
          <input
            className="account-field__input"
            value={form?.address ?? ""}
            onChange={set("address")}
          />
        </div>
      </div>
      <div className="account-card__footer">
        <button className="account-btn" onClick={() => setForm({ ...user })}>
          Huỷ
        </button>
        <button
          className="account-btn account-btn--primary"
          onClick={handleSave}
          disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {saving && <Spinner size={14} color="#111" />}
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}

/** input field */
// Ô input có nút ẩn/hiện
const PwdField = ({ label, value, onChange, show, onToggle, placeholder }) => (
  <div className="acc-modal__field">
    <label className="acc-modal__label">{label}</label>
    <div className="acc-modal__pwd-wrap">
      <input
        className="acc-modal__input"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="acc-modal__eye"
          onClick={onToggle}
          tabIndex={-1}
          aria-label={show ? "Ẩn" : "Hiện"}
        >
          {show ? (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      )}
    </div>
  </div>
);

/* ─── ChangePasswordModal ─── */
function ChangePasswordModal({ onClose }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [REQUIRED, setREQUIRED] = useState("");
  const { changePassword } = useUserSettings();

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const handleSubmit = async () => {
    setError("");
    if (!current) return setError("Vui lòng nhập mật khẩu hiện tại.");
    if (current.length < 8)
      return setError("Mật khẩu cũ phải có ít nhất 8 ký tự.");

    if (next.length < 8)
      return setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
    if (next !== confirm) return setError("Mật khẩu xác nhận không khớp.");
    if (next === current)
      return setError("Mật khẩu mới phải khác mật khẩu cũ.");

    setSaving(true);
    // TODO: gọi API đổi mật khẩu thật
    const res = await changePassword({
      old_password: current,
      new_password: next,
    });
    // console.log("changePassword return: ", res);
    setSaving(false);
    if (res.error === "Old password incorrect")
      return setError("Mật khẩu cũ nhập sai. Vui lòng kiểm tra lại.");
    else if (
      res.error !==
      "Lỗi kết nối: Failed to execute 'json' on 'Response': Unexpected end of JSON input"
    )
      return setError("Lỗi phản hồi: " + res.error);
    setDone(true);
  };

  return (
    <div
      className="acc-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="acc-modal">
        <div className="acc-modal__head">
          <div className="acc-modal__head-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.8"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <div className="acc-modal__title">Đổi mật khẩu</div>
            <div className="acc-modal__subtitle">
              Mật khẩu mới phải có ít nhất 6 ký tự
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
          {done ? (
            <div className="acc-modal__success">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5fdb98"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div className="acc-modal__success-text">
                Đổi mật khẩu thành công!
              </div>
              <div className="acc-modal__success-sub">
                Lần đăng nhập tiếp theo dùng mật khẩu mới.
              </div>
            </div>
          ) : (
            <>
              {error && <div className="acc-modal__error">{error}</div>}
              <PwdField
                label="Mật khẩu hiện tại"
                value={current}
                onChange={setCurrent}
                show={showCur}
                onToggle={() => setShowCur((v) => !v)}
                placeholder="Nhập mật khẩu hiện tại"
              />
              <PwdField
                label="Mật khẩu mới"
                value={next}
                onChange={setNext}
                show={showNext}
                onToggle={() => setShowNext((v) => !v)}
                placeholder="Tối thiểu 6 ký tự"
              />
              <PwdField
                label="Xác nhận mật khẩu mới"
                value={confirm}
                onChange={setConfirm}
                show={showCon}
                onToggle={() => setShowCon((v) => !v)}
                placeholder="Nhập lại mật khẩu mới"
              />

              {/* Strength indicator */}
              {/* {next.length > 0 && (
                <div className="acc-modal__strength">
                  <div className="acc-modal__strength-bar">
                    {[1, 2, 3, 4].map((lvl) => {
                      const strength =
                        next.length < 6
                          ? 1
                          : next.length < 10
                            ? 2
                            : /[^a-zA-Z0-9]/.test(next)
                              ? 4
                              : 3;
                      return (
                        <div
                          key={lvl}
                          className="acc-modal__strength-seg"
                          style={{
                            background:
                              lvl <= strength
                                ? [
                                    "",
                                    "var(--red)",
                                    "#e6a817",
                                    "#5fdb98",
                                    "#5fdb98",
                                  ][strength]
                                : "var(--surface2)",
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="acc-modal__strength-label">
                    {next.length < 6
                      ? "Yếu"
                      : next.length < 10
                        ? "Trung bình"
                        : /[^a-zA-Z0-9]/.test(next)
                          ? "Rất mạnh"
                          : "Mạnh"}
                  </span>
                </div>
              )} */}
            </>
          )}
        </div>

        <div className="acc-modal__footer">
          {done ? (
            <button
              className="account-btn account-btn--primary"
              onClick={onClose}
            >
              Đóng
            </button>
          ) : (
            <>
              <button className="account-btn" onClick={onClose}>
                Huỷ
              </button>
              <button
                className="account-btn account-btn--primary"
                onClick={handleSubmit}
                disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {saving && <Spinner size={14} color="#111" />}
                {saving ? "Đang lưu..." : "Xác nhận"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── DeleteAccountModal ─── */
function DeleteAccountModal({ onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [REQUIRED, setREQUIRED] = useState("");
  const [error, setError] = useState("");
  const { deleteUser } = useUserSettings();

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const handleDelete = async () => {
    if (!confirmText) return setError("Vui lòng nhập mật khẩu hiện tại.");
    if (confirmText.length < 8)
      return setError("Mật khẩu phải có ít nhất 8 ký tự.");
    setDeleting(true);

    // TODO: gọi API xoá tài khoản thật
    const res = await deleteUser({ password: confirmText });
    console.log("delusser return: ", res);
    setDeleting(false);
    if (res.error === "Old password incorrect")
      return setError("Sai mật khẩu. Vui lòng kiểm tra lại.");
    else if (
      res.error !==
      "Lỗi kết nối: Failed to execute 'json' on 'Response': Unexpected end of JSON input"
    )
      return setError("Lỗi phản hồi: " + res.error);
    onConfirm();
  };

  if (deleting) return <PageLoader></PageLoader>;

  return (
    <div
      className="acc-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="acc-modal acc-modal--danger">
        <div className="acc-modal__head">
          <div className="acc-modal__head-icon acc-modal__head-icon--danger">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--red)"
              strokeWidth="1.8"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div>
            <div className="acc-modal__title">Xoá tài khoản</div>
            <div className="acc-modal__subtitle acc-modal__subtitle--danger">
              Hành động này không thể hoàn tác
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
          <div className="acc-modal__warning-box">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--red)"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <div className="acc-modal__warning-title">
                Bạn sẽ mất vĩnh viễn:
              </div>
              <ul className="acc-modal__warning-list">
                <li>Toàn bộ thông tin tài khoản và hồ sơ cá nhân</li>
                <li>Lịch sử đơn hàng và ưu đãi tích luỹ</li>
                <li>Cài đặt và tuỳ chỉnh đã lưu</li>
              </ul>
            </div>
          </div>

          <div className="acc-modal__field">
            <label className="acc-modal__label">
              Nhập{" "}
              <strong style={{ color: "var(--red)", letterSpacing: "0.5px" }}>
                Mật khẩu
              </strong>{" "}
              để xác nhận:
            </label>
            <input
              className="acc-modal__input acc-modal__input--danger"
              type="text"
              placeholder={"Mật khẩu: "}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoFocus
            />
          </div>
          {error && <div className="acc-modal__error">{error}</div>}
        </div>

        <div className="acc-modal__footer">
          <button className="account-btn" onClick={onClose}>
            Huỷ bỏ
          </button>
          <button
            className="account-btn account-btn--danger"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              // opacity: ready ? 1 : 0.4,
            }}
          >
            {deleting && <Spinner size={14} color="#fff" />}
            {deleting ? "Đang xoá..." : "Xoá tài khoản"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PanelSettings(logout) {
  const {
    settings: userSettings,
    loading,
    error,
    updateUserSettings,
  } = useUserSettings();

  const [form, setForm] = useState(null);
  const [savingKey, setSavingKey] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [pwdOpen, setPwdOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);

  useEffect(() => {
    if (userSettings && !form) {
      setForm({ ...userSettings });
      // console.log("USERSETTING: ", userSettings);
      document.documentElement.classList.toggle(
        "light",
        !userSettings.use_dark_mode,
      );
    }
  }, [userSettings]);

  const handleToggle = async (key) => {
    const oldVal = form[key];
    const newVal = !oldVal;
    setForm((prev) => ({ ...prev, [key]: newVal }));

    if (key === "use_dark_mode") {
      document.documentElement.classList.toggle("light", !newVal);
    }

    // 3. Envia ao servidor
    setSavingKey(key);
    const { error: saveError } = await updateUserSettings({
      ...form,
      [key]: newVal,
    });
    setSavingKey(null);

    if (saveError) {
      // 4a. Revert em caso de erro — desfaz atualização otimista
      setForm((prev) => ({ ...prev, [key]: oldVal }));
      if (key === "use_dark_mode") {
        document.documentElement.classList.toggle("light", !oldVal);
      }
      setFeedback((prev) => ({ ...prev, [key]: "error" }));
    } else {
      // 4b. Feedback de sucesso temporário
      setFeedback((prev) => ({ ...prev, [key]: "ok" }));
    }
    // Limpa feedback após 2s
    setTimeout(() => setFeedback((prev) => ({ ...prev, [key]: null })), 2000);
  };
  // console.log("form: ", form);
  const ROWS = [
    {
      key: "should_notify",
      label: "Thông báo đơn hàng",
      desc: "Nhận thông báo khi đơn hàng thay đổi trạng thái",
    },
    {
      key: "use_sms",
      label: "Thông báo SMS",
      desc: "Nhận tin nhắn xác nhận qua số điện thoại",
    },
    {
      key: "include_promotion",
      label: "Khuyến mãi & ưu đãi",
      desc: "Nhận thông tin về chương trình khuyến mãi mới nhất",
    },
    {
      key: "use_dark_mode",
      label: "Giao diện tối",
      desc: "Sử dụng chủ đề tối cho giao diện",
    },
    {
      key: "use_two_step_verification",
      label: "Xác thực 2 bước (2FA)",
      desc: "Bảo mật tài khoản bằng mã OTP mỗi lần đăng nhập",
    },
  ];

  // Skeleton khi đang tải cài đặt lần đầu
  if (loading || !form) {
    return (
      <div className="account-card">
        <div className="account-card__section-title">Cài đặt tài khoản</div>
        {ROWS.map((r) => (
          <div className="account-setting-row" key={r.key}>
            <div className="account-setting-row__info">
              <Skeleton height="13px" width="160px" />
              <Skeleton height="11px" width="260px" style={{ marginTop: 5 }} />
            </div>
            <Skeleton height="22px" width="40px" radius="99px" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <ErrorBlock message={error} />;

  return (
    <div className="account-card">
      <div className="account-card__section-title">Cài đặt tài khoản</div>

      {ROWS.map(({ key, label, desc }) => {
        const isSaving = savingKey === key;
        const fb = feedback[key];
        return (
          <div className="account-setting-row" key={key}>
            <div className="account-setting-row__info">
              <div
                className="account-setting-row__label"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {label}
                {/* Spinner enquanto salva este toggle */}
                {isSaving && <Spinner size={12} color="var(--text-dim)" />}
                {/* Ícone de feedback — verde OK, vermelho erro */}
                {!isSaving && fb === "ok" && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#5fdb98"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {!isSaving && fb === "error" && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--red)"
                    strokeWidth="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </div>
              <div className="account-setting-row__desc">{desc}</div>
            </div>
            <Toggle
              checked={form[key]}
              // Desativa enquanto algum outro toggle está sendo salvo
              onChange={() => !savingKey && handleToggle(key)}
            />
          </div>
        );
      })}

      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          className="account-card__section-title"
          style={{ marginBottom: 12 }}
        >
          Bảo mật
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="account-btn" onClick={() => setPwdOpen(true)}>
            Đổi mật khẩu
          </button>
          <button
            className="account-btn account-btn--danger"
            onClick={() => setDelOpen(true)}
          >
            Xoá tài khoản
          </button>
        </div>
      </div>

      {pwdOpen && <ChangePasswordModal onClose={() => setPwdOpen(false)} />}
      {delOpen && (
        <DeleteAccountModal
          onClose={() => setDelOpen(false)}
          onConfirm={() => {
            setDelOpen(false);
            logout();
          }}
        />
      )}
    </div>
  );
}

function PanelOrders() {
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

function PanelHistory() {
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

/* ─── Nav items ─── */
const NAV_ITEMS = [
  {
    id: "profile",
    label: "Thông tin cá nhân",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Cài đặt",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: "orders",
    label: "Thông tin đơn hàng",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "Lịch sử mua hàng",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <polyline points="12 8 12 12 14 14" />
        <path d="M3.05 11a9 9 0 1 0 .5-4.5" />
        <polyline points="3 3 3 9 9 9" />
      </svg>
    ),
  },
];

const PANEL_TITLES = {
  profile: {
    title: "Tài khoản",
    subtitle: "Quản lý thông tin hồ sơ để bảo mật tài khoản",
  },
  settings: {
    title: "Cài đặt",
    subtitle: "Tuỳ chỉnh thông báo và bảo mật tài khoản",
  },
  orders: {
    title: "Thông tin đơn hàng",
    subtitle: "Theo dõi đơn hàng đang được xử lý",
  },
  history: {
    title: "Lịch sử mua hàng",
    subtitle: "Xem lại toàn bộ lịch sử đặt món của bạn",
  },
};

/* ─── Main ─── */
export default function Account({ onNavigate, initialPanel }) {
  const [panel, setPanel] = useState(initialPanel ?? "profile");
  const [toast, setToast] = useState("");
  const { loginState, logout: handleLogout } = useAuth();
  const { user, loading: userLoading } = useUserProfile();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };
  const logout = async () => {
    handleLogout();
    window.location.reload();
  };

  const { title, subtitle } = PANEL_TITLES[panel];
  const displayName = user ? user.full_name : "—";

  return (
    <div className="account-page">
      <Navbar
        searchValue=""
        onSearchChange={() => {}}
        onNavigate={onNavigate}
        currentPage="account"
      />

      <div className="account-body">
        <aside className="account-sidebar">
          {/* Profile card */}
          {userLoading ? (
            <UserCardSkeleton />
          ) : (
            <div className="account-sidebar__profile-card">
              <div className="account-sidebar__avatar">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <div className="account-sidebar__avatar-edit">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
              </div>
              <div className="account-sidebar__name">{displayName}</div>
              <div className="account-sidebar__phone">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.8"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.06 6.06l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {user?.phone ?? "—"}
              </div>
              <span className="account-sidebar__badge">
                {user?.tier ?? "Thành viên"}
              </span>
            </div>
          )}

          {/* Nav */}
          <nav className="account-sidebar__nav">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`account-sidebar__nav-item ${panel === item.id ? "account-sidebar__nav-item--active" : ""}`}
                onClick={() => setPanel(item.id)}
              >
                <span className="account-sidebar__nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
            <div
              className="account-sidebar__nav-item account-sidebar__nav-item--danger"
              onClick={logout}
            >
              <span className="account-sidebar__nav-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              Đăng xuất
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div className="account-content">
          <div className="account-content__header">
            <div>
              <div className="account-content__title">{title}</div>
              <div className="account-content__subtitle">{subtitle}</div>
            </div>
          </div>

          {panel === "profile" && (
            <PanelProfile
              onSave={() => showToast("✓ Thông tin đã được cập nhật!")}
            />
          )}
          {panel === "settings" && <PanelSettings logout={logout} />}
          {panel === "orders" && <PanelOrders />}
          {panel === "history" && <PanelHistory />}
        </div>
      </div>

      <Footer />

      {toast && (
        <div className="account-toast">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
