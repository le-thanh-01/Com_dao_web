import { useState, useEffect } from "react";
import { ProfileSkeleton, Spinner, ErrorBlock } from "../../Skeleton/Skeleton";
import { useUserProfile } from "../../../context/DataContext";
import { useToast } from "../../../context/ToastContext";
import "./Profile.css";

/* ─── Panels ─── */
export function PanelProfile() {
  const { user, loading, error, updateUserProfile } = useUserProfile();
  const [form, setForm] = useState(null);
  const { showToast } = useToast();
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
    if (!error) showToast("Thông tin đã được cập nhật!", "success");
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
