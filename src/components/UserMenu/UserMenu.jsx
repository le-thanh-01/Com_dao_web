import { useState, useRef } from "react";
import { useLoginState } from "../../context/DataContext";
import { PageLoader } from "../Skeleton/Skeleton";
import "./UserMenu.css";

function UserMenuItems({ logined = false, onNavigate, handleLogout }) {
  const logout = async () => {
    const { data, error } = await handleLogout();
    if (!error) window.location.reload();
  };

  if (logined)
    return (
      <>
        <button
          className="user-menu__btn"
          onClick={() => {
            onNavigate?.("account");
          }}
        >
          Tài khoản
        </button>
        <button className="user-menu__btn btn--danger" onClick={logout}>
          Đăng xuất
        </button>
      </>
    );
  return (
    <>
      <button className="user-menu__btn" onClick={() => onNavigate?.("login")}>
        Đăng nhập
      </button>
      <button
        className="user-menu__btn user-menu__btn--primary"
        onClick={() => onNavigate?.("register")}
      >
        Đăng ký
      </button>
    </>
  );
}
export default function UserMenu({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const { loginState, loading, handleLogout } = useLoginState();
  const timerRef = useRef(null);
  // console.log(loginState);
  // console.log(handleLogout);
  // console.log(loading);
  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 150);
  };

  if (loading) return <PageLoader></PageLoader>;

  return (
    <div
      className="user-menu"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`user-menu__trigger ${open ? "user-menu__trigger--open" : ""}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </div>

      <div
        className={`user-menu__popup ${open ? "user-menu__popup--visible" : ""}`}
      >
        <UserMenuItems
          logined={loginState}
          onNavigate={onNavigate}
          handleLogout={handleLogout}
        ></UserMenuItems>
      </div>
    </div>
  );
}
