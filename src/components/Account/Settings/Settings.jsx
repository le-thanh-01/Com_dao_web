import { useState, useEffect } from "react";
import { useUserSettings, useAuth } from "../../../context/DataContext";
import {
  Skeleton,
  Spinner,
  ErrorBlock,
  PageLoader,
} from "../../Skeleton/Skeleton";
import "./Settings.css";
import "../Profile/Profile.css";

const Toggle = ({ checked, onChange }) => (
  <label className="toggle">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="toggle__slider" />
  </label>
);

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

export function PanelSettings() {
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
  const { logout } = useAuth();

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
          <button
            className="account-btn account-btn-primary"
            onClick={() => setPwdOpen(true)}
          >
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
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
