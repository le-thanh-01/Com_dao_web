import { useState } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { useLoginState } from "../../context/DataContext";
import { PageLoader } from "../Skeleton/Skeleton";
import "./Login.css";

export default function Login({ onNavigate }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const { loading, handleLogin } = useLoginState();

  const handleSubmit = async () => {
    setError("");
    const Phone = phone.trim();
    const Password = password.trim();
    if (!Phone) return setError("Vui lòng nhập số điện thoại.");
    if (!Password) return setError("Vui lòng nhập mật khẩu.");

    // TODO: call auth API
    const { data, error } = await handleLogin({
      phone: Phone,
      password: Password,
    });
    // console.log(error);
    if (error) return setError("Số điện thoại hoặc mật khẩu không tồn tại.");
    onNavigate?.("home");
  };

  if (loading) return <PageLoader></PageLoader>;

  return (
    <div className="login-page">
      <Navbar
        searchValue=""
        onSearchChange={() => {}}
        onNavigate={onNavigate}
      />

      <div className="login-hero">
        <div className="login-hero__bg" />
        <div className="login-hero__overlay" />

        <div className="login-card">
          <h1 className="login-card__title">Đăng nhập</h1>

          {error && <div className="login-card__error">{error}</div>}

          <input
            className="login-card__input"
            type="tel"
            placeholder="Số điện thoại:"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          <div className="login-card__pwd-wrap">
            <input
              className="login-card__input"
              // [MỚI] type thay đổi theo showPwd — "text" khi hiện, "password" khi ẩn
              type={showPwd ? "text" : "password"}
              placeholder="Mật khẩu:"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            {/* [MỚI] Nút toggle ẩn/hiện — chỉ hiện khi đã nhập mật khẩu */}
            {password && (
              <button
                type="button"
                className="login-card__pwd-toggle"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                tabIndex={-1}
              >
                {showPwd ? (
                  /* Icon mắt gạch (đang hiện → bấm để ẩn) */
                  <svg
                    width="16"
                    height="16"
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
                  /* Icon mắt (đang ẩn → bấm để hiện) */
                  <svg
                    width="16"
                    height="16"
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

          <button className="login-card__btn" onClick={handleSubmit}>
            Đăng nhập
          </button>

          <p className="login-card__footer-text">
            Chưa có tài khoản?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("register");
              }}
            >
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
