import { useState } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { addProfile } from "../../context/DataContext";
import "./Register.css";

const INITIAL = {
  lastName: "",
  firstName: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
};

function validate(fields) {
  const errors = {};
  if (!fields.lastName.trim()) errors.lastName = "Vui lòng nhập họ.";
  if (!fields.firstName.trim()) errors.firstName = "Vui lòng nhập tên.";
  if (!fields.email.trim()) errors.email = "Vui lòng nhập email.";
  else if (!/\S+@\S+\.\S+/.test(fields.email))
    errors.email = "Email không hợp lệ.";
  if (!fields.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại.";
  else if (!/^[0-9]{9,11}$/.test(fields.phone.replace(/\s/g, "")))
    errors.phone = "Số điện thoại không hợp lệ.";
  if (!fields.password.trim()) errors.password = "Vui lòng nhập mật khẩu.";
  else if (fields.password.length < 6)
    errors.password = "Mật khẩu tối thiểu 6 ký tự.";
  if (!fields.confirm.trim()) errors.confirm = "Vui lòng xác nhận mật khẩu.";
  else if (fields.confirm !== fields.password)
    errors.confirm = "Mật khẩu không khớp.";
  return errors;
}

const Field = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}) => (
  <div className="register-form__field">
    <label className="register-form__label">{label}</label>
    <input
      className={`register-form__input ${error ? "register-form__input--error" : ""}`}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      autoComplete="off"
    />
    {error && <span className="register-form__error-msg">{error}</span>}
  </div>
);

export default function Register({ onNavigate }) {
  const [fields, setFields] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = () => {
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // TODO: call register API, then redirect
    addProfile(fields);
    onNavigate("login");
  };

  return (
    <div className="register-page">
      <Navbar
        searchValue=""
        onSearchChange={() => {}}
        onNavigate={onNavigate}
      />

      <div className="register-body">
        {/* ── Left: form ── */}
        <div className="register-form-col">
          <h1 className="register-form-col__title">Đăng ký tài khoản</h1>
          <p className="register-form-col__subtitle">Nhập theo yêu cầu</p>

          {/* Row: Họ + Tên */}
          <div className="register-form__row">
            <Field
              label="Họ"
              name="lastName"
              placeholder="Nguyễn"
              value={fields.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
            <Field
              label="Tên"
              name="firstName"
              placeholder="Hùng"
              value={fields.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />
          </div>

          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="email@yourbestservice.net"
            value={fields.email}
            onChange={handleChange}
            error={errors.email}
          />

          <Field
            label="Số điện thoại"
            name="phone"
            type="tel"
            placeholder="0912345678"
            value={fields.phone}
            onChange={handleChange}
            error={errors.phone}
          />

          <Field
            label="Nhập mật khẩu"
            name="password"
            type="password"
            placeholder="••••••••"
            value={fields.password}
            onChange={handleChange}
            error={errors.password}
          />

          <Field
            label="Nhập lại mật khẩu"
            name="confirm"
            type="password"
            placeholder="••••••••"
            value={fields.confirm}
            onChange={handleChange}
            error={errors.confirm}
          />

          <button className="register-form__btn" onClick={handleSubmit}>
            Đăng ký
          </button>

          <p className="register-form__login-link">
            Đã có tài khoản?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("login");
              }}
            >
              Đăng nhập
            </a>
          </p>
        </div>

        {/* ── Right: image ── */}
        <div className="register-image-col">
          <img
            src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80"
            alt="Ẩm thực Việt"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
