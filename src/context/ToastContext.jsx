import { createContext, useState, useCallback, useContext } from "react";

const ToastContext = createContext(null);

function GlobalToast() {
  const { toast } = useContext(ToastContext);

  if (!toast) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 9999,
        background: "var(--surface)",
        border: `1px solid var(--${toast.type === "error" ? "red" : "green"})`,
        borderRadius: "var(--radius-lg)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        animation: "toastIn 0.3s ease",
        maxWidth: "360px",
        fontSize: "13px",
        fontWeight: "500px",
        color: "var(--text)",
      }}
    >
      {/* Logic icon dựa trên biến toast.type */}
      {toast.type == "error" ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--red)"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />

          <line x1="12" y1="8" x2="12" y2="12" />

          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ) : (
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
      )}
      {toast.message}
    </div>
  );
}

/* ── 3. KHỞI TẠO LỚP PHÂN PHỐI VÀ GẮN DOM ── */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
      <GlobalToast />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast phải được gọi bên trong ToastProvider");
  }
  return context;
};
